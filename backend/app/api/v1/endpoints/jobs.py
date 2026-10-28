from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.recruiter import CompanyProfile
from app.models.job import JobPosting, EligibilityCriteria
from app.models.application import Application
from app.schemas.job import (
    JobPostingCreate, JobPostingResponse, JobPostingWithEligibilityStatus
)
from app.api.deps import get_current_user, get_current_recruiter
from app.services.eligibility_service import evaluate_student_eligibility

router = APIRouter()

@router.post("", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
def create_job_posting(
    job_in: JobPostingCreate,
    company: CompanyProfile = Depends(get_current_recruiter),
    db: Session = Depends(get_db)
):
    job = JobPosting(
        company_id=company.id,
        title=job_in.title,
        description=job_in.description,
        ctc_lpa=job_in.ctc_lpa,
        location=job_in.location,
        job_type=job_in.job_type,
        deadline=job_in.deadline
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    eligibility = EligibilityCriteria(
        job_posting_id=job.id,
        min_cgpa=job_in.eligibility.min_cgpa,
        min_tenth_percentage=job_in.eligibility.min_tenth_percentage,
        min_twelfth_percentage=job_in.eligibility.min_twelfth_percentage,
        max_active_backlogs=job_in.eligibility.max_active_backlogs,
        graduation_year=job_in.eligibility.graduation_year,
        allowed_departments=job_in.eligibility.allowed_departments
    )
    db.add(eligibility)
    db.commit()
    db.refresh(job)
    return job

@router.get("", response_model=List[JobPostingWithEligibilityStatus])
@router.get("/", response_model=List[JobPostingWithEligibilityStatus])
def list_job_postings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    jobs = db.query(JobPosting).filter(JobPosting.is_active == 1).all()
    
    student_profile = None
    if current_user.role == UserRole.STUDENT:
        student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()

    results = []
    for job in jobs:
        is_eligible = True
        reasons = []
        has_applied = False
        app_status = None

        if current_user.role == UserRole.STUDENT and student_profile:
            is_eligible, reasons = evaluate_student_eligibility(student_profile, job.eligibility_criteria)
            app = db.query(Application).filter(
                Application.job_posting_id == job.id,
                Application.student_id == student_profile.id
            ).first()
            if app:
                has_applied = True
                app_status = app.status.value

        job_dict = JobPostingResponse.from_orm(job).dict()
        job_dict["is_eligible"] = is_eligible
        job_dict["eligibility_reasons"] = reasons
        job_dict["has_applied"] = has_applied
        job_dict["application_status"] = app_status
        results.append(job_dict)

    return results

@router.get("/{job_id}", response_model=JobPostingWithEligibilityStatus)
def get_job_posting(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")

    is_eligible = True
    reasons = []
    has_applied = False
    app_status = None

    if current_user.role == UserRole.STUDENT:
        student_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if student_profile:
            is_eligible, reasons = evaluate_student_eligibility(student_profile, job.eligibility_criteria)
            app = db.query(Application).filter(
                Application.job_posting_id == job.id,
                Application.student_id == student_profile.id
            ).first()
            if app:
                has_applied = True
                app_status = app.status.value

    job_dict = JobPostingResponse.from_orm(job).dict()
    job_dict["is_eligible"] = is_eligible
    job_dict["eligibility_reasons"] = reasons
    job_dict["has_applied"] = has_applied
    job_dict["application_status"] = app_status
    return job_dict
