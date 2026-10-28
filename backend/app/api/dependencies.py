from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.recruiter import CompanyProfile
from app.repositories.user_repository import UserRepository
from app.repositories.student_repository import StudentRepository
from app.repositories.job_repository import JobRepository
from app.repositories.application_repository import ApplicationRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Database session dependency injection
def get_db_session() -> Generator[Session, None, None]:
    yield from get_db()

# Repository dependency injection
def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_student_repository(db: Session = Depends(get_db)) -> StudentRepository:
    return StudentRepository(db)

def get_job_repository(db: Session = Depends(get_db)) -> JobRepository:
    return JobRepository(db)

def get_application_repository(db: Session = Depends(get_db)) -> ApplicationRepository:
    return ApplicationRepository(db)

# Authentication & RBAC Dependencies
def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = int(payload["sub"])
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or not found")
    return user

def get_current_student(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> StudentProfile:
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student role access required")
    
    student_repo = StudentRepository(db)
    student = student_repo.get_by_user_id(current_user.id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found. Please setup profile first.")
    return student

def get_current_recruiter(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> CompanyProfile:
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter role access required")
    
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not created yet")
    if not company.is_approved:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter account pending TPO/Admin approval")
    return company

def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="TPO / Admin access required")
    return current_user
