import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class ApplicationStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    SHORTLISTED = "SHORTLISTED"
    ASSESSMENT_SCHEDULED = "ASSESSMENT_SCHEDULED"
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED"
    OFFERED = "OFFERED"
    REJECTED = "REJECTED"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"

class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint('job_posting_id', 'student_id', name='unique_job_student_application'),
    )

    id = Column(Integer, primary_key=True, index=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False, index=True)
    remarks = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job_posting = relationship("JobPosting", back_populates="applications")
    student = relationship("StudentProfile", back_populates="applications")
