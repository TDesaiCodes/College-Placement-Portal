from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.student import StudentProfile
from app.schemas.student import StudentProfileCreate, StudentProfileUpdate, StudentProfileResponse
from app.api.deps import get_current_user, get_current_student
from app.services.s3_service import s3_service

router = APIRouter()

@router.post("/profile", response_model=StudentProfileResponse, status_code=status.HTTP_201_CREATED)
def create_student_profile(
    profile_in: StudentProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profile already exists for this user")
    
    roll_check = db.query(StudentProfile).filter(StudentProfile.roll_number == profile_in.roll_number).first()
    if roll_check:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Roll number already registered")

    student = StudentProfile(
        user_id=current_user.id,
        **profile_in.dict()
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.get("/profile/me", response_model=StudentProfileResponse)
def get_my_profile(student: StudentProfile = Depends(get_current_student)):
    return student

@router.put("/profile/me", response_model=StudentProfileResponse)
def update_my_profile(
    profile_in: StudentProfileUpdate,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
    
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.post("/resume/presigned-url")
def get_resume_presigned_url(
    file_name: str = Query(..., description="Original filename e.g. resume.pdf"),
    student: StudentProfile = Depends(get_current_student)
):
    url_data = s3_service.generate_presigned_upload_url(file_name=file_name, roll_number=student.roll_number)
    return url_data

@router.post("/resume/confirm")
def confirm_resume_upload(
    s3_key: str = Query(..., description="S3 Key returned from presigned URL endpoint"),
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    student.resume_s3_key = s3_key
    db.add(student)
    db.commit()
    db.refresh(student)
    return {"message": "Resume uploaded and linked successfully", "s3_key": s3_key}

@router.get("/resume/download-url")
def get_resume_download_url(student: StudentProfile = Depends(get_current_student)):
    if not student.resume_s3_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume uploaded yet")
    download_url = s3_service.generate_presigned_download_url(student.resume_s3_key)
    return {"download_url": download_url}

# Mock routes for development S3 simulation
@router.post("/mock-s3-upload")
@router.put("/mock-s3-upload")
def mock_s3_upload(s3_key: str):
    return {"message": f"Simulated upload successful for key: {s3_key}"}

@router.get("/mock-s3-download")
def mock_s3_download(s3_key: str):
    # Simulated PDF content response
    return Response(
        content=f"%PDF-1.4 Mock Resume Document Content for S3 key {s3_key}",
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={s3_key}.pdf"}
    )
