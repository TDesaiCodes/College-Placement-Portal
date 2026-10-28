from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.job import JobPosting, EligibilityCriteria

class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, job_id: int) -> Optional[JobPosting]:
        return self.db.query(JobPosting).filter(JobPosting.id == job_id).first()

    def get_active_jobs(self) -> List[JobPosting]:
        return self.db.query(JobPosting).filter(JobPosting.is_active == 1).all()

    def create_job_with_eligibility(self, job: JobPosting, criteria: EligibilityCriteria) -> JobPosting:
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        criteria.job_posting_id = job.id
        self.db.add(criteria)
        self.db.commit()
        self.db.refresh(job)
        return job
