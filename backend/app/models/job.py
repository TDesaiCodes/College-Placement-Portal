import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Enum, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class JobType(str, enum.Enum):
    FULL_TIME = "FULL_TIME"
    INTERNSHIP = "INTERNSHIP"
    INTERNSHIP_PPO = "INTERNSHIP_PPO"

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    ctc_lpa = Column(Float, nullable=False, index=True)  # Cost to Company in LPA
    location = Column(String(200), nullable=False)
    job_type = Column(Enum(JobType), default=JobType.FULL_TIME)
    deadline = Column(DateTime, nullable=False)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("CompanyProfile", back_populates="job_postings")
    eligibility_criteria = relationship("EligibilityCriteria", back_populates="job_posting", uselist=False, cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job_posting", cascade="all, delete-orphan")

class EligibilityCriteria(Base):
    __tablename__ = "eligibility_criteria"

    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id", ondelete="CASCADE"), unique=True, nullable=False)
    min_cgpa = Column(Float, default=0.0)
    min_tenth_percentage = Column(Float, default=0.0)
    min_twelfth_percentage = Column(Float, default=0.0)
    max_active_backlogs = Column(Integer, default=0)
    graduation_year = Column(Integer, nullable=True)
    allowed_departments = Column(JSON, nullable=False)  # e.g., ["Computer Science", "Information Technology", "ECE"]

    # Relationships
    job_posting = relationship("JobPosting", back_populates="eligibility_criteria")
