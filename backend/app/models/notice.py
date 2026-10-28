import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime
from app.core.database import Base

class PriorityLevel(str, enum.Enum):
    NORMAL = "NORMAL"
    IMPORTANT = "IMPORTANT"
    URGENT = "URGENT"

class PlacementNotice(Base):
    __tablename__ = "placement_notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.NORMAL, nullable=False)
    posted_by = Column(String(100), default="TPO Placement Cell")
    created_at = Column(DateTime, default=datetime.utcnow)
