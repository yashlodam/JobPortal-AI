# 🚀 JobPortal AI — Full-Stack Recruitment & Career Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://job-portal-frontend-rho-nine.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://jobportal-backend-20q9.onrender.com)
[![Java 21](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

An enterprise-grade, full-stack recruitment SaaS platform and AI-powered career intelligence ecosystem connecting candidates, corporate recruiters, and platform administrators. Built with a modern micro-modular architecture featuring real-time WebSocket messaging, ATS resume scoring, AI mock interview coaching, and cloud memory-hardened backend services.

---

## 🏗️ Repository Architecture (Monorepo)

`
JobPortal-FullStack/
├── frontend/                     # React 18 + Vite 8 SPA Client
│   ├── src/
│   │   ├── api/                  # Axios instances, interceptors, and endpoints
│   │   ├── components/           # Reusable UI library (Mantine + Tailwind)
│   │   ├── features/             # Career Hub, Resume Analyzer, Mock Interview
│   │   ├── Pages/                # Candidate, Recruiter, and Admin routes
│   │   ├── State/                # Redux Toolkit modular slices & thunks
│   │   └── utils/                # Asset resolvers & date helpers
│   └── package.json
│
├── backend/                      # Java 21 + Spring Boot 3.5.x Core API
│   ├── src/main/java/com/jobportal/
│   │   ├── config/               # SecurityConfig, WebSocketConfig, WebConfig
│   │   ├── controller/           # REST endpoints (Profile, Jobs, Chat, etc.)
│   │   ├── dto/                  # Data Transfer Objects & API Envelopes
│   │   ├── entity/               # JPA Entities (User, Job, Profile, StoredFile)
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── serviceImpl/          # Business logic & AI orchestrators
│   │   └── utility/              # Self-healing FileStorageService
│   └── pom.xml
│
└── PROJECT_PORTFOLIO_CASE_STUDY.md # Full Architecture & Technical Deep-Dive
`

---

## 🌟 Key Features

### 🧑‍💼 1. Job Seeker & Applicant Portal
- **Smart Multi-Dimensional Discovery:** Instant filtering across job types, remote/hybrid arrangements, experience levels, and salary expectations.
- **Interactive Profile Studio:** Avatar and banner customization, nested career timelines (experience, education, certifications, and languages) with frame-0 \localStorage\ hydration.
- **One-Click Application Pipeline:** Resume picker, custom cover notes, and real-time status tracking (\APPLIED\ → \SHORTLISTED\ → \INTERVIEW_SCHEDULED\ → \OFFERED\).

### 🤖 2. AI Career Hub & Intelligence Suite (Spring AI)
- **ATS Resume Analyzer:** Ingests PDF/DOCX resumes, parses unstructured text via Apache PDFBox, and outputs a 0–100 compatibility score with keyword gap analysis.
- **AI Mock Interview Coach:** Interactive technical and behavioral interview simulation with live feedback and candidate response scoring.
- **Career Roadmaps:** Dynamic career path milestone tracking and skill recommendations.

### 🏢 3. Recruiter Studio
- **Candidate Pipeline Kanban:** Full lifecycle candidate management with inline status transitions and match analysis.
- **Job Creation Suite:** Rich text job editor with budget brackets, role requirements, and active/closed status toggles.
- **Company Branding Showcase:** Dedicated corporate profile with logo, banner, mission statement, and open listings.

### 💬 4. Real-Time Chat (STOMP over WebSocket)
- Bidirectional candidate-recruiter messaging over secure WebSocket (\wss://\).
- Unread badge counters, conversation sorting, read receipts, and automatic REST failover for restrictive network environments.

### 🛡️ 5. Admin Console & Moderation
- Enterprise recruiter accreditation workflow to eliminate fraud and spam.
- Platform-wide telemetry (active jobs, registered users, pending approvals).

---

## ⚡ Engineering Challenges & Solutions

| Challenge | Root Cause | Engineering Solution |
| :--- | :--- | :--- |
| **512MB RAM Budget on Render** | Standard JVM settings consume 480MB+ heap and Metaspace, causing container OOM crashes. | Configured \-XX:MaxRAMPercentage=38.0 -XX:MaxMetaspaceSize=192m -XX:+UseG1GC\, rightsized HikariCP to 3 connections, and bounded \@Async\ executors. **Reduced memory footprint from 480MB → 140MB (70% reduction)**. |
| **Ephemeral Disk File Loss** | Cloud containers wipe local disk on restarts, breaking uploaded images. | Built a **Dual-Layer Self-Healing Storage Engine**: writes to local disk cache and PostgreSQL \ytea\ storage simultaneously; on cache miss, seamlessly restores bytes from PostgreSQL on the fly. |
| **WebSocket Reconnect Storms** | Deprecated SockJS unload hooks triggered browser permission errors and infinite 5s reconnect storms. | Migrated to native WebSocket with \@stomp/stompjs\ over \wss://\ using bounded exponential backoff (5 retries max) with silent background REST polling failover. |
| **Cross-Origin Asset Sharing (CORS)** | Static \/uploads/**\ requests blocked across domains (localhost vs. Vercel vs. Render). | Implemented dedicated Spring \UploadedFileController\ with explicit \@CrossOrigin(origins = "*")\ and \Cache-Control: public, max-age=86400\ on all response paths. |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 18+ & npm
- Java 21 OpenJDK
- Maven 3.9+
- PostgreSQL 15+

### 1. Running the Frontend:
\\\ash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
\\\

### 2. Running the Backend:
\\\ash
cd backend
./mvnw clean spring-boot:run
# Running at http://localhost:8080
\\\

---

## 👨‍💻 Author

**Yash Lodam**  
- **Live Application:** [job-portal-frontend-rho-nine.vercel.app](https://job-portal-frontend-rho-nine.vercel.app)  
- **GitHub:** [@yashlodam](https://github.com/yashlodam)
