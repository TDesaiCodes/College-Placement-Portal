import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class PlacementStatus(str, enum.Enum):
    UNPLACED = "UNPLACED"
    PLACED = "PLACED"

class StudentProfile(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False, index=True)  # Computer Science, ECE, Mechanical, etc.
    graduation_year = Column(Integer, nullable=False, index=True)
    cgpa = Column(Float, nullable=False, index=True)
    tenth_percentage = Column(Float, nullable=False)
    twelfth_percentage = Column(Float, nullable=False)
    active_backlogs = Column(Integer, default=0)
    cleared_backlogs = Column(Integer, default=0)
    phone_number = Column(String(20), nullable=True)
    resume_s3_key = Column(String(500), nullable=True)
    placement_status = Column(Enum(PlacementStatus), default=PlacementStatus.UNPLACED)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
