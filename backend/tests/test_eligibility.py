import pytest
from app.models.student import StudentProfile
from app.models.job import EligibilityCriteria
from app.services.eligibility_service import evaluate_student_eligibility

def test_eligible_student():
    student = StudentProfile(
        cgpa=8.5,
        active_backlogs=0,
        department="Computer Science",
        graduation_year=2026,
        tenth_percentage=85.0,
        twelfth_percentage=80.0
    )
    criteria = EligibilityCriteria(
        min_cgpa=7.5,
        max_active_backlogs=0,
        allowed_departments=["Computer Science", "Information Technology"],
        graduation_year=2026,
        min_tenth_percentage=60.0,
        min_twelfth_percentage=60.0
    )

    is_eligible, reasons = evaluate_student_eligibility(student, criteria)
    assert is_eligible is True
    assert len(reasons) == 0

def test_ineligible_student_low_cgpa():
    student = StudentProfile(
        cgpa=6.5,
        active_backlogs=0,
        department="Computer Science",
        graduation_year=2026,
        tenth_percentage=85.0,
        twelfth_percentage=80.0
    )
    criteria = EligibilityCriteria(
        min_cgpa=7.5,
        max_active_backlogs=0,
        allowed_departments=["Computer Science"],
        graduation_year=2026,
        min_tenth_percentage=60.0,
        min_twelfth_percentage=60.0
    )

    is_eligible, reasons = evaluate_student_eligibility(student, criteria)
    assert is_eligible is False
    assert any("CGPA" in r for r in reasons)
