from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from schemas.attendance import AttendanceUpdate
from deps import get_current_user
from services.attendance_service import (calculate_safe_bunk , calculate_attendance_percentage)
from database import attendance_logs_collection , attendance_collection , subjects_collection


router = APIRouter(prefix="/attendance" , tags=["Attendance"])

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
        # Verify if the subject exists for this user
        subject_record = subjects_collection.find_one({
             "_id": ObjectId(subject_id), 
             "user_id": current_user["id"]
        })
        
        if not subject_record:
            raise HTTPException(status_code=404 , detail="Subject not found")

        # If subject exists but attendance record is missing, create it (Self-Healing)
        attendance = {
            "user_id": current_user["id"],
            "subject_id": subject_id,
            "attended_count": 0,
            "missed_count": 0,
            "last_updated": datetime.utcnow()
        }
        result = attendance_collection.insert_one(attendance)
        attendance["_id"] = result.inserted_id
    
    update_field = "attended_count" if data.attended else "missed_count"

    attendance_collection.update_one(
        {"_id" : attendance["_id"]},
        {
            "$inc" : {update_field : 1},
            "$set" : {"last_updated" : datetime.utcnow()}
        }
    )

    log_entry = {
        "user_id" : current_user["id"],
        "subject_id" : subject_id,
        "attended" : data.attended,
        "timestamp" : datetime.utcnow()
    }

    attendance_logs_collection.insert_one(log_entry)

    return {"message" : "Attendance Updated!"}

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

        user_min_attendance = current_user.get("min_attendance", 75)
        min_percentage_decimal = user_min_attendance / 100.0

        safe_bunk = calculate_safe_bunk(attended , total , min_percentage_decimal)

        status = "SAFE"

        if percentage < user_min_attendance:
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
            "status" : status
        })

    return summary