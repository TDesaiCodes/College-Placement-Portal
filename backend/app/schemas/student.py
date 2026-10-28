from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.student import PlacementStatus

class StudentProfileBase(BaseModel):
    first_name: str
    last_name: str
    roll_number: str
    department: str
    graduation_year: int
    cgpa: float = Field(..., ge=0.0, le=10.0)
    tenth_percentage: float = Field(..., ge=0.0, le=100.0)
    twelfth_percentage: float = Field(..., ge=0.0, le=100.0)
    active_backlogs: int = Field(0, ge=0)
    cleared_backlogs: int = Field(0, ge=0)
    phone_number: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    active_backlogs: Optional[int] = None
    cleared_backlogs: Optional[int] = None
    phone_number: Optional[str] = None

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    resume_s3_key: Optional[str] = None
    placement_status: PlacementStatus
    created_at: datetime

    class Config:
        from_attributes = True
