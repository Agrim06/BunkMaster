from pydantic import BaseModel, Field
from typing import List, Optional

class SubjectCreate(BaseModel):
    name: str
    classes_per_week: int = Field(gt=0)
    days: List[str]
    min_attendance: Optional[int] = 75

class SubjectResponse(BaseModel):
    id: str
    name: str
    classes_per_week: int
    days: List[str]