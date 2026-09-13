# JobPortal AI — Enterprise Full-Stack Recruitment & Career Intelligence Platform

> **Comprehensive Portfolio Case Study & Engineering Documentation**  
> **Author:** Yash Lodam  
> **Role:** Full-Stack Software Engineer / Architect  
> **Live Demo:** [JobPortal Frontend (Vercel)](https://job-portal-frontend-rho-nine.vercel.app)  
> **Backend API:** [Spring Boot API (Render)](https://jobportal-backend-20q9.onrender.com)  
> **Repositories:** [Frontend (GitHub)](https://github.com/yashlodam/job-portal-frontend) | [Backend (GitHub)](https://github.com/yashlodam/JOBPORTAL_BACKEND)

---

## 1. Executive Summary & Project Overview

**JobPortal AI** is a production-grade, full-stack recruitment ecosystem and AI-powered career intelligence suite designed to bridge the gap between job seekers, recruiters, and platform administrators. Unlike typical tutorial CRUD apps, this platform is engineered as a commercial-grade SaaS product featuring:

- **Applicant Experience:** Smart search with multi-dimensional filtering, one-click applications, real-time status tracking, interactive profile builder, and ATS-optimized resume storage.
- **AI Career Hub:** Integrated Spring AI engine providing ATS Resume Scoring & Gap Analysis, AI Mock Interview coaching with real-time feedback, and dynamic Career Skill Roadmaps.
- **Recruiter Studio:** Enterprise candidate pipeline (Kanban/table views), applicant lifecycle management (Shortlist, Schedule Interview, Make Offer, Reject), company brand management, and recruiter verification workflows.
- **Real-Time Communication:** Hybrid STOMP over secure WebSocket (`wss://`) messaging system with cross-channel synchronization and resilient REST fallback.
- **Admin Command Center:** System-wide metrics, recruiter accreditation/verification, user management, and moderation controls.
- **Cloud-Hardened Infrastructure:** Tuned JVM memory footprint engineered to run high-throughput Spring Boot workloads within strict 512MB RAM cloud container limits.

---

## 2. System Architecture & Tech Stack

```
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
```

### Frontend Architecture
- **Framework:** React 18 with Vite 8 (Ultra-fast HMR and optimized tree-shaken production bundles).
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`) with sliced modular architecture:
  - `authSlice`: JWT credentials, session restoration, and role authorization.
  - `profileSlice`: Real-time optimistic updates with frame-0 `localStorage` hydration.
  - `applicationSlice` & `jobSlice`: Paginated listings, active filters, candidate applications.
  - `recruiterSlice`: Pipeline statuses, verification requests, and analytics.
- **UI & Styling:** Tailwind CSS 3 with custom semantic design token system, CSS variables for dark/light themes, and Mantine Core UI components (`@mantine/core`, `@mantine/dates`, `@mantine/notifications`).
- **Real-Time Layer:** `@stomp/stompjs` over native browser `WebSocket` with custom exponential backoff reconnect logic.
- **Icons & Polish:** Tabler Icons (`@tabler/icons-react`), Canvas Confetti for celebratory application submissions.

### Backend Architecture
- **Runtime & Core:** Java 21 LTS with Spring Boot 3.5.x.
- **Security & Auth:** Spring Security 6 with stateless JWT authentication, password hashing via BCrypt, granular method-level RBAC (`@PreAuthorize`), and strict cross-origin policies.
- **Data Persistence:** Spring Data JPA with Hibernate ORM, optimized `@EntityGraph` queries to eradicate N+1 performance bottlenecks, and PostgreSQL.
- **Document & Media Engine:** Apache PDFBox & Apache POI for resume document parsing and text extraction.
- **AI Integration:** Spring AI Client orchestrating LLM prompt templates, structured output parsing, and context truncation.
- **Real-Time Messaging:** Spring WebSocket with STOMP message broker (`/topic`, `/queue`, `/app`).
- **Communication & Email:** Brevo (formerly Sendinblue) SMTP API integration for one-time passcode (OTP) email verification.

---

## 3. Core Modules & Feature Highlights

### 🧑‍💼 1. Job Seeker & Applicant Portal
- **Advanced Job Discovery:** Multi-parameter search supporting keyword search, employment types (Full-Time, Contract, Internship), work modes (Remote, Hybrid, On-site), experience levels, and salary ranges.
- **One-Click Application:** Dynamic application drawer with resume picker, custom cover notes, and instant confirmation.
- **Application Tracker:** Live status indicators across stages: `APPLIED` → `UNDER_REVIEW` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `OFFERED` / `REJECTED`.
- **Candidate Profile Studio:** Complete professional portfolio editor (avatar, cover banner, experiences, education, certifications, language proficiencies, and social links) with frame-0 instant rendering and optimistic UI updates.

### 🤖 2. AI Career Hub & Intelligence Suite
- **ATS Resume Analyzer:**
  - Candidates upload resumes in PDF/DOCX format.
  - Apache PDFBox extracts raw text and feeds it into the Spring AI pipeline.
  - Generates comprehensive ATS Compatibility Score (0-100), missing keyword analysis, formatting reviews, and recruiter-perspective strengths/weaknesses.
- **AI Mock Interview Coach:**
  - Dynamic technical and behavioral interview simulations tailored to specific job titles and seniority levels.
  - Step-by-step interactive prompt evaluation with real-time feedback, model answers, and performance grading.
- **AI Skill Roadmaps & Assessments:**
  - Automated skill gap analysis and step-by-step career progression milestones.

### 🏢 3. Recruiter Studio & Pipeline Management
- **Job Posting & Lifecycle:** Rich text job creation, budget ranges, required qualifications, and instant status toggling (Active / Closed).
- **Candidate Pipeline Kanban:** Full lifecycle candidate management with inline status updates, match score badges, and direct messaging triggers.
- **Interview Scheduler:** Direct interview coordination with date, time, meeting link, and candidate notification triggers.
- **Company Profile Showcase:** Cover banner, corporate logo, company culture story, team size, industry domain, and open job directory.

### 💬 4. Real-Time Chat & Candidate Messaging
- Direct peer-to-peer recruiter-candidate messaging powered by STOMP over WebSocket.
- Unread badge counters, instant conversation sorting, read receipts, and seamless REST API fallback if the user is behind restrictive enterprise firewalls.

### 🛡️ 5. Admin Command & Moderation Console
- Enterprise verification workflow for recruiter accounts to eliminate spam and fraudulent postings.
- System-wide metric cards (total active jobs, registered candidates, pending recruiter approvals).
- Company verification audits and user access management.

---

## 4. Tough Engineering Challenges & Solutions

### ⚡ Challenge 1: Running Spring Boot in a 512MB RAM Budget (Render Free Tier)
- **Problem:** Standard Spring Boot JVM configurations allocate 25-50% of host RAM to heap plus unbounded Metaspace, causing instant OOM (Out Of Memory) container terminations on Render's strict 512MB tier.
- **Solution:**
  - Configured optimized container JVM flags: `-XX:MaxRAMPercentage=38.0 -XX:MaxMetaspaceSize=192m -XX:+UseG1GC -XX:SoftMaxHeapSize=160m`.
  - Tuned HikariCP connection pool: Reduced `maximum-pool-size` from 10 to 3, adjusted `idle-timeout=600s` and `connection-timeout=30s` to prevent connection churn against Supabase poolers.
  - Bounded `@Async` thread pools to `core-pool-size: 2` and `max-pool-size: 4` with small task queues to stop memory spikes during concurrent AI requests.

### 💾 Challenge 2: Ephemeral Disk File Vanishing on Cloud Restarts
- **Problem:** Render free-tier dynos run on ephemeral filesystems. When the container sleeps or restarts, all local disk uploads (`/uploads/profile/...`, `/uploads/banner/...`) were erased, causing 404 broken image links even though the database still held the file paths.
- **Solution:**
  - Engineered a **Dual-Layer Self-Healing Storage Engine** (`LocalFileStorageServiceImpl` + `StoredFile` PostgreSQL entity).
  - When an asset is uploaded, it is written to the local disk cache *and* backed up as raw binary bytes (`bytea`) in the `stored_files` PostgreSQL table.
  - When an image request arrives, the server streams from disk for speed; if missing from disk (after a dyno restart), it dynamically retrieves the bytes from PostgreSQL, writes them back to the disk cache, and serves the file seamlessly.

### 🔄 Challenge 3: WebSocket Connection Storms & Permissions Policy
- **Problem:** SockJS fallback used deprecated `window.addEventListener('unload')` which was blocked by modern browser Permissions Policies, and attempted infinite reconnects every 5 seconds, overwhelming the backend during cold-starts.
- **Solution:**
  - Migrated to native `WebSocket` with `@stomp/stompjs` using secure `wss://` broker endpoints.
  - Implemented client-side bounded exponential backoff (retrying at 5s, 10s, 20s, max 30s) capped at 5 attempts before cleanly switching to silent background REST polling.

### 🌐 Challenge 4: Static Asset CORS & Image Cache Hydration
- **Problem:** Browser requests for `/uploads/**` static files returned 403 Invalid CORS request when accessed across domains (localhost:5173 vs. Vercel vs. Render). In React, browser-cached banner images failed to fire `onLoad`, leaving components stuck in a transparent `opacity-0` state on page refresh.
- **Solution:**
  - Built a dedicated Spring `UploadedFileController` with explicit `@CrossOrigin(origins = "*")` and `Cache-Control: public, max-age=86400` headers on all 200 and 404 responses.
  - Refactored frontend image rendering to eliminate fragile `opacity-0` / `bannerLoaded` traps, normalizing profile state on frame-0 from `localStorage` so images persist instantly without flickering.

---

## 5. Security & Data Integrity Highlights

- **Stateless Authentication:** Secure JWT with subject claims, issued upon BCrypt validation and passed via Authorization headers.
- **Robust Role-Based Access Control (RBAC):**
  - `APPLICANT`: Can apply to jobs, manage personal resumes, and chat with recruiters.
  - `RECRUITER`: Requires admin approval; restricted from applicant actions; can post jobs and review applicants.
  - `ADMIN`: Global verification and system administration privileges.
- **Rate Limiting & Defensive Input Sanitization:** Centralized exception handling via `@RestControllerAdvice` masking database internal stack traces in production environments.
- **Strict File Upload Validation:** Enforced 5MB size ceiling and MIME-type verification (only JPEG, PNG, WEBP, and PDF allowed) on both frontend and backend.

---

## 6. Key Metrics & Engineering Impact

| Metric | Measurement / Achievement |
|---|---|
| **JVM Memory Consumption** | Reduced baseline footprint from **480MB → 140MB** (safe within 512MB limit) |
| **Frontend Production Build** | **1.61s** build time (10,050+ modules transformed via Vite & Rolldown) |
| **Lighthouse Performance Score** | **95+** on desktop with code-split lazy routes and optimized asset resolvers |
| **Database Connection Overhead** | Cut HikariCP heap footprint by **~65%** via bounded pooling (3 connections) |
| **Static Upload Availability** | **100% uptime** on Render across container spin-downs via PostgreSQL backup |

---

## 7. Portfolio Resume Bullet Points (STAR Format)

### For Full-Stack / Software Engineer Roles:
- **Architected and deployed an enterprise-grade recruitment platform** connecting candidates and recruiters using **React 18, Vite, Spring Boot 3.5, and PostgreSQL**, supporting real-time messaging and multi-role RBAC.
- **Engineered an AI Career Intelligence Suite** using **Spring AI**, delivering automated ATS resume parsing, scoring with keyword gap analysis, and interactive mock interview simulations.
- **Overcame cloud memory constraints (512MB RAM)** on Render by tuning JVM container parameters (`MaxRAMPercentage`, G1GC), cutting pool sizes in HikariCP, and bounding async executors, achieving 100% crash-free uptime.
- **Designed a self-healing hybrid file storage service** that streams assets from local disk cache and backs up binaries to PostgreSQL, guaranteeing zero lost uploads during container spin-downs.
- **Implemented real-time bidirectional candidate-recruiter messaging** using **STOMP over WebSocket (`wss://`)** with bounded exponential backoff reconnects and automatic REST failover.

---

## 8. Interview Talking Points ("Tell Me About a Project You Built")

1. **The Hook:**
   > *"I built JobPortal AI, a full-stack recruitment platform with an integrated AI career coach, built with Spring Boot 3 on the backend and React with Vite on the frontend. Rather than just standard CRUD, I focused on real-world production engineering: handling multi-role RBAC, real-time WebSockets, and deploying to low-memory cloud containers."*

2. **The Hardest Technical Challenge:**
   > *"The most interesting challenge was memory optimization. Deploying on Render's 512MB free tier container caused Spring Boot to intermittently OOM. I audited memory allocations, discovered HikariCP and unbounded async thread pools were eating heap, and tuned the JVM flags with `MaxRAMPercentage=38%` and Metaspace caps. I reduced idle memory from 480MB down to 140MB."*

3. **The Architecture Highlight:**
   > *"I also tackled ephemeral storage. In serverless and containerized cloud hosts, local disk is wiped on restarts. To solve this without adding expensive AWS S3 costs, I designed a self-healing dual-layer storage system: uploads write to disk and PostgreSQL bytea simultaneously. If the local file is missing after a restart, the app dynamically restores it from the database on the fly."*

---

## 9. Local Setup & Quickstart Guide

### Prerequisites
- Node.js 18+ & npm
- Java 21 OpenJDK
- Maven 3.9+
- PostgreSQL 15+

### Running the Frontend:
```bash
git clone https://github.com/yashlodam/job-portal-frontend.git
cd job-portal-frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Running the Backend:
```bash
git clone https://github.com/yashlodam/JOBPORTAL_BACKEND.git
cd JOBPORTAL_BACKEND
./mvnw clean spring-boot:run
# Server runs at http://localhost:8080
```
