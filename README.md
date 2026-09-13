<div align="center">

# 💼 JobPortal AI
### Enterprise Full-Stack Recruitment & AI Career Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://job-portal-frontend-rho-nine.vercel.app)
[![Backend API](https://img.shields.io/badge/API_Status-Render_Live-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://jobportal-backend-20q9.onrender.com/health)
[![Java 21](https://img.shields.io/badge/Java_21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Spring AI](https://img.shields.io/badge/Spring_AI-Gemini_LLM-FF6F00?style=for-the-badge&logo=google&logoColor=white)](https://spring.io/projects/spring-ai)

<p align="center">
  <b>A commercial-grade full-stack recruitment SaaS connecting job seekers, corporate recruiters, and administrators.</b><br>
  Featuring real-time STOMP WebSockets, automated ATS resume scoring, AI mock interview coaching, and a memory-hardened low-footprint cloud architecture.
</p>

[Explore Live Demo](https://job-portal-frontend-rho-nine.vercel.app) • [View Architecture Docs](./PROJECT_PORTFOLIO_CASE_STUDY.md) • [Report Bug](https://github.com/yashlodam/JobPortal-AI/issues)

</div>

---

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Core Feature Pillars](#-core-feature-pillars)
- [Engineering Challenges & Low-Level Solutions](#-engineering-challenges--low-level-solutions)
- [Tech Stack Matrix](#-tech-stack-matrix)
- [Live Demo & Test Credentials](#-live-demo--test-credentials)
- [Local Setup & Getting Started](#-local-setup--getting-started)
- [REST API Endpoints](#-rest-api-endpoints)
- [Author & Connect](#-author--connect)

---

## 🌟 Executive Overview

**JobPortal AI** is designed and engineered to emulate a real-world commercial recruitment product rather than a typical tutorial CRUD project. It handles multi-tenant workflows across three distinct user roles (**Candidate**, **Recruiter**, and **Administrator**), provides an **AI Career Intelligence Hub** powered by Spring AI, and features an enterprise-grade **real-time chat engine** backed by WebSocket (wss://) with automatic REST failover.

### 🎯 Key Performance Highlights
- **70% Memory Optimization:** Tuned JVM memory footprint from **480MB down to 140MB**, running 100% crash-free inside strict 512MB RAM cloud containers.
- **Self-Healing Binary Storage:** Zero upload loss on ephemeral cloud containers via a dual-layer local disk cache + PostgreSQL binary backing store.
- **Sub-Millisecond Real-Time Messaging:** STOMP over native WebSocket protocol with client-side bounded exponential backoff reconnection.
- **Frame-0 Profile Hydration:** Zero-flash state restoration from \localStorage\ delivering an instantaneous UI experience on page refresh.

---

## 🏗️ System Architecture

`
                                  ┌─────────────────────────────┐
                                  │       Client Devices        │
                                  │ (Desktop / Tablet / Mobile) │
                                  └──────────────┬──────────────┘
                                                 │
                                     HTTPS / WSS │ CDN
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │      Vercel Edge Host       │
                                  │   React 18 + Vite Frontend  │
                                  └──────────────┬──────────────┘
                                                 │
                                                 │ REST API (JSON) /
                                                 │ STOMP over WSS
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │      Render Cloud Host      │
                                  │  Spring Boot 3.5.x Backend  │
                                  │      (Java 21 OpenJDK)      │
                                  └──────┬───────────────┬──────┘
                                         │               │
                     HikariCP Connection │               │ Spring AI Client
                                    Pool │               │
                                         ▼               ▼
                        ┌──────────────────┐    ┌─────────────────┐
                        │    PostgreSQL    │    │  Google Gemini  │
                        │ Database Cluster │    │   / OpenAI API  │
                        │   (Supabase)     │    └─────────────────┘
                        └──────────────────┘
`

---

## 📂 Repository Structure

This repository is organized as a clean, unified monorepo containing the complete full-stack codebase with 100% git history preserved:

`
JobPortal-FullStack/
├── frontend/                          # React 18 + Vite SPA Client
│   ├── src/
│   │   ├── api/                       # Centralized Axios client & API endpoints
│   │   ├── components/                # Reusable UI component library (Mantine + Tailwind)
│   │   │   ├── auth/                  # Protected & Recruiter route guards
│   │   │   ├── recruiter/             # Candidate pipelines & verification modals
│   │   │   └── ui/                    # Modals, toasts, confirm dialogs, skeletons
│   │   ├── features/
│   │   │   ├── career-hub/            # Career roadmaps & assessments
│   │   │   ├── mock-interview/        # Interactive AI mock interview coach
│   │   │   ├── notifications/         # Notification feeds & action hooks
│   │   │   └── resume-analyzer/       # ATS resume parsing & scoring UI
│   │   ├── Pages/                     # Role-based page views
│   │   ├── Profile/                   # Full candidate profile studio
│   │   ├── State/                     # Redux Toolkit modular slices & async thunks
│   │   └── utils/                     # Dynamic asset resolvers & formatting helpers
│   └── package.json
│
├── backend/                           # Java 21 + Spring Boot 3.5.x Core API
│   ├── src/main/java/com/jobportal/
│   │   ├── config/                    # SecurityConfig, WebSocketConfig, WebConfig
│   │   ├── controller/                # REST Controllers (Auth, Profile, Jobs, Chat, etc.)
│   │   ├── dto/                       # Request/Response DTO envelopes & audit records
│   │   ├── entity/                    # JPA Entities (User, Job, Profile, StoredFile)
│   │   ├── repository/                # Spring Data JPA Repositories
│   │   ├── service/                   # Core business logic interfaces
│   │   ├── serviceImpl/               # Service implementations & AI orchestrators
│   │   └── utility/                   # Self-healing FileStorageService & JWT utils
│   └── pom.xml
│
└── PROJECT_PORTFOLIO_CASE_STUDY.md      # Detailed Technical Architecture & Case Study
`

---

## 💎 Core Feature Pillars

### 🧑‍💼 1. Job Seeker & Applicant Experience
- **Multi-Dimensional Search & Filtering:** Filter listings dynamically by keyword, contract type (Full-Time, Contract, Internship), work arrangement (Remote, Hybrid, On-site), experience tier, and salary brackets.
- **Interactive Profile Studio:** Custom avatar and cover banner upload, timeline history for work experience, degrees, certifications, and language proficiencies.
- **One-Click Application Pipeline:** Instant resume selector, cover note integration, and live tracking across stages:
  \APPLIED\ → \UNDER_REVIEW\ → \SHORTLISTED\ → \INTERVIEW_SCHEDULED\ → \OFFERED\ / \REJECTED\.

### 🤖 2. AI Career Hub (Powered by Spring AI)
- **ATS Resume Analyzer:**
  - Extracts text from uploaded PDF/DOCX files via Apache PDFBox.
  - Compares resume contents against target job descriptions.
  - Produces an ATS Compatibility Score (0–100), identifying missing technical keywords and formatting red flags.
- **Interactive AI Mock Interview Coach:**
  - Real-time technical and behavioral interview simulations calibrated to seniority levels.
  - Instant critique, scoring, and model answers after every candidate response.
- **Skill Progression Roadmaps:** Automated technical skill gap analysis with milestone recommendations.

### 🏢 3. Recruiter Studio & Pipeline Management
- **Candidate Pipeline Kanban:** Manage applicants across lifecycle stages with inline actions, match score badges, and direct interview scheduling.
- **Job Posting Suite:** Rich text job editor with qualification tagging, budget limits, and status toggles (Active/Closed).
- **Company Branding Page:** Corporate showcase featuring logo, banner, mission statement, and open listings directory.

### 💬 4. Real-Time Chat & Candidate Messaging
- Sub-millisecond peer-to-peer recruiter-candidate messaging over secure WebSocket (\wss://\) using STOMP.
- Unread badge counters, conversation sorting, read receipts, and automatic REST failover for restrictive network environments.

### 🛡️ 5. Admin Console & Moderation
- Enterprise recruiter accreditation workflow to eliminate fraud and spam.
- Platform-wide telemetry (active jobs, registered users, pending approvals).

---

## ⚡ Engineering Challenges & Low-Level Solutions

### 1. Spring Boot Memory Hardening for 512MB RAM Containers
- **Challenge:** Standard Spring Boot JVM settings allocate 25–50% of host RAM to heap plus unbounded Metaspace, causing instant Out-Of-Memory (OOM) container kills on Render's strict 512MB tier.
- **Solution:** 
  - Container-tuned JVM flags: \-XX:MaxRAMPercentage=38.0 -XX:MaxMetaspaceSize=192m -XX:+UseG1GC -XX:SoftMaxHeapSize=160m\.
  - Rightsized HikariCP connection pool from 10 to 3 connections, extending \idle-timeout\ to 600s to avoid churning Supabase connection poolers.
  - Bounded \@Async\ thread pools to 2 core / 4 max threads with small queue capacities.
  - **Result:** Reduced idle memory footprint from **480MB down to ~140MB (70% reduction)**, running 100% crash-free.

### 2. Ephemeral Cloud Storage Self-Healing Binary Store
- **Challenge:** Cloud container dynos wipe local disk on restarts, breaking uploaded images and resumes even though database records remain.
- **Solution:**
  - Engineered a **Dual-Layer Self-Healing Storage Engine** (\LocalFileStorageServiceImpl\ + \StoredFile\ PostgreSQL entity).
  - Writes uploads to local disk cache and PostgreSQL binary (\ytea\) storage simultaneously.
  - When an asset is requested, it streams from disk for speed; on a cache miss (e.g. after a dyno restart), it restores bytes dynamically from PostgreSQL, writes them to disk, and serves the file seamlessly.

### 3. Resilient WebSocket Messaging & Bounded Backoff
- **Challenge:** SockJS fallback triggered modern browser permission policy violations (\unload\ listener deprecation) and infinite reconnect loops every 5s during backend cold starts.
- **Solution:**
  - Migrated to native WebSocket with \@stomp/stompjs\ over secure \wss://\.
  - Built client-side bounded exponential backoff (5s, 10s, 20s, max 30s) capped at 5 attempts, with seamless fallback to background REST synchronization.

### 4. Zero-Flash Profile Hydration & Universal CORS
- **Challenge:** Cross-origin static asset requests returned 403 Forbidden across domains. In React, browser-cached banner images failed to fire \onLoad\, leaving components stuck in a transparent \opacity-0\ state on page refresh.
- **Solution:**
  - Built a dedicated Spring \UploadedFileController\ with explicit \@CrossOrigin(origins = "*")\ and \Cache-Control: public, max-age=86400\ headers on all 200 and 404 responses.
  - Aligned banner rendering with avatar patterns, normalizing profile state on frame-0 from \localStorage\ for instant rendering without blank flashes.

---

## 💻 Tech Stack Matrix

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI & Core** | React 18, Vite 8, Tailwind CSS 3, Mantine Core UI (@mantine/core, @mantine/dates, @mantine/notifications) |
| **State & Networking** | Redux Toolkit, Axios (with interceptors & cold-start auto-retry), Tabler Icons |
| **Real-Time Messaging** | STOMP over WebSocket (@stomp/stompjs), Spring WebSocket Message Broker |
| **Backend Core** | Java 21 LTS, Spring Boot 3.5.x, Spring Data JPA, Hibernate ORM |
| **Security & Auth** | Spring Security 6, Stateless JWT (JSON Web Tokens), BCrypt Hashing, RBAC |
| **AI & Document Processing** | Spring AI (Gemini LLM API), Apache PDFBox, Apache POI |
| **Database & Pooling** | PostgreSQL 15, HikariCP Connection Pool (tuned for low memory) |
| **Email & Communications** | Brevo (Sendinblue) SMTP API for OTP verification |
| **Cloud & DevOps** | Vercel (Frontend Edge Hosting), Render (Docker/JAR Backend API) |

---

## 🔑 Live Demo & Test Credentials

You can test the live application directly without creating a new account:

| Account Type | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Candidate / Applicant** | \	ruptilodam@gmail.com\ | \TruptiLodam@2004\ | Job Search, Applications, AI Hub, Profile Studio, Chat |
| **Recruiter (Demo)** | *Register via UI with Employer account* | *Any secure password* | Job Posting, Candidate Pipelines, Verification |

🔗 **Live Platform URL:** [https://job-portal-frontend-rho-nine.vercel.app](https://job-portal-frontend-rho-nine.vercel.app)

---

## 🛠️ Local Setup & Getting Started

### Prerequisites
- **Node.js:** 18.x or higher & npm
- **Java Development Kit (JDK):** Version 21 (OpenJDK recommended)
- **Maven:** 3.9+ (or use the included \./mvnw\ wrapper)
- **Database:** PostgreSQL 15+

### 1. Clone the Repository
\\\ash
git clone https://github.com/yashlodam/JobPortal-FullStack.git
cd JobPortal-FullStack
\\\

### 2. Run the Backend API
\\\ash
cd backend

# Configure your database credentials in src/main/resources/application.properties
# Run the Spring Boot application
./mvnw clean spring-boot:run
\\\
*The backend API will be available at \http://localhost:8080\.*

### 3. Run the Frontend Application
\\\ash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
\\\
*The frontend will launch at \http://localhost:5173\.*

---

## 📡 REST API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| \POST\ | \/api/auth/login\ | Authenticate and issue JWT token | No |
| \POST\ | \/api/auth/register\ | Register applicant or employer account | No |
| \GET\ | \/api/profile/me\ | Retrieve authenticated user's complete profile | Yes (JWT) |
| \PUT\ | \/api/profile/me/profile-image\ | Upload & persist candidate profile avatar | Yes (JWT) |
| \PUT\ | \/api/profile/me/banner-image\ | Upload & persist candidate profile cover banner | Yes (JWT) |
| \GET\ | \/api/jobs\ | Search & filter jobs (paginated) | Public |
| \POST\ | \/api/jobs\ | Post a new job listing | Yes (Recruiter) |
| \POST\ | \/api/applications/apply\ | Submit a candidate job application | Yes (Applicant) |
| \GET\ | \/api/chat/conversations\ | List active peer-to-peer conversations | Yes (JWT) |
| \POST\ | \/api/chat/conversations/{id}/messages\ | Send message with STOMP broadcast | Yes (JWT) |
| \GET\ | \/uploads/{subDir}/{fileName}\ | Stream static asset with universal CORS | Public |

---

## 👨‍💻 Author & Connect

**Yash Lodam**  
Full-Stack Software Engineer & Architect  
- **Portfolio:** [yashlodam.dev](https://github.com/yashlodam)  
- **GitHub:** [@yashlodam](https://github.com/yashlodam)  
- **LinkedIn:** [linkedin.com/in/yashlodam](https://linkedin.com/in/yashlodam)

---

<div align="center">
  <sub>Engineered with precision for production environments. Licensed under the MIT License.</sub>
</div>
