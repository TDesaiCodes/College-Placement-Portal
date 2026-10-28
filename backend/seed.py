import sys
import os

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.db.init_db import init_db

def main():
    print("[Seed] Initializing Database Schema & Seeding Initial Data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        init_db(db)
        print("[Seed] Database seeding completed successfully!")
        print("\n--- Demo Quick Login Credentials ---")
        print("   TPO Admin:   admin@college.edu       / admin123")
        print("   Recruiter:   hr@techcorp.com         / recruiter123")
        print("   Student:     alex.student@college.edu / student123")
        print("------------------------------------\n")
    except Exception as e:
        print(f"[Seed Error] Error during database seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
