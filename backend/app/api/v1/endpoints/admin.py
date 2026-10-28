import csv
import io
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.student import StudentProfile, PlacementStatus
from app.models.recruiter import CompanyProfile
from app.models.job import JobPosting
from app.models.application import Application, ApplicationStatus
from app.schemas.recruiter import CompanyProfileResponse
from app.schemas.student import StudentProfileResponse
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/analytics")
def get_placement_analytics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_students = db.query(func.count(StudentProfile.id)).scalar() or 0
    placed_students = db.query(func.count(StudentProfile.id)).filter(StudentProfile.placement_status == PlacementStatus.PLACED).scalar() or 0
    unplaced_students = total_students - placed_students

    placement_percentage = (placed_students / total_students * 100) if total_students > 0 else 0.0

    total_drives = db.query(func.count(JobPosting.id)).scalar() or 0
    avg_ctc = db.query(func.avg(JobPosting.ctc_lpa)).scalar() or 0.0
    highest_ctc = db.query(func.max(JobPosting.ctc_lpa)).scalar() or 0.0

    # Department-wise breakdown
    dept_stats = db.query(
        StudentProfile.department,
        func.count(StudentProfile.id).label("total"),
        func.sum(func.IF(StudentProfile.placement_status == PlacementStatus.PLACED, 1, 0)).label("placed")
    ).group_by(StudentProfile.department).all()

    department_breakdown = []
    for dept, total, placed in dept_stats:
        placed_count = placed or 0
        department_breakdown.append({
            "department": dept,
            "total_students": total,
            "placed_students": placed_count,
            "placement_rate": round((placed_count / total * 100) if total > 0 else 0, 2)
        })

    return {
        "total_students": total_students,
        "placed_students": placed_students,
        "unplaced_students": unplaced_students,
        "placement_percentage": round(placement_percentage, 2),
        "total_job_drives": total_drives,
        "avg_ctc_lpa": round(avg_ctc, 2),
        "highest_ctc_lpa": round(highest_ctc, 2),
        "department_breakdown": department_breakdown
    }

@router.get("/export-placements-csv")
def export_placements_csv(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Student ID", "Full Name", "Roll Number", "Department",
        "CGPA", "Active Backlogs", "Placement Status", "Company Placed", "Package (CTC LPA)", "Contact Phone"
    ])

    students = db.query(StudentProfile).all()
    for s in students:
        placed_app = db.query(Application).filter(
            Application.student_id == s.id,
            Application.status.in_([ApplicationStatus.ACCEPTED, ApplicationStatus.OFFERED])
        ).first()

        company_name = placed_app.job_posting.company.company_name if (placed_app and placed_app.job_posting and placed_app.job_posting.company) else "N/A"
        ctc = placed_app.job_posting.ctc_lpa if (placed_app and placed_app.job_posting) else "N/A"

        writer.writerow([
            s.id,
            s.full_name,
            s.roll_number,
            s.department,
            s.cgpa,
            s.active_backlogs,
            s.placement_status.value if s.placement_status else "UNPLACED",
            company_name,
            ctc,
            s.phone_number or "N/A"
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=placement_report.csv"}
    )

@router.get("/recruiters/pending", response_model=List[CompanyProfileResponse])
def get_pending_recruiters(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    pending = db.query(CompanyProfile).filter(CompanyProfile.is_approved == False).all()
    return pending

@router.put("/recruiters/{company_id}/approve")
def toggle_recruiter_approval(
    company_id: int,
    approve: bool = True,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    company = db.query(CompanyProfile).filter(CompanyProfile.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")

    company.is_approved = approve
    db.add(company)
    db.commit()
    db.refresh(company)
    return {"message": f"Company '{company.company_name}' approval set to {approve}", "company_id": company.id, "is_approved": company.is_approved}

@router.get("/students", response_model=List[StudentProfileResponse])
def get_all_students(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    students = db.query(StudentProfile).all()
    return students

