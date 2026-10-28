from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.student import StudentProfile

class StudentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: int) -> Optional[StudentProfile]:
        return self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

    def get_by_roll_number(self, roll_number: str) -> Optional[StudentProfile]:
        return self.db.query(StudentProfile).filter(StudentProfile.roll_number == roll_number).first()

    def get_all(self) -> List[StudentProfile]:
        return self.db.query(StudentProfile).all()

    def create(self, student: StudentProfile) -> StudentProfile:
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        return student

    def update(self, student: StudentProfile) -> StudentProfile:
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        return student
