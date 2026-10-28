from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.student import StudentProfile, PlacementStatus
from app.models.recruiter import CompanyProfile
from app.models.job import JobPosting, EligibilityCriteria, JobType
from app.models.application import Application, ApplicationStatus
from app.models.notice import PlacementNotice, PriorityLevel
from app.core.security import get_password_hash
from app.core.logging import logger

def init_db(db: Session) -> None:
    # 1. TPO Admin User
    admin_email = "admin@college.edu"
    admin = db.query(User).filter(User.email == admin_email).first()
    if not admin:
        admin_user = User(
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        logger.info(f"Initialized default TPO Admin: {admin_email}")

    # 2. Recruiter Users & Company Profiles
    recruiters_data = [
        {
            "email": "hr@techcorp.com",
            "password": "recruiter123",
            "company_name": "TechCorp Systems",
            "website": "https://techcorp.com",
            "contact": "+1 800-555-0199",
            "approved": True
        },
        {
            "email": "hr@cloudscale.io",
            "password": "recruiter123",
            "company_name": "CloudScale Solutions",
            "website": "https://cloudscale.io",
            "contact": "+1 800-555-0288",
            "approved": True
        },
        {
            "email": "hr@innovate.ai",
            "password": "recruiter123",
            "company_name": "Innovate AI Labs",
            "website": "https://innovate.ai",
            "contact": "+1 800-555-0377",
            "approved": False  # Pending TPO approval for demo
        }
    ]

    for r_data in recruiters_data:
        r_user = db.query(User).filter(User.email == r_data["email"]).first()
        if not r_user:
            r_user = User(
                email=r_data["email"],
                password_hash=get_password_hash(r_data["password"]),
                role=UserRole.RECRUITER,
                is_active=True
            )
            db.add(r_user)
            db.commit()
            db.refresh(r_user)

            company = CompanyProfile(
                user_id=r_user.id,
                company_name=r_data["company_name"],
                industry=r_data.get("industry", "Software & Technology"),
                website=r_data["website"],
                description=r_data.get("description", "Leading technology solution provider"),
                hr_contact_name=r_data.get("hr_name", "Global HR Recruitment Team"),
                hr_contact_phone=r_data["contact"],
                is_approved=r_data["approved"]
            )
            db.add(company)
            db.commit()
            logger.info(f"Initialized Recruiter: {r_data['email']} ({r_data['company_name']})")

    # 3. Student Users & Profiles
    students_data = [
        {
            "email": "alex.student@college.edu",
            "password": "student123",
            "roll": "CS2026001",
            "name": "Alex Rivers",
            "dept": "Computer Science",
            "cgpa": 8.8,
            "backlogs": 0,
            "tenth": 92.5,
            "twelfth": 90.0,
            "grad_year": 2026,
            "phone": "+91 98765 43210",
            "s3_key": "resumes/CS2026001_alex_rivers.pdf"
        },
        {
            "email": "sarah.student@college.edu",
            "password": "student123",
            "roll": "EC2026042",
            "name": "Sarah Chen",
            "dept": "Electronics & Communication",
            "cgpa": 7.4,
            "backlogs": 1,
            "tenth": 88.0,
            "twelfth": 85.5,
            "grad_year": 2026,
            "phone": "+91 98765 43211",
            "s3_key": "resumes/EC2026042_sarah_chen.pdf"
        },
        {
            "email": "marcus.student@college.edu",
            "password": "student123",
            "roll": "ME2026089",
            "name": "Marcus Vance",
            "dept": "Mechanical Engineering",
            "cgpa": 9.1,
            "backlogs": 0,
            "tenth": 95.0,
            "twelfth": 94.0,
            "grad_year": 2026,
            "phone": "+91 98765 43212",
            "s3_key": "resumes/ME2026089_marcus_vance.pdf"
        }
    ]

    for s_data in students_data:
        s_user = db.query(User).filter(User.email == s_data["email"]).first()
        if not s_user:
            s_user = User(
                email=s_data["email"],
                password_hash=get_password_hash(s_data["password"]),
                role=UserRole.STUDENT,
                is_active=True
            )
            db.add(s_user)
            db.commit()
            db.refresh(s_user)

            name_parts = s_data["name"].split(" ", 1)
            first_n = name_parts[0]
            last_n = name_parts[1] if len(name_parts) > 1 else ""

            student = StudentProfile(
                user_id=s_user.id,
                first_name=first_n,
                last_name=last_n,
                roll_number=s_data["roll"],
                department=s_data["dept"],
                cgpa=s_data["cgpa"],
                tenth_percentage=s_data["tenth"],
                twelfth_percentage=s_data["twelfth"],
                active_backlogs=s_data["backlogs"],
                graduation_year=s_data["grad_year"],
                phone_number=s_data["phone"],
                resume_s3_key=s_data["s3_key"],
                placement_status=PlacementStatus.UNPLACED
            )
            db.add(student)
            db.commit()
            logger.info(f"Initialized Student: {s_data['email']} ({s_data['name']})")

    # 4. Job Postings & Eligibility Criteria
    techcorp = db.query(CompanyProfile).filter(CompanyProfile.company_name == "TechCorp Systems").first()
    cloudscale = db.query(CompanyProfile).filter(CompanyProfile.company_name == "CloudScale Solutions").first()

    if techcorp:
        job1 = db.query(JobPosting).filter(JobPosting.title == "Senior Software Engineer - Full Stack").first()
        if not job1:
            job1 = JobPosting(
                company_id=techcorp.id,
                title="Senior Software Engineer - Full Stack",
                description="We are seeking talented full-stack engineers skilled in Python/FastAPI, React.js, and Cloud Architectures to build high-scale distributed systems.",
                ctc_lpa=18.5,
                location="Bengaluru / Hybrid",
                job_type=JobType.FULL_TIME,
                deadline=datetime.utcnow() + timedelta(days=30),
                is_active=1
            )
            db.add(job1)
            db.commit()
            db.refresh(job1)

            crit1 = EligibilityCriteria(
                job_posting_id=job1.id,
                min_cgpa=7.5,
                min_tenth_percentage=75.0,
                min_twelfth_percentage=75.0,
                max_active_backlogs=0,
                graduation_year=2026,
                allowed_departments=["Computer Science", "Electronics & Communication"]
            )
            db.add(crit1)
            db.commit()
            logger.info("Initialized Job Posting: TechCorp Systems Full Stack Engineer")

    if cloudscale:
        job2 = db.query(JobPosting).filter(JobPosting.title == "Cloud Infrastructure Engineer").first()
        if not job2:
            job2 = JobPosting(
                company_id=cloudscale.id,
                title="Cloud Infrastructure Engineer",
                description="Join CloudScale to manage Kubernetes clusters, AWS cloud deployment pipelines, and CI/CD automation systems for enterprise clients.",
                ctc_lpa=12.0,
                location="Hyderabad / Remote",
                job_type=JobType.INTERNSHIP_PPO,
                deadline=datetime.utcnow() + timedelta(days=20),
                is_active=1
            )
            db.add(job2)
            db.commit()
            db.refresh(job2)

            crit2 = EligibilityCriteria(
                job_posting_id=job2.id,
                min_cgpa=7.0,
                min_tenth_percentage=70.0,
                min_twelfth_percentage=70.0,
                max_active_backlogs=1,
                graduation_year=2026,
                allowed_departments=["Computer Science", "Electronics & Communication", "Mechanical Engineering"]
            )
            db.add(crit2)
            db.commit()
            logger.info("Initialized Job Posting: CloudScale Solutions Cloud Infra Engineer")

    # 5. Placement Notices
    notice1 = db.query(PlacementNotice).filter(PlacementNotice.title == "TechCorp Systems Online Assessment Schedule").first()
    if not notice1:
        n1 = PlacementNotice(
            title="TechCorp Systems Online Assessment Schedule",
            content="Shortlisted candidates for TechCorp Systems must complete the online coding assessment by Aug 20, 11:59 PM. System requirement details have been emailed.",
            priority=PriorityLevel.URGENT,
            posted_by="TPO Placement Cell"
        )
        n2 = PlacementNotice(
            title="Resume Verification Deadline Extended",
            content="Students updating their CGPA or uploading new resumes are advised that the verification portal will close on Aug 25.",
            priority=PriorityLevel.IMPORTANT,
            posted_by="TPO Placement Cell"
        )
        n3 = PlacementNotice(
            title="Technical Interview Workshop by Alumni Team",
            content="Join us this Saturday at 3:00 PM for an interactive system design and coding mock interview session with alumni from Amazon and Microsoft.",
            priority=PriorityLevel.NORMAL,
            posted_by="Career Development Cell"
        )
        db.add_all([n1, n2, n3])
        db.commit()
        logger.info("Initialized Placement Notices")

    # 6. Sample Applications
    alex = db.query(StudentProfile).filter(StudentProfile.roll_number == "CS2026001").first()
    sarah = db.query(StudentProfile).filter(StudentProfile.roll_number == "EC2026042").first()
    tech_job = db.query(JobPosting).filter(JobPosting.title == "Senior Software Engineer - Full Stack").first()
    cloud_job = db.query(JobPosting).filter(JobPosting.title == "Cloud Infrastructure Engineer").first()

    if alex and tech_job:
        app1 = db.query(Application).filter(Application.student_id == alex.id, Application.job_posting_id == tech_job.id).first()
        if not app1:
            app1 = Application(
                job_posting_id=tech_job.id,
                student_id=alex.id,
                status=ApplicationStatus.SHORTLISTED,
                remarks="Selected for Technical Round 2 after clearing Coding Assessment with 100% score."
            )
            db.add(app1)

    if alex and cloud_job:
        app2 = db.query(Application).filter(Application.student_id == alex.id, Application.job_posting_id == cloud_job.id).first()
        if not app2:
            app2 = Application(
                job_posting_id=cloud_job.id,
                student_id=alex.id,
                status=ApplicationStatus.OFFERED,
                remarks="Congratulations! Official Offer extended for Cloud Infrastructure Engineer at 12.0 LPA."
            )
            db.add(app2)

    if sarah and cloud_job:
        app3 = db.query(Application).filter(Application.student_id == sarah.id, Application.job_posting_id == cloud_job.id).first()
        if not app3:
            app3 = Application(
                job_posting_id=cloud_job.id,
                student_id=sarah.id,
                status=ApplicationStatus.APPLIED,
                remarks="Application submitted successfully."
            )
            db.add(app3)

    db.commit()
