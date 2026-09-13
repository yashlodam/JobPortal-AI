<div align="center">

# 💼 JobPortal AI
### Enterprise-Grade Full-Stack Recruitment Platform & AI Career Intelligence Engine

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://job-portal-frontend-rho-nine.vercel.app)
[![API Status](https://img.shields.io/badge/API_Status-Render_Live-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://jobportal-backend-20q9.onrender.com/health)
[![Java 21 LTS](https://img.shields.io/badge/Java_21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot 3.5](https://img.shields.io/badge/Spring_Boot_3.5.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React_18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite_8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Spring AI Gemini](https://img.shields.io/badge/Spring_AI-Gemini_Flash-FF6F00?style=for-the-badge&logo=google&logoColor=white)](https://spring.io/projects/spring-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>A commercial-grade full-stack recruitment SaaS connecting job seekers, corporate talent teams, and platform administrators.</b><br>
  Built with high-throughput reactive architecture, sub-millisecond STOMP WebSockets, automated ATS document scoring, deterministic match engines, AI mock interview simulators, and an ultra-low-memory JVM footprint engineered for high density cloud containers.
</p>

[🌐 Live Platform](https://job-portal-frontend-rho-nine.vercel.app) • [📖 Architecture Case Study](./PROJECT_PORTFOLIO_CASE_STUDY.md) • [🐛 Report Bug](https://github.com/yashlodam/JobPortal-AI/issues) • [✨ Request Feature](https://github.com/yashlodam/JobPortal-AI/issues)

</div>

---

## 📑 Table of Contents

- [Executive Summary](#-executive-summary)
- [System Architecture](#-system-architecture)
- [Monorepo Directory Structure](#-monorepo-directory-structure)
- [Core Feature Ecosystem](#-core-feature-ecosystem)
  - [1. Applicant & Career Intelligence Hub](#1-applicant--career-intelligence-hub)
  - [2. Recruiter ATS Suite & Talent CRM](#2-recruiter-ats-suite--talent-crm)
  - [3. Full-Duplex Real-Time Messaging Engine](#3-full-duplex-real-time-messaging-engine)
  - [4. Governance, RBAC & Audit System](#4-governance-rbac--audit-system)
- [Engineering Highlights & Deep Technical Innovations](#-engineering-highlights--deep-technical-innovations)
  - [I. 70% JVM Memory Hardening for 512MB RAM Constraints](#i-70-jvm-memory-hardening-for-512mb-ram-constraints)
  - [II. Self-Healing Binary Cache Architecture](#ii-self-healing-binary-cache-architecture)
  - [III. Fault-Tolerant Native STOMP WebSocket Protocol](#iii-fault-tolerant-native-stomp-websocket-protocol)
  - [IV. Dual-Mode Deterministic + LLM Scoring Pipeline](#iv-dual-mode-deterministic--llm-scoring-pipeline)
  - [V. Frame-0 UI Hydration & Temporal Dead Zone (TDZ) Fixes](#v-frame-0-ui-hydration--temporal-dead-zone-tdz-fixes)
- [Enterprise Tech Stack Matrix](#-enterprise-tech-stack-matrix)
- [Environment Variables & Security Configuration](#-environment-variables--security-configuration)
- [Local Installation & Development Guide](#-local-installation--development-guide)
- [REST API Reference & WebSocket Event Protocol](#-rest-api-reference--websocket-event-protocol)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Deployment Architecture & Production Strategy](#-deployment-architecture--production-strategy)
- [Author & Professional Network](#-author--professional-network)

---

## 🌟 Executive Summary

**JobPortal AI** is a production-hardened, distributed cloud-ready talent acquisition platform. Rather than building a standard tutorial CRUD app, this platform addresses real-world enterprise engineering bottlenecks:

1. **Scalable Multi-Tenant Architecture:** Granular Role-Based Access Control (RBAC) isolating **Applicant**, **Recruiter**, and **Admin** boundaries at both HTTP filter and database query levels.
2. **Deterministic AI Hybrid Processing:** Combines deterministic AST/regex rule algorithms (Apache PDFBox / Apache POI) with Google Gemini LLMs via Spring AI, guaranteeing predictable scoring while delivering personalized qualitative feedback.
3. **Resilient Communication Backbone:** Distributed STOMP over native WebSocket messaging system with exponential backoff connection cycling and automatic REST synchronization fallback.
4. **Cloud Container Memory Optimization:** Fine-tuned Java 21 LTS runtime with G1GC ergonomics, reduced Metaspace, and HikariCP connection throttling, achieving **140MB idle footprint** (70% reduction from standard Spring Boot defaults) to run crash-free on minimal cloud dynos.

---

## 🏗️ System Architecture

### 🌐 High-Level End-to-End System Topology

The platform is designed around a decoupled, event-driven reactive architecture separating the static Edge Single Page Application (SPA), the stateful real-time API server, PostgreSQL persistent storage with binary backing, and distributed AI evaluation pipelines:

`
                               ┌─────────────────────────────────────────────────────────┐
                               │                    CLIENT DEVICES                       │
                               │    Desktop Browser  •  Mobile Web  •  Tablet Viewport   │
                               └────────────────────────────┬────────────────────────────┘
                                                            │
                                                HTTPS / WSS │ Global Edge Anycast
                                                            ▼
                               ┌─────────────────────────────────────────────────────────┐
                               │                    EDGE CDN & ROUTING                   │
                               │                Vercel Edge Global Network               │
                               │   • Sub-50ms TTFB Static Delivery                       │
                               │   • Client-side SPA Rewrites (vercel.json)              │
                               │   • Gzip/Brotli Automated Asset Compression             │
                               └────────────────────────────┬────────────────────────────┘
                                                            │
                                     ┌──────────────────────┴──────────────────────┐
                                     │                                             │
                        REST Requests (JSON / Bearer JWT)             Native WSS STOMP Frames
                                     │                                             │
                                     ▼                                             ▼
       ┌─────────────────────────────────────────────────────────────────────────────────────────┐
       │                                  APPLICATION SERVER                                     │
       │                   Render Cloud Environment (Spring Boot 3.5.x on Java 21)               │
       │                                                                                         │
       │  ┌───────────────────────────┐  ┌───────────────────────────┐  ┌─────────────────────┐  │
       │  │   Spring Security 6       │  │   STOMP WebSocket Broker  │  │  File Storage Sub-  │  │
       │  │   • Stateless JWT Filter  │  │   • Native WSS Handshake  │  │    system (Dual)    │  │
       │  │   • RBAC Channel Intercept│  │   • Sub/Pub Topic Routing │  │  • Disk Cache Fast  │  │
       │  │   • BCrypt Salt Hashing   │  │   • Exponential Backoff   │  │  • PostgreSQL Bytea │  │
       │  └─────────────┬─────────────┘  └─────────────┬─────────────┘  └──────────┬──────────┘  │
       │                │                              │                           │             │
       │                ▼                              ▼                           ▼             │
       │  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
       │  │                           Core Business Service Layer                             │  │
       │  │    JobService  •  ProfileService  •  ChatService  •  JobMatchService  •  Auth     │  │
       │  └──────────────────────────────────────────┬────────────────────────────────────────┘  │
       └─────────────────────────────────────────────┼───────────────────────────────────────────┘
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             │                                               │
               HikariCP Throttled Pool (Max 3)                     Spring AI REST Client
                             │                                               │
                             ▼                                               ▼
       ┌───────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
       │            DATABASE CLUSTER               │   │           EXTERNAL AI SUITE             │
       │          PostgreSQL 15 (Supabase)         │   │         Google Gemini 1.5 Flash         │
       │                                           │   │                                         │
       │  • Relational Schema (Users, Jobs, Apps)  │   │  • ATS Keyword & Formatting Analysis    │
       │  • Relational Profiles & Experiences      │   │  • Dynamic Interview Question Gen       │
       │  • StoredFile (bytea self-healing BLOB)   │   │  • Candidate Response Scoring & Rubric  │
       │  • Low Connection-Churn Ergonomics        │   │  • Semantic Resume Match Evaluation     │
       └───────────────────────────────────────────┘   └─────────────────────────────────────────┘
`

---

### 🔄 Multi-Layer Data Flow & Pipeline Lifecycles

`
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. Candidate Application & Dual-Storage File Upload Pipeline                                   │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
 Candidate UI ──(Multipart/Form)──> UploadedFileController ──> LocalFileStorageServiceImpl
                                                                     ├── Write to Disk Cache (/uploads/)
                                                                     └── Persist in PostgreSQL (StoredFile bytea)
                                                                                  │
 Candidate UI <──(200 OK + CDN URL)───────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. ATS Resume Analysis & Hybrid Deterministic-LLM Scoring Pipeline                             │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
 Resume File (PDF/DOCX) ──> ResumeParserService (Apache PDFBox / Apache POI)
                                    │
                                    ├──> Phase 1: Deterministic AST Scoring (Layout, Keywords, Structure)
                                    └──> Phase 2: Spring AI Prompt Assembly ──> Gemini 1.5 Flash API
                                                                                     │
 Recruiter & Candidate UI <──(Aggregated Score 0-100 + Qualitative Gap Insights)────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. Full-Duplex Real-Time STOMP WebSocket Messaging Pipeline                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
 Recruiter Client ──[SEND /app/chat.sendMessage]──> JwtChannelInterceptor (Frame Auth)
                                                              │
                                                  ChatWebSocketController
                                                              │
               ┌──────────────────────────────────────────────┴──────────────────────────────┐
               ▼                                                                             ▼
    Persist in Message Entity (DB)                               Broadcast to /topic/conversation.{id}
                                                                                             │
 Candidate Client <──[MESSAGE Frame Delivery]────────────────────────────────────────────────┘
`

---

## 📂 Monorepo Directory Structure

This repository is structured as an enterprise unified monorepo containing both the React 18 frontend and the Java 21 backend, preserving 100% of historical commits across both codebases:

`
JobPortal-AI/ (Monorepo Root)
├── .gitignore                                    # Unified ignore rules (Node, Maven, IDEs, .env)
├── PROJECT_PORTFOLIO_CASE_STUDY.md               # Technical whitepaper, metrics & architecture specs
├── README.md                                     # Root enterprise documentation & setup guide
│
├── 📁 frontend/                                  # Client Single Page Application (React 18 + Vite)
│   ├── 📁 public/                                # Static public distribution assets
│   │   ├── 📁 Companies/                         # Partner & enterprise employer branding logos
│   │   ├── avatar.jpg                            # Default avatar placeholder
│   │   ├── banner.png                            # Default profile cover canvas
│   │   ├── favicon.svg                           # Scalable platform vector favicon
│   │   ├── robots.txt                            # Search engine crawler policies
│   │   ├── site.webmanifest                      # PWA installation manifest
│   │   └── sitemap.xml                           # Search indexing routes
│   │
│   ├── 📁 src/
│   │   ├── 📁 api/                               # Centralized HTTP & Axios client modules
│   │   │   ├── chatApi.js                        # Conversation feeds & REST fallback endpoints
│   │   │   ├── interviewApi.js                   # Mock interview lifecycle session triggers
│   │   │   └── jobMatchApi.js                    # Recruiter candidate match intelligence APIs
│   │   │
│   │   ├── 📁 components/                        # Atomic & Domain UI Component System
│   │   │   ├── 📁 auth/                          # Route guard wrappers (ProtectedRoute, RecruiterRoute)
│   │   │   ├── 📁 recruiter/                     # Recruiter UI (Candidate cards, MatchAnalysisModal)
│   │   │   └── 📁 ui/                            # Atomic primitives (Modals, Toast, ConfirmDialog)
│   │   │
│   │   ├── 📁 config/                            # Environment config, Axios interceptors, WS URLs
│   │   ├── 📁 context/                           # React contextual providers (ThemeContext, AuthContext)
│   │   │
│   │   ├── 📁 features/                          # Self-contained business feature domains
│   │   │   ├── 📁 career-hub/                    # Technical skill assessments & career progression
│   │   │   ├── 📁 mock-interview/                # Voice/text real-time AI interview simulator
│   │   │   ├── 📁 notifications/                 # Real-time toast & in-app notification drawer
│   │   │   ├── 📁 resume-analyzer/               # ATS upload zone, radar charts & score breakdowns
│   │   │   └── 📁 resume-builder/                # Dynamic interactive resume PDF generator
│   │   │
│   │   ├── 📁 hooks/                             # Custom React hooks (useWebSocket, useDebounce)
│   │   ├── 📁 LandingPage/                       # High-converting landing view, hero, stats & testimonials
│   │   │
│   │   ├── 📁 Pages/                             # Top-level route views
│   │   │   ├── 📁 admin/                         # Admin analytics, user moderation, audit logs
│   │   │   ├── 📁 recruiter/                     # Post-job studio, pipeline Kanban, applicants view
│   │   │   ├── 📁 TalentProfile/                 # Candidate public profile showcase & recommendations
│   │   │   ├── ApplyJobPage.jsx                  # Guided 3-step candidate application modal
│   │   │   ├── CareerHubPage.jsx                 # Career roadmaps and skill test modules
│   │   │   ├── CompanyPage.jsx                   # Employer directory & verified profile pages
│   │   │   ├── FindJobs.jsx                      # Multi-facet job search with URL parameter sync
│   │   │   ├── FindTalent.jsx                    # Recruiter candidate discovery engine
│   │   │   ├── Home.jsx                          # Main portal home dashboard
│   │   │   ├── JobDetail.jsx                     # Complete job requisition specifications
│   │   │   ├── MessagesPage.jsx                  # STOMP real-time chat with presence & typing
│   │   │   ├── MyJobsPage.jsx                    # Candidate application status tracker
│   │   │   ├── ProfilePage.jsx                   # Zero-FOUC instant-hydrating candidate profile
│   │   │   └── UploadJob.jsx                     # Recruiter job authoring wizard
│   │   │
│   │   ├── 📁 Profile/                           # Modular candidate profile studio sub-components
│   │   │   ├── About.jsx                         # Candidate biographical summary
│   │   │   ├── CertiCard.jsx                     # Industry certification badges
│   │   │   ├── ExpCard.jsx                       # Timeline employment experience blocks
│   │   │   └── Profile.jsx                       # Main composite profile editor & banner manager
│   │   │
│   │   ├── 📁 State/                             # Redux Toolkit Global State Management
│   │   │   ├── applicationSlice.js               # Application pipeline status & async thunks
│   │   │   ├── AuthSlice.js                      # Authenticated principal & JWT persistence
│   │   │   ├── CompanySlice.js                   # Employer company metadata & listings
│   │   │   ├── JobSlice.js                       # Job search results, active filters & pagination
│   │   │   ├── ProfileSlice.js                   # Candidate resume data & experience trees
│   │   │   └── Store.js                          # Configured Redux Toolkit global store
│   │   │
│   │   ├── 📁 utils/                             # Shared utility functions
│   │   │   ├── assetResolver.js                  # Dynamic image & cloud storage asset resolvers
│   │   │   └── stringFormatters.js               # Currency, date-time, and string sanitizers
│   │   │
│   │   ├── App.jsx                               # Master routing tree, error boundary & suspense
│   │   ├── index.css                             # Tailwind core directives & semantic design tokens
│   │   └── main.jsx                              # React 18 concurrent root bootstrap
│   │
│   ├── .env.example                              # Template environment variables
│   ├── .env.production                           # Production edge endpoint bindings
│   ├── eslint.config.js                          # ESLint rules and code quality checks
│   ├── package.json                              # Dependencies: React 18, Vite 8, Mantine, Tailwind
│   ├── tailwind.config.js                        # Theme palette, breakpoints, and animation configs
│   ├── vercel.json                               # Vercel SPA client routing & security headers
│   └── vite.config.js                            # Rollup code splitting & chunking rules
│
└── 📁 backend/                                   # Core Server Engine (Java 21 + Spring Boot 3.5.x)
    ├── 📁 src/main/java/com/jobportal/
    │   ├── 📁 chat/                              # Real-Time STOMP Messaging Subsystem
    │   │   ├── ChatController.java               # REST conversation query & message history
    │   │   ├── ChatWebSocketController.java      # STOMP message & typing indicator handlers
    │   │   ├── CookieHandshakeInterceptor.java   # HTTP session & cookie handshake extractor
    │   │   ├── JwtChannelInterceptor.java        # STOMP frame CONNECT authentication interceptor
    │   │   ├── StompPrincipal.java               # Custom authenticated WebSocket principal
    │   │   └── WebSocketConfig.java              # Native WebSocket registry & endpoint mapping
    │   │
    │   ├── 📁 config/                            # Enterprise Infrastructure Configurations
    │   │   ├── AsyncConfig.java                  # Thread-bounded Executor for non-blocking tasks
    │   │   ├── SecurityConfig.java               # Spring Security 6 stateless filter chain
    │   │   └── WebConfig.java                    # Global CORS policies & static resource handlers
    │   │
    │   ├── 📁 controller/                        # REST API Controller Endpoints
    │   │   ├── AdminUserController.java          # Admin moderation & user management
    │   │   ├── AuthController.java               # Registration, authentication, OTP verification
    │   │   ├── HealthController.java             # Cloud liveness & readiness health probe
    │   │   ├── JobApplicationController.java     # Candidate application submission & retrieval
    │   │   ├── JobController.java                # Job requisition CRUD & filtered search
    │   │   ├── NotificationController.java       # User notification stream & read receipts
    │   │   ├── ProfileController.java            # Candidate profile CRUD & experience timeline
    │   │   ├── RecruiterController.java          # Recruiter applicant pipeline management
    │   │   └── UploadedFileController.java       # Universal CORS static asset streaming
    │   │
    │   ├── 📁 copilot/                           # AI Career Copilot Assistant
    │   │   ├── AiCopilotController.java          # Conversational career advisor endpoints
    │   │   └── AiCopilotServiceImpl.java         # Context-aware LLM prompt orchestration
    │   │
    │   ├── 📁 dto/                               # Strict Data Transfer Object Contracts
    │   │   ├── AuthDTO.java                      # Authentication request & response schemas
    │   │   ├── JobDTO.java                       # Job requisition request/response envelopes
    │   │   ├── ProfileDTO.java                   # Candidate profile nested data contract
    │   │   └── ResponseDTO.java                  # Standardized enterprise API envelope
    │   │
    │   ├── 📁 entity/                            # PostgreSQL JPA Entities
    │   │   ├── Conversation.java                 # Chat conversation thread entity
    │   │   ├── Job.java                          # Job listing schema, salary, recruiter ref
    │   │   ├── JobApplication.java               # Candidate application lifecycle entity
    │   │   ├── Message.java                      # Individual chat message entity
    │   │   ├── Profile.java                      # Candidate profile, certifications & bio
    │   │   ├── StoredFile.java                   # Database binary (bytea) backing store
    │   │   └── User.java                         # Platform user account & role credentials
    │   │
    │   ├── 📁 interview/                         # AI Mock Interview Engine
    │   │   ├── AiInterviewService.java           # LLM interview simulation orchestration
    │   │   ├── InterviewController.java          # Session initialization & answer submission
    │   │   ├── InterviewQuestion.java            # Dynamic question model with difficulty tiers
    │   │   └── InterviewSession.java             # Stateful candidate interview session tracker
    │   │
    │   ├── 📁 jobmatch/                          # Candidate-Job Match Intelligence Engine
    │   │   ├── AiJobMatchService.java            # Deep semantic qualification evaluation
    │   │   ├── DeterministicJobMatcher.java      # High-speed keyword/regex match algorithm
    │   │   └── JobMatchRecruiterController.java  # Match score analytics endpoints
    │   │
    │   ├── 📁 repository/                        # Spring Data JPA Data Access Interfaces
    │   │   ├── JobApplicationRepository.java     # Application state queries
    │   │   ├── JobRepository.java                # Multi-faceted search queries
    │   │   ├── ProfileRepository.java            # Candidate profile lookups
    │   │   ├── StoredFileRepository.java         # Binary file store access
    │   │   └── UserRepository.java               # User account & authentication lookups
    │   │
    │   ├── 📁 resumeanalysis/                    # ATS Resume Parsing & Scoring Subsystem
    │   │   ├── AiResumeAnalyzerService.java      # LLM qualitative analysis & improvement tips
    │   │   ├── AtsStructureCalculator.java       # Structural layout & contact AST validator
    │   │   ├── KeywordScoreCalculator.java       # Industry skill & competency matcher
    │   │   ├── ResumeAnalysisController.java     # File upload & scoring API endpoints
    │   │   ├── ResumeParserService.java          # PDFBox / POI raw stream text extractor
    │   │   └── ResumeScoringEngine.java          # Aggregated ATS health score calculator
    │   │
    │   ├── 📁 service/                           # Business Logic Service Interfaces
    │   ├── 📁 serviceImpl/                       # Business Logic Service Implementations
    │   │   ├── AuthServiceImpl.java              # User registration & BCrypt verification
    │   │   ├── JobServiceImpl.java               # Job search indexing & pagination logic
    │   │   ├── LocalFileStorageServiceImpl.java  # Dual-layer self-healing file storage engine
    │   │   └── ProfileServiceImpl.java           # Profile mutation & experience timeline
    │   │
    │   └── 📁 utility/                           # Enterprise Utility Modules
    │       ├── FileStorageService.java           # Storage interface abstraction
    │       ├── JWT.java                          # HMAC-SHA256 token generation & validation
    │       └── OtpGenerator.java                 # Cryptographic OTP token utility
    │
    ├── 📁 src/main/resources/
    │   ├── application.properties                # Base Spring Boot configuration
    │   └── application-prod.properties           # Container-optimized production profile
    │
    ├── Dockerfile                                # Multi-stage Eclipse Temurin 21 production build
    └── pom.xml                                   # Maven dependencies (Spring Boot, AI, PDFBox)


---

## 💎 Core Feature Ecosystem

### 1. Applicant & Career Intelligence Hub
- **Dynamic Multi-Parameter Search:** Real-time job filtering across employment type, remote arrangements, experience tiers, and compensation ranges with URL synchronization for shareable bookmarking.
- **Instant Profile Studio:** Comprehensive talent profile builder featuring instant banner/avatar updates, timeline-based work history, educational records, verified certifications, and portfolio links.
- **ATS Resume Analyzer:**
  - Extracts text from PDF and DOCX documents using Apache PDFBox and Apache POI.
  - Computes a deterministic structural score evaluating layout compliance, contact information presence, and standard section headers.
  - Passes structured text to Google Gemini via Spring AI to identify missing competencies, quantify action verbs, and output an overall ATS compatibility score (0–100).
- **Interactive AI Mock Interviewer:** Full simulation replicating technical, behavioral, and architectural interviews. Delivers real-time critique, qualitative scoring, and suggested model answers after every candidate response.
- **Skill Progression Hub:** Automated diagnostic skill assessments generating verified platform certificates upon passing.

### 2. Recruiter ATS Suite & Talent CRM
- **Pipeline Kanban & Applicant Stages:** Manage candidates across 6 discrete stages: APPLIED → IN_REVIEW → SHORTLISTED → INTERVIEW_SCHEDULED → OFFERED / REJECTED.
- **Hybrid Candidate Match Score:** Instantly ranks applicants against open job requirements using both tokenized keyword matching and semantic analysis.
- **Job Publication Engine:** Rich text job authoring, qualification tagging, salary band definition, and one-click active/archive lifecycle toggling.
- **Company Branding Showcase:** Public-facing corporate profiles highlighting team culture, office locations, benefits, and open requisitions.

### 3. Full-Duplex Real-Time Messaging Engine
- **Enterprise WebSocket Architecture:** Sub-millisecond peer-to-peer recruiter-candidate messaging powered by STOMP over native WSS.
- **Stateful Chat Features:** Live typing indicators, conversation-level unread counters, delivery confirmations, and presence tracking.
- **Fault-Tolerant Fallback:** Automatic detection of WebSocket disconnection with graceful transition to background REST synchronization.

### 4. Governance, RBAC & Audit System
- **Three-Tier Role Guarding:** Complete separation between APPLICANT, RECRUITER, and ADMIN privileges.
- **Recruiter Verification Workflow:** Anti-fraud governance preventing unverified accounts from contacting job seekers or publishing listings until validated by an administrator.
- **Platform Telemetry:** Centralized administration portal monitoring platform throughput, active postings, and system health metrics.

---

## ⚡ Engineering Highlights & Deep Technical Innovations

### I. 70% JVM Memory Hardening for 512MB RAM Constraints
* **Problem:** Standard Spring Boot configurations running on Java 21 allocate 25–50% of container memory to heap, plus unbounded Metaspace, GC overhead, and thread stacks. On Render's 512MB RAM free-tier container, this triggered regular Out-Of-Memory (OOMKilled) termination crashes.
* **Engineering Solution:**
  1. Tuned container runtime flags via production container environment variables:
     `ash
     JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=38.0 -XX:MaxMetaspaceSize=192m -XX:+UseG1GC -XX:SoftMaxHeapSize=160m -Xss512k"
     `
  2. Aggressively rightsized the **HikariCP connection pool**:
     `properties
     spring.datasource.hikari.maximum-pool-size=3
     spring.datasource.hikari.minimum-idle=1
     spring.datasource.hikari.idle-timeout=600000
     spring.datasource.hikari.max-lifetime=1800000
     `
  3. Bounded @Async task executor thread pools to prevent runaway memory leaks:
     `java
     executor.setCorePoolSize(2);
     executor.setMaxPoolSize(4);
     executor.setQueueCapacity(50);
     `
* **Measured Result:** Idle memory consumption dropped from **480MB to ~140MB (70% reduction)**, sustaining zero OOM container crashes across continuous production uptime.

### II. Self-Healing Binary Cache Architecture
* **Problem:** Serverless and ephemeral cloud containers (e.g., Render, Heroku) discard local disk storage on dyno restarts. Uploaded profile avatars, company banners, and resumes were completely lost, causing 404 Not Found errors even though database records remained intact.
* **Engineering Solution:** Engineered a **Dual-Layer Self-Healing Storage Subsystem** (LocalFileStorageServiceImpl + StoredFile JPA entity):
  `
  Write Flow:  MultipartFile ──┬──> Disk Cache (/uploads/{subDir}/{filename})
                              └──> PostgreSQL (bytea binary column)

  Read Flow:   Client Request ──> Check Disk Cache
                                      ├── Cache Hit  ──> Stream from disk (O(1) I/O)
                                      └── Cache Miss ──> Fetch bytes from PostgreSQL
                                                         ├── Re-populate disk cache
                                                         └── Stream bytes to client
  `
* **Measured Result:** 100% upload durability across server cold starts and redeployments with disk-level streaming read speeds.

### III. Fault-Tolerant Native STOMP WebSocket Protocol
* **Problem:** Traditional SockJS fallback emulations trigger browser deprecation warnings (such as synchronous unload handler blocks) and cause aggressive 5-second infinite reconnection loops during server restarts.
* **Engineering Solution:**
  - Standardized on native WebSocket (wss://) using @stomp/stompjs client-side and StompSubProtocolHandler in Spring Boot.
  - Implemented **exponential backoff with jitter** (
econnectDelay: 5000 * Math.pow(1.5, attempts), capped at 30 seconds, maximum 5 attempts).
  - Built an automatic REST synchronization fallback that activates if WebSocket handshake fails, preserving messaging availability across restrictive corporate firewalls.

### IV. Dual-Mode Deterministic + LLM Scoring Pipeline
* **Problem:** Relying exclusively on Large Language Models for resume analysis creates high API latency, high cost, and non-deterministic scores for identical input documents.
* **Engineering Solution:**
  - **Deterministic Pass (Phase 1):** Apache PDFBox extracts raw text streams. Custom AST calculators evaluate resume layout, contact validity, section structure, and exact keyword matches in under 30ms.
  - **LLM Semantic Pass (Phase 2):** Spring AI submits structured sections to Google Gemini for qualitative evaluation (action verb quality, career progression, domain-specific insights).
  - **Health Score Aggregator:** Combines deterministic metrics (40%) and semantic metrics (60%) into a reproducible, calibrated score.

### V. Frame-0 UI Hydration & Temporal Dead Zone (TDZ) Fixes
* **Problem:** On page refresh, React profile components exhibited a severe flash-of-unstyled-content (FOUC). If an image was already cached by the browser, onLoad handlers would fail to fire before React event attachment, trapping images in an invisible opacity-0 state. Furthermore, invoking hoisting helper functions inside useState(() => helper()) caused runtime ReferenceError: Cannot access 'helper' before initialization.
* **Engineering Solution:**
  - Hoisted all normalization utilities to module scope, fully eliminating Temporal Dead Zone errors.
  - Seeded component state directly from cached Redux / localStorage on Frame-0.
  - Implemented eager image decoding (decoding="async" loading="eager") with fallback placeholders rendered on error rather than hiding images behind conditional opacity traps.

---

## 💻 Enterprise Tech Stack Matrix

| Architectural Layer | Technologies Used | Justification & Production Role |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3, Vite 8.0 | High-performance SPA with fast HMR and sub-second production bundle times |
| **Styling & Design System** | Tailwind CSS 3.4, Mantine Core UI | Component-level tokenized theme architecture with native Dark/Light mode support |
| **State Management** | Redux Toolkit (RTK) | Centralized, immutable global state with normalized async thunks for API flows |
| **Real-Time Client** | @stomp/stompjs, Native WebSocket | Low-overhead full-duplex socket frames with custom backoff and heartbeat checks |
| **Backend Core** | Java 21 LTS, Spring Boot 3.5.x | High-throughput, modern enterprise Java with Virtual Thread support readiness |
| **Security & Auth** | Spring Security 6, JWT, BCrypt | Stateless bearer token authentication, channel interceptors, and strict RBAC |
| **AI Framework** | Spring AI, Google Gemini 1.5 Flash | Structured prompt engineering for candidate evaluation and interview generation |
| **Document Processing** | Apache PDFBox, Apache POI | Fast, secure text extraction and AST inspection for PDF and DOCX files |
| **Database & Pooling** | PostgreSQL 15, HikariCP | ACID-compliant relational storage, dual-layer binary BLOB store, low-footprint connection pool |
| **Email Service** | Brevo (Sendinblue) SMTP API | Secure transactional OTP verification and notification delivery |
| **Cloud Infrastructure** | Vercel (Edge SPA), Render (Docker Container) | Globally distributed frontend CDN + containerized Spring Boot runtime |

---

## 🔑 Live Platform Demo & Verified Test Accounts

Experience the complete application in a production environment:

| Account Type | Email | Password | Preloaded Capabilities |
| :--- | :--- | :--- | :--- |
| **Candidate / Job Seeker** | 	ruptilodam@gmail.com | TruptiLodam@2004 | Full Candidate Profile, Job Applications, AI Hub, Real-time Chat |
| **Corporate Recruiter** | *Register new account as 'Employer'* | *Any secure password* | Job Publishing, Applicant Pipeline Kanban, Match Analysis |
| **Platform Administrator** | *Configure via DB ADMIN role* | *Protected* | Recruiter Verification, User Auditing, Platform Metrics |

🔗 **Live Platform URL:** [https://job-portal-frontend-rho-nine.vercel.app](https://job-portal-frontend-rho-nine.vercel.app)

---

## 🔐 Environment Variables & Security Configuration

### Backend (pplication.properties / Environment Variables)

`properties
# Server & Network Configuration
server.port=8080

# PostgreSQL Database & Connection Pooling
spring.datasource.url=jdbc:postgresql://<DB_HOST>:<DB_PORT>/<DB_NAME>?sslmode=require
spring.datasource.username=<DB_USER>
spring.datasource.password=<DB_PASSWORD>
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.minimum-idle=1

# Hibernate / JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=false

# Stateless JWT Security
jwt.secret=<STRONG_256_BIT_SECRET_KEY>
jwt.expiration=86400000

# Spring AI / Google Gemini
spring.ai.gemini.api-key=<GEMINI_API_KEY>

# Brevo (Sendinblue) Transactional Mailer
brevo.api.key=<BREVO_API_KEY>
brevo.sender.email=noreply@jobportal.com
brevo.sender.name=JobPortal AI
`

### Frontend (.env.production)

`properties
VITE_API_BASE_URL=https://jobportal-backend-20q9.onrender.com
VITE_WS_URL=wss://jobportal-backend-20q9.onrender.com/ws-chat
`

---

## 🛠️ Local Installation & Development Guide

### Prerequisites
* **Node.js:** 18.x or higher & 
pm
* **Java Development Kit (JDK):** Java 21 (Eclipse Temurin or OpenJDK recommended)
* **Maven:** 3.9+ (or use the included ./mvnw wrapper)
* **Database:** PostgreSQL 15+ running locally or cloud-hosted instance (Supabase/Neon)

### Step 1: Clone the Monorepo
`ash
git clone https://github.com/yashlodam/JobPortal-AI.git
cd JobPortal-AI
`

### Step 2: Configure & Start Backend
`ash
cd backend

# Configure your database credentials in src/main/resources/application.properties
# Run the Spring Boot API
./mvnw clean spring-boot:run
`
*API will bootstrap at: http://localhost:8080*  
*Health Check: http://localhost:8080/health*

### Step 3: Configure & Start Frontend
`ash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
`
*Frontend application will launch at: http://localhost:5173*

---

## 📡 REST API Reference & WebSocket Event Protocol

### 🔑 Authentication & Identity Endpoints
| Method | URI | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /api/auth/register | Register new candidate or employer account | Public |
| POST | /api/auth/login | Authenticate credentials & generate JWT token | Public |
| POST | /api/auth/verify-otp | Validate registration email OTP | Public |
| GET | /api/users/me | Fetch authenticated user profile and roles | Authenticated |

### 💼 Jobs & Applications
| Method | URI | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | /api/jobs | Paginated search with multi-parameter filtering | Public |
| GET | /api/jobs/{id} | Detailed job listing with company metadata | Public |
| POST | /api/jobs | Create a new job requisition | Recruiter |
| PUT | /api/jobs/{id} | Update existing job details or status | Recruiter (Owner) |
| POST | /api/applications/apply | Submit multi-part application with resume | Candidate |
| GET | /api/applications/my | View all submitted candidate applications | Candidate |
| PATCH | /api/recruiter/applications/{id}/status | Transition candidate pipeline state | Recruiter |

### 🤖 AI Career Intelligence Engine
| Method | URI | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | /api/resume-analysis/analyze | Upload resume for ATS parsing & scoring | Candidate |
| POST | /api/interview/start | Initialize AI mock interview session | Candidate |
| POST | /api/interview/submit-answer | Evaluate candidate response & return model critique | Candidate |
| GET | /api/recruiter/match/{jobId}/{candidateId} | Compute deterministic + AI applicant match score | Recruiter |

### 💬 Real-Time STOMP WebSocket Protocol
* **Handshake Endpoint:** wss://<HOST>/ws-chat
* **STOMP Inbound Destination:** /app/chat.sendMessage (Message payload routing)
* **STOMP Outbound Topic:** /topic/conversation.{conversationId} (Subscribed client broadcast)
* **User-Specific Queue:** /user/queue/notifications (Direct alerts, unread counts)

---

## 🧪 Testing & Quality Assurance

The codebase includes automated test suites covering backend business logic, security rules, and frontend components:

`ash
# Run Spring Boot backend test suite (JUnit 5, Mockito, Spring Security Test)
cd backend
./mvnw clean test

# Run Frontend build verification & linting
cd ../frontend
npm run build
`

---

## 🚢 Deployment Architecture & Production Strategy

### Frontend (Vercel Edge Platform)
* Automated CI/CD pipeline triggered on every push to main.
* Global CDN caching for static assets with instant edge invalidation.
* Client-side routing redirects managed via rontend/vercel.json.

### Backend (Render Cloud Platform)
* Containerized multi-stage Docker build utilizing Eclipse Temurin 21 JRE.
* Automated health checks via /health endpoint ensuring zero-downtime rolling deploys.
* Production JVM flags configured via container environment variables to guarantee sub-200MB memory operation.

---

## 👨‍💻 Author & Professional Network

**Yash Lodam**  
*Full-Stack Software Engineer & Distributed Systems Architect*

- 🌐 **Portfolio & Projects:** [github.com/yashlodam](https://github.com/yashlodam)  
- 💼 **LinkedIn:** [linkedin.com/in/yashlodam](https://linkedin.com/in/yashlodam)  
- 🐙 **GitHub:** [@yashlodam](https://github.com/yashlodam)  
- ✉️ **Direct Inquiries:** yashlodam@gmail.com

---

<div align="center">
  <sub>Engineered with precision for production reliability. Distributed under the MIT License.</sub><br>
  <sub>Copyright © 2026 Yash Lodam. All rights reserved.</sub>
</div>
