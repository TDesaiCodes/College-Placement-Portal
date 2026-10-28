from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class CompanyProfile(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name = Column(String(200), nullable=False, index=True)
    industry = Column(String(100), nullable=False)
    website = Column(String(255), nullable=True)
    description = Column(String(1000), nullable=True)
    hr_contact_name = Column(String(100), nullable=False)
    hr_contact_phone = Column(String(20), nullable=False)
    is_approved = Column(Boolean, default=False, index=True)  # Requires Admin/TPO approval before posting drives
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="company_profile")
    job_postings = relationship("JobPosting", back_populates="company", cascade="all, delete-orphan")
