from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1.router import api_router
from app.models.user import User, UserRole
from app.core.security import get_password_hash

# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    # Seed default TPO Admin user if not present
    db = SessionLocal()
    try:
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
            print(f"[Startup] Default TPO Admin created: {admin_email} / admin123")
    except Exception as e:
        print(f"[Startup Error] {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "running",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
