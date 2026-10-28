from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.student import StudentProfile, PlacementStatus
from app.models.job import JobPosting

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_tpo_analytics() -> dict:
        pass

    def calculate_placement_metrics(self) -> dict:
        total_students = self.db.query(func.count(StudentProfile.id)).scalar() or 0
        placed_students = self.db.query(func.count(StudentProfile.id)).filter(StudentProfile.placement_status == PlacementStatus.PLACED).scalar() or 0
        unplaced_students = total_students - placed_students

        placement_percentage = (placed_students / total_students * 100) if total_students > 0 else 0.0

        total_drives = self.db.query(func.count(JobPosting.id)).scalar() or 0
        avg_ctc = self.db.query(func.avg(JobPosting.ctc_lpa)).scalar() or 0.0
        highest_ctc = self.db.query(func.max(JobPosting.ctc_lpa)).scalar() or 0.0

        return {
            "total_students": total_students,
            "placed_students": placed_students,
            "unplaced_students": unplaced_students,
            "placement_percentage": round(placement_percentage, 2),
            "total_job_drives": total_drives,
            "avg_ctc_lpa": round(avg_ctc, 2),
            "highest_ctc_lpa": round(highest_ctc, 2)
        }
