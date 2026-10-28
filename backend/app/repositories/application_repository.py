from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.application import Application

class ApplicationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, app_id: int) -> Optional[Application]:
        return self.db.query(Application).filter(Application.id == app_id).first()

    def get_by_student_and_job(self, student_id: int, job_id: int) -> Optional[Application]:
        return self.db.query(Application).filter(
            Application.student_id == student_id,
            Application.job_posting_id == job_id
        ).first()

    def get_by_student_id(self, student_id: int) -> List[Application]:
        return self.db.query(Application).filter(Application.student_id == student_id).all()

    def get_by_job_id(self, job_id: int) -> List[Application]:
        return self.db.query(Application).filter(Application.job_posting_id == job_id).all()

    def create(self, application: Application) -> Application:
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application

    def update(self, application: Application) -> Application:
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application
