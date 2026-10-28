from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl

class CompanyProfileBase(BaseModel):
    company_name: str
    industry: str
    website: Optional[str] = None
    description: Optional[str] = None
    hr_contact_name: str
    hr_contact_phone: str

class CompanyProfileCreate(CompanyProfileBase):
    pass

class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    hr_contact_name: Optional[str] = None
    hr_contact_phone: Optional[str] = None

class CompanyProfileResponse(CompanyProfileBase):
    id: int
    user_id: int
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True
