from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.notice import PlacementNotice
from app.schemas.notice import PlacementNoticeCreate, PlacementNoticeResponse
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()

@router.get("", response_model=List[PlacementNoticeResponse])
@router.get("/", response_model=List[PlacementNoticeResponse])
def get_all_notices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notices = db.query(PlacementNotice).order_by(PlacementNotice.created_at.desc()).all()
    return notices

@router.post("", response_model=PlacementNoticeResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PlacementNoticeResponse, status_code=status.HTTP_201_CREATED)
def create_notice(
    notice_in: PlacementNoticeCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    notice = PlacementNotice(
        title=notice_in.title,
        content=notice_in.content,
        priority=notice_in.priority
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return notice

@router.delete("/{notice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notice(
    notice_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    notice = db.query(PlacementNotice).filter(PlacementNotice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notice not found")
    
    db.delete(notice)
    db.commit()
    return None
