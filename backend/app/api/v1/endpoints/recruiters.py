from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.recruiter import CompanyProfile
from app.schemas.recruiter import CompanyProfileCreate, CompanyProfileUpdate, CompanyProfileResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/profile", response_model=CompanyProfileResponse, status_code=status.HTTP_201_CREATED)
def create_company_profile(
    profile_in: CompanyProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_profile = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company profile already exists")
    
    company = CompanyProfile(
        user_id=current_user.id,
        is_approved=False,  # Needs Admin/TPO approval
        **profile_in.dict()
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

@router.get("/profile/me", response_model=CompanyProfileResponse)
def get_my_company_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not created")
    return company

@router.put("/profile/me", response_model=CompanyProfileResponse)
def update_company_profile(
    profile_in: CompanyProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not created")
    
    update_data = profile_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
        
    db.add(company)
    db.commit()
    db.refresh(company)
    return company
