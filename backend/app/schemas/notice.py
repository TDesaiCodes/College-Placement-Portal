from datetime import datetime
from pydantic import BaseModel
from app.models.notice import PriorityLevel

class PlacementNoticeBase(BaseModel):
    title: str
    content: str
    priority: PriorityLevel = PriorityLevel.NORMAL

class PlacementNoticeCreate(PlacementNoticeBase):
    pass

class PlacementNoticeResponse(PlacementNoticeBase):
    id: int
    posted_by: str
    created_at: datetime

    class Config:
        from_attributes = True
