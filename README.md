# College Placement Portal 🎓

An enterprise-grade, full-stack campus recruitment management system built with **FastAPI**, **React.js**, **SQLAlchemy 2.0**, **MySQL**, **Pydantic v2**, **JWT Authentication**, and **AWS S3** for cloud resume storage.

---

## ⚡ 1-Click Demo Quick Login (Interviewer Mode)

The login screen contains **1-Click Quick Demo Buttons** so interviewers and reviewers can test all 3 perspectives without manually typing credentials or registering users:

| Role | Demo Email | Password | Key Feature Highlights |
| :--- | :--- | :--- | :--- |
| **🎓 Student** | `alex.student@college.edu` | `student123` | Drive eligibility badges, S3 resume upload, offer acceptance |
| **🏢 Recruiter** | `hr@techcorp.com` | `recruiter123` | Drive creation, candidate status pipeline, candidate search |
| **👑 TPO Admin** | `admin@college.edu` | `admin123` | Placement analytics, CSV report export, notice broadcasts |

👉 **For live interview presentations**, check out the detailed **[INTERVIEWER_GUIDE.md](file:///c:/Users/jishn/OneDrive/Desktop/College-Placement-Portalll/INTERVIEWER_GUIDE.md)** for an 8-minute presentation walkthrough script and system architecture diagrams!

---

## 🌟 Key Technical Features

1. **⚡ 1-Click Demo Login Bar**: Instant role switching for seamless live coding & portfolio reviews.
2. **🛡️ Automated Server-Side Eligibility Engine**: Strict rule evaluation (CGPA, backlogs, department, graduation year) preventing invalid applications.
3. **☁️ Cloud Resume Storage (AWS S3)**: Short-lived pre-signed upload & download URLs for direct client-to-cloud file transfers (with robust mock engine fallback).
4. **📊 Analytics & CSV Audit Export**: Real-time placement metrics dashboard with exportable CSV reports for university placement cell audits.
5. **📢 Placement Notices & Announcement Engine**: TPO broadcast bulletin board with priority tags (`URGENT`, `IMPORTANT`, `NORMAL`).
6. **🎯 Offer Acceptance & Placed Pipeline**: Students receiving job offers can accept/decline offers with 1 click, auto-updating placement statistics.

---

## 🛠️ Quickstart Guide

### Option A: Local Development

#### 1. Backend Setup & Seeding
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
python seed.py           # Seed sample students, recruiters, drives & notices
uvicorn app.main:app --reload --port 8000
```
- Open Swagger API Documentation: `http://localhost:8000/docs`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Open Web Application: `http://localhost:5173`

---

### Option B: Docker Deployment

```bash
docker-compose up --build
```
