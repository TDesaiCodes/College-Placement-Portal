from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.job import JobType
from app.schemas.recruiter import CompanyProfileResponse

class EligibilityCriteriaBase(BaseModel):
    min_cgpa: float = Field(0.0, ge=0.0, le=10.0)
    min_tenth_percentage: float = Field(0.0, ge=0.0, le=100.0)
    min_twelfth_percentage: float = Field(0.0, ge=0.0, le=100.0)
    max_active_backlogs: int = Field(0, ge=0)
    graduation_year: Optional[int] = None
    allowed_departments: List[str]  # e.g., ["Computer Science", "ECE"]

class EligibilityCriteriaResponse(EligibilityCriteriaBase):
    id: int
    job_posting_id: int

    class Config:
        from_attributes = True

class JobPostingBase(BaseModel):
    title: str
    description: str
    ctc_lpa: float = Field(..., gt=0)
    location: str
    job_type: JobType = JobType.FULL_TIME
    deadline: datetime

class JobPostingCreate(JobPostingBase):
    eligibility: EligibilityCriteriaBase

class JobPostingResponse(JobPostingBase):
    id: int
    company_id: int
    is_active: int
    created_at: datetime
    company: Optional[CompanyProfileResponse] = None
    eligibility_criteria: Optional[EligibilityCriteriaResponse] = None

    class Config:
        from_attributes = True

class JobPostingWithEligibilityStatus(JobPostingResponse):
    is_eligible: bool
    eligibility_reasons: List[str] = []
    has_applied: bool = False
    application_status: Optional[str] = None
