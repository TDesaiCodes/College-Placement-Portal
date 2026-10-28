from typing import Tuple, List
from app.models.student import StudentProfile
from app.models.job import EligibilityCriteria

def evaluate_student_eligibility(
    student: StudentProfile,
    criteria: EligibilityCriteria
) -> Tuple[bool, List[str]]:
    reasons = []

    if not student:
        return False, ["Student profile does not exist."]

    # 1. CGPA check
    if student.cgpa < criteria.min_cgpa:
        reasons.append(f"CGPA ({student.cgpa}) is below required minimum ({criteria.min_cgpa}).")

    # 2. Backlogs check
    if student.active_backlogs > criteria.max_active_backlogs:
        reasons.append(f"Active backlogs ({student.active_backlogs}) exceed allowed maximum ({criteria.max_active_backlogs}).")

    # 3. Department check
    allowed_deps = criteria.allowed_departments or []
    if allowed_deps and student.department not in allowed_deps:
        reasons.append(f"Department '{student.department}' is not eligible for this drive.")

    # 4. Graduation year check
    if criteria.graduation_year and student.graduation_year != criteria.graduation_year:
        reasons.append(f"Graduation year ({student.graduation_year}) does not match drive requirement ({criteria.graduation_year}).")

    # 5. 10th & 12th percentage checks
    if criteria.min_tenth_percentage > 0 and student.tenth_percentage < criteria.min_tenth_percentage:
        reasons.append(f"10th percentage ({student.tenth_percentage}%) below required ({criteria.min_tenth_percentage}%).")

    if criteria.min_twelfth_percentage > 0 and student.twelfth_percentage < criteria.min_twelfth_percentage:
        reasons.append(f"12th percentage ({student.twelfth_percentage}%) below required ({criteria.min_twelfth_percentage}%).")

    is_eligible = len(reasons) == 0
    return is_eligible, reasons
