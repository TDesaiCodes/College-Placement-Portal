from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.recruiter import CompanyProfile
from app.models.job import JobPosting
from app.models.application import Application, ApplicationStatus
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationStatusUpdate
from app.api.deps import get_current_user, get_current_student
from app.services.eligibility_service import evaluate_student_eligibility
from app.services.s3_service import s3_service

router = APIRouter()

@router.post("/apply", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_for_job(
    app_in: ApplicationCreate,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    job = db.query(JobPosting).filter(JobPosting.id == app_in.job_posting_id, JobPosting.is_active == 1).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job drive not found or inactive")

    # 1. Deadline Check
    if datetime.utcnow() > job.deadline:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application deadline for this drive has passed")

    # 2. Existing Application Check
    existing_app = db.query(Application).filter(
        Application.job_posting_id == job.id,
        Application.student_id == student.id
    ).first()
    if existing_app:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already applied for this job drive")

    # 3. Resume Check
    if not student.resume_s3_key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload your resume to your profile before applying")

    # 4. Strict Server-Side Eligibility Validation Engine
    is_eligible, reasons = evaluate_student_eligibility(student, job.eligibility_criteria)
    if not is_eligible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Eligibility check failed: {'; '.join(reasons)}"
        )

    application = Application(
        job_posting_id=job.id,
        student_id=student.id,
        status=ApplicationStatus.APPLIED,
        remarks=app_in.remarks
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@router.get("/student/me", response_model=List[ApplicationResponse])
def get_my_applications(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(Application.student_id == student.id).all()
    return apps

@router.get("/job/{job_id}", response_model=List[ApplicationResponse])
def get_applications_for_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job drive not found")

    # Authorize: Recruiter owning the job OR Admin
    if current_user.role == UserRole.RECRUITER:
        company = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
        if not company or job.company_id != company.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view applicants for this job")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    apps = db.query(Application).filter(Application.job_posting_id == job_id).all()
    return apps

@router.put("/{app_id}/status", response_model=ApplicationResponse)
def update_application_status(
    app_id: int,
    status_in: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Authorize: Recruiter owning the job OR Admin
    if current_user.role == UserRole.RECRUITER:
        company = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
        if not company or app.job_posting.company_id != company.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this application")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    app.status = status_in.status
    if status_in.remarks:
        app.remarks = status_in.remarks

    db.add(app)
    db.commit()
    db.refresh(app)
    return app

@router.put("/{app_id}/respond-offer", response_model=ApplicationResponse)
def respond_to_job_offer(
    app_id: int,
    action: str,  # "ACCEPT" or "DECLINE"
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.student_id == student.id
    ).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    if app.status != ApplicationStatus.OFFERED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only respond to applications with status OFFERED")

    if action.upper() == "ACCEPT":
        app.status = ApplicationStatus.ACCEPTED
        from app.models.student import PlacementStatus
        student.placement_status = PlacementStatus.PLACED
        db.add(student)
    elif action.upper() == "DECLINE":
        app.status = ApplicationStatus.DECLINED
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be ACCEPT or DECLINE")

    db.add(app)
    db.commit()
    db.refresh(app)
    return app

