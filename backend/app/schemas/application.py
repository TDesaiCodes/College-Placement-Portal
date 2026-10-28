from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.application import ApplicationStatus
from app.schemas.student import StudentProfileResponse
from app.schemas.job import JobPostingResponse

class ApplicationCreate(BaseModel):
    job_posting_id: int
    remarks: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    remarks: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    job_posting_id: int
    student_id: int
    status: ApplicationStatus
    remarks: Optional[str] = None
    applied_at: datetime
    updated_at: datetime
    student: Optional[StudentProfileResponse] = None
    job_posting: Optional[JobPostingResponse] = None

    class Config:
        from_attributes = True
