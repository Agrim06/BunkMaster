from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from datetime import datetime
from bson import ObjectId
from pymongo import DESCENDING
import io
import csv
from schemas.attendance import AttendanceUpdate
from deps import get_current_user
from services.attendance_service import (calculate_safe_bunk , calculate_attendance_percentage)
from database import attendance_logs_collection , attendance_collection , subjects_collection

router = APIRouter(prefix="/attendance" , tags=["Attendance"])

@router.get("/download")
def download_attendance(current_user: dict = Depends(get_current_user)):
    subjects = list(subjects_collection.find({"user_id": current_user["id"]}))
    subject_map = {str(s["_id"]): s["name"] for s in subjects}
    
    logs = list(attendance_logs_collection.find({"user_id": current_user["id"]}))
    
    logs.sort(key=lambda x: (subject_map.get(x["subject_id"], "Unknown"), -x["timestamp"].timestamp()))
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Subject", "Status"])
    
    for log in logs:
        subject_name = subject_map.get(log["subject_id"], "Unknown")
        status = "Present" if log["attended"] else "Absent"
        date_str = log["timestamp"].strftime("%Y-%m-%d")
        writer.writerow([date_str, subject_name, status])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_data_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )

@router.post("/{subject_id}")
def add_attendance(
    subject_id : str,
    data : AttendanceUpdate,
    current_user : dict = Depends(get_current_user)
):
    attendance  = attendance_collection.find_one({
        "user_id" : current_user["id"],
        "subject_id" : subject_id
    })

    if not attendance :
        
        subject_record = subjects_collection.find_one({
             "_id": ObjectId(subject_id), 
             "user_id": current_user["id"]
        })
        
        if not subject_record:
            raise HTTPException(status_code=404 , detail="Subject not found")

        attendance = {
            "user_id": current_user["id"],
            "subject_id": subject_id,
            "attended_count": 0,
            "missed_count": 0,
            "last_updated": datetime.utcnow()
        }
        result = attendance_collection.insert_one(attendance)
        attendance["_id"] = result.inserted_id
    
    request_date = data.date if data.date else datetime.utcnow()
    start_of_day = request_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = request_date.replace(hour=23, minute=59, second=59, microsecond=999999)

    existing_log = attendance_logs_collection.find_one({
        "user_id" : current_user["id"],
        "subject_id" : subject_id,
        "timestamp" : {"$gte" : start_of_day, "$lte":end_of_day}
    })
    
    if existing_log:
        if existing_log["attended"] == data.attended:
            return {"message": "Attendance already marked for today!"}

        attendance_logs_collection.update_one(
            {"_id": existing_log["_id"]},
            {"$set": {"attended": data.attended, "timestamp": request_date}}
        )

        inc_attended = 1 if data.attended else -1
        inc_missed = -1 if data.attended else 1

        attendance_collection.update_one(
            {"_id": attendance["_id"]},
            {
                "$inc":{
                    "attended_count" : inc_attended,
                    "missed_count" : inc_missed
                },
                "$set":{"last_updated": datetime.utcnow()}
            }
        )
        return {"message" : "Attendance updated for today!"}
    else:
        update_field = "attended_count" if data.attended else "missed_count"

        attendance_collection.update_one(
            {"_id" : attendance["_id"]},
            {
                "$inc" : {update_field : 1},
                "$set" : {"last_updated" : datetime.utcnow()}
            }
        )
        timestamp = data.date if data.date else datetime.utcnow()

        log_entry = {
            "user_id" : current_user["id"],
            "subject_id" : subject_id,
            "attended" : data.attended,
            "timestamp" : timestamp
        }

        attendance_logs_collection.insert_one(log_entry)

        return {"message" : "Attendance Recorded!"}

@router.delete("/{subject_id}")
def delete_attendance(
    subject_id: str,
    date: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    start_of_day = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = dt.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    log = attendance_logs_collection.find_one({
        "user_id": current_user["id"],
        "subject_id": subject_id,
        "timestamp": {"$gte": start_of_day, "$lte": end_of_day}
    })
    
    if not log:
        raise HTTPException(status_code=404, detail="Attendance log not found for this date")
    
    # Update summarized counts
    update_field = "attended_count" if log["attended"] else "missed_count"
    attendance_collection.update_one(
        {"user_id": current_user["id"], "subject_id": subject_id},
        {"$inc": {update_field: -1}, "$set": {"last_updated": datetime.utcnow()}}
    )
    
    # Remove the specific log entry
    attendance_logs_collection.delete_one({"_id": log["_id"]})
    
    return {"message": "Attendance cleared for the day"}

@router.get("/summary" )
def attendance_summary( current_user: dict = Depends(get_current_user)):
    subjects = subjects_collection.find({"user_id" : current_user["id"]})

    summary = []

    for s in subjects:
        attendance = attendance_collection.find_one({
            "user_id"  : current_user["id"],
            "subject_id" : str(s["_id"])
        })

        if not attendance:
            attended = 0
            missed = 0
        else:
            attended = attendance.get("attended_count" , 0)
            missed = attendance.get("missed_count", 0)
    
        total = attended + missed
        percentage = calculate_attendance_percentage(attended , total)

        target_attendance = s.get("min_attendance") or current_user.get("min_attendance", 75)
        min_percentage_decimal = target_attendance / 100.0

        safe_bunk = calculate_safe_bunk(attended , total , min_percentage_decimal)

        status = "SAFE"

        if percentage < target_attendance:
            status = "SHORTAGE"
        elif safe_bunk == 0:
            status = "BORDERLINE"

        summary.append({
            "subject_id": str(s["_id"]),
            "subject_name": s["name"],
            "attended_count": attended,
            "missed_count": missed,
            "attendance_percentage": round(percentage) ,
            "safe_bunk" : safe_bunk  ,
            "status" : status,
            "min_attendance" : target_attendance,
            "days": s.get("days", [])
        })

    return summary

@router.get("/history/{subject_id}")
def get_attendance_history(
    subject_id : str,
    current_user : dict = Depends(get_current_user)
):
    history = attendance_logs_collection.find({
        "user_id" : current_user["id"],
        "subject_id" : subject_id,
    }).sort("timestamp" , DESCENDING)

    return[{
        "date" : log["timestamp"],
        "attended" : log["attended"],
        "id" : str(log["_id"])
    }for log in history]
