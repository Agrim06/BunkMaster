from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class AttendanceUpdate(BaseModel):
    attended: bool  
    date: Optional[datetime] = None

class AttendanceSummary(BaseModel):
    subject_id: str
    subject_name: str
    attended_count: int
    missed_count: int
    attendance_percentage: float
    safe_bunk : int 
    status: str
    min_attendance: int
