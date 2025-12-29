from fastapi import APIRouter , Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from database import subjects_collection, attendance_collection
from schemas.subject import SubjectCreate
from auth import decode_token
from deps import get_current_user


router = APIRouter(prefix = "/subjects", tags =["Subjects"])

@router.post("/")
def add_subject(
    subject: SubjectCreate ,
    current_user: dict = Depends(get_current_user)
):
    existing = subjects_collection.find_one({
       "user_id": current_user["id"],
       "name": subject.name 
    })
    if existing:
        raise HTTPException(status_code = 400 , detail="Subject already exists")

    subject_doc = {
        "user_id"  : current_user["id"],
        "name" : subject.name,
        "classes_per_week" : subject.classes_per_week,
        "created_at" : datetime.utcnow(),
        "is_active" : True
    }

    subject_id = subjects_collection.insert_one(subject_doc).inserted_id

    attendance_collection.insert_one({
        "user_id": current_user["id"],
        "subject_id": str(subject_id),
        "attended_count": 0,
        "missed_count": 0,
        "last_updated": datetime.utcnow()
    })

    return {"message" : "Subject added successfully"}

@router.get("/")
def get_subjects(current_user: dict = Depends(get_current_user)):
    subjects = subjects_collection.find({"user_id" : current_user["id"]})
    result = []

    for s in subjects:
        result.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "classes_per_week": s["classes_per_week"],
            "days": s.get("days", [])
        })
    return result