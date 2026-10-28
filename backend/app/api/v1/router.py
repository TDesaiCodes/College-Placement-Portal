from fastapi import APIRouter
from app.api.v1.endpoints import auth, students, recruiters, jobs, applications, admin, notices

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(recruiters.router, prefix="/recruiters", tags=["Recruiters"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Job Drives"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(admin.router, prefix="/admin", tags=["TPO Admin"])
api_router.include_router(notices.router, prefix="/notices", tags=["Placement Notices"])

