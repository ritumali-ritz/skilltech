# 🚀 SkillHire: Smart Job Portal Documentation

> **Transforming the hiring experience with intelligent skill matching.**

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technical Stack](#️-technical-stack)
3. [User Roles & Journeys](#-user-roles--journeys)
4. [Database Architecture](#-database-architecture)
5. [Folder Structure](#-folder-structure-explained)
6. [Security Measures](#️-security-measures)
7. [Future Scope](#-future-scope)
8. [Getting Started](#-getting-started)

---

## 🌟 Project Overview
**SkillHire** is a modern, full-stack job portal designed to bridge the gap between talented job seekers and top employers. Built with a focus on **User Experience (UX)** and **Data Integrity**, it features a unique **Skill Matching Algorithm** that calculates exactly how well a candidate fits a job role based on their profile.

### 🎨 Design Philosophy
*   **Aesthetic**: Modern Glassmorphism (Frosted glass effects).
*   **Mode**: Dual-mode support (Vibrant Light Mode & Sleek Dark Mode).
*   **Animations**: Smooth micro-interactions and animated statistics.
*   **Responsiveness**: Mobile-first approach for job hunting on the go.

---

## 🛠️ Technical Stack
| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) | Blazing fast, zero-dependency UI. |
| **Backend** | Node.js, Express.js | Robust RESTful API architecture. |
| **Database** | MySQL | Reliable relational data storage. |
| **Auth** | JSON Web Tokens (JWT) | Secure, stateless session management. |
| **Security** | Bcrypt.js | Industry-standard password hashing. |
| **Files** | Multer | Secure handling of resumes & photos. |

---

## 👥 User Roles & Journeys

### 1. 🔍 Job Seeker
*   **Profile Building**: Add skills, upload resumes, and set career preferences.
*   **Smart Discovery**: Get a **Match Score (%)** for every job listing.
*   **Application Tracking**: Manage applications with real-time status updates (Reviewing, Accepted, Rejected).
*   **Saved Jobs**: Bookmark interesting roles for later.

### 2. 🏢 Employer
*   **Branding**: Managed company profile with logo and industry details.
*   **Job Posting**: Create detailed job listings with specific skill requirements.
*   **Applicant Management**: View candidates sorted by their skill match score.
*   **Hiring Workflow**: Advance candidates through the hiring pipeline.

### 3. 🛡️ Admin
*   **Analytics**: Global overview of platform usage and growth.
*   **Content Moderation**: Approve or reject job postings to ensure quality.
*   **User Control**: Manage and secure the entire user base.

---

## 📊 Database Architecture
The system relies on a highly normalized relational database:

1.  **`users`**: Core credentials and multi-role flags.
2.  **`companies`**: Employer-specific branding data.
3.  **`jobs`**: Detailed job specs including salary ranges and status.
4.  **`skills`**: Master list of industry-standard skills.
5.  **`user_skills` & `job_skills`**: Linking tables for many-to-many relationships.
6.  **`applications`**: The bridge between users, jobs, and recruiters.
7.  **`saved_jobs`**: User preference tracking.
8.  **`admin_logs`**: Full audit trail for administrative actions.

---

## 📁 Folder Structure Explained
```text
skillhire-portal/
├── 📁 config/        # Connection pools (MySQL)
├── 📁 database/      # SQL Schema & Seed scripts
├── 📁 middleware/    # Security guards (JWT Verification)
├── 📁 public/        # Frontend (The visual layer)
│   ├── 📁 css/       # Glassmorphism & Themes
│   ├── 📁 js/        # Frontend logic modules
│   └── 📄 index.html # Main entry point
├── 📁 routes/        # API Endpoints (The brain)
├── 📁 scripts/       # Utility & Maintenance tools
├── 📁 utils/        # Shared helper functions
└── 📄 server.js      # Server initialization
```

---

## 🚀 Getting Started
1.  **Install Dependencies**: `npm install`
2.  **Configure Database**: Update `.env` with your MySQL credentials.
3.  **Launch Server**: `npm run dev`
4.  **Access Site**: Open `http://localhost:3000`

---

## 🛡️ Security Measures
*   **Data Protection**: Parameterized queries to prevent SQL Injection.
*   **Password Security**: One-way salt hashing using Bcrypt.
*   **Session Security**: Expiring JWT tokens for secure authentication.
*   **Input Sanitization**: Client and server-side validation for all forms.

---

## 🔮 Future Scope
*   **Video Interviews**: Integrated WebRTC-based video calling.
*   **AI Resume Parsing**: Automating skill extraction from PDF resumes.
*   **Mobile App**: Dedicated Android/iOS application using Flutter.
*   **Payment Gateway**: Premium features for job highlighting.

---

### 🎓 Prepared for: [Examiner/Project Guide]
*   **Project Title**: SkillHire - A Smart Job Portal System
*   **Key Innovation**: Skill-Based Matching Algorithm
*   **Platform**: Web-based (Responsive)
