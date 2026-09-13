<div align="center">

# 💼 JobPortal AI
### Full-Stack Recruitment Platform & AI Career Intelligence Engine

**Job seekers • Recruiters • Administrators**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://job-portal-frontend-rho-nine.vercel.app)
[![API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://jobportal-backend-20q9.onrender.com/health)
[![Java 21](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot 3.5](https://img.shields.io/badge/Spring_Boot-3.5.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[🌐 **Live Platform**](https://job-portal-frontend-rho-nine.vercel.app) • [⚙️ **Backend Repository**](https://github.com/yashlodam/JobPortal-AI) • [🐛 **Issues**](https://github.com/yashlodam/JobPortal-AI/issues)

> A production-oriented recruitment platform combining secure full-stack workflows, deterministic matching, AI-assisted career tools, and real-time recruiter–candidate communication.

</div>

---

## 📌 Overview

**JobPortal AI** is a full-stack recruitment platform built to connect job seekers, recruiters, and platform administrators through a single application.

The platform combines:

- **Candidate workflows** for profiles, job discovery, applications, resumes, career tools, and interviews.
- **Recruiter workflows** for job publishing, applicant pipelines, candidate matching, and company profiles.
- **Administrative workflows** for role governance and recruiter verification.
- **AI-assisted career features** for resume analysis, semantic matching, and mock interviews.
- **Real-time communication** using STOMP over WebSocket with REST-based synchronization support.

The project is designed as separate frontend and backend codebases so each layer can be developed and deployed independently.

---

## ✨ Key Features

### 👤 Candidate & Career Intelligence

- Multi-parameter job search with filtering and URL-synchronized search state.
- Candidate profile management with experience, education, certifications, and portfolio information.
- Resume upload and parsing for PDF/DOCX documents.
- ATS-oriented resume structure and keyword analysis.
- AI-assisted resume feedback using Spring AI and Google Gemini.
- AI mock interview sessions with generated questions and response evaluation.
- Career skill assessments and progress-oriented career tooling.
- Application tracking and application-status workflows.

### 🧑‍💼 Recruiter & ATS Workflows

- Recruiter job creation, editing, publishing, and lifecycle management.
- Applicant pipeline with configurable recruitment stages.
- Candidate search and recruiter-facing applicant views.
- Hybrid candidate–job matching using deterministic and semantic signals.
- Company profile pages and open-position discovery.
- Recruiter verification workflow with admin approval/rejection.

### 💬 Real-Time Messaging

- Recruiter–candidate conversations using native WebSocket + STOMP.
- Typing indicators, unread counts, and presence-oriented UI states.
- JWT-aware WebSocket connection handling.
- Bounded reconnect logic with backoff.
- REST synchronization fallback when real-time connectivity is unavailable.

### 🔐 Security & Governance

- JWT-based stateless authentication.
- Spring Security role-based access control.
- Candidate, Recruiter, and Admin authorization boundaries.
- BCrypt password hashing.
- Recruiter verification before restricted recruiter actions.
- API-level ownership and authorization checks.

### 📎 File Storage

- Resume, avatar, and company-image handling.
- Local disk used as a fast cache where available.
- PostgreSQL `bytea` persistence used as a durable backing store in the documented architecture.
- Cache-miss recovery from the database-backed copy.

---

## 🏗️ Architecture

```text
                         CLIENTS
            ┌─────────────────────────────┐
            │ Desktop • Mobile • Tablet  │
            └──────────────┬──────────────┘
                           │
                     HTTPS / WSS
                           │
                           ▼
            ┌─────────────────────────────┐
            │   React 18 + Vite Frontend  │
            │   Vercel deployment         │
            └──────────────┬──────────────┘
                           │ REST / JSON
                           │ WSS / STOMP
                           ▼
            ┌─────────────────────────────┐
            │ Java 21 + Spring Boot 3.5   │
            │ Render deployment           │
            ├─────────────────────────────┤
            │ Spring Security / JWT       │
            │ REST Controllers            │
            │ Business Services            │
            │ STOMP WebSocket              │
            │ Async Job Matching            │
            │ Resume Analysis               │
            └───────┬───────────┬─────────┘
                    │           │
                  JDBC        HTTPS
                    │           │
                    ▼           ▼
          ┌──────────────┐  ┌───────────────┐
          │ PostgreSQL   │  │ Google Gemini │
          │ Supabase     │  │ via Spring AI │
          └──────────────┘  └───────────────┘
                    │
                    ▼
          ┌────────────────────┐
          │ Brevo Email API    │
          └────────────────────┘
```

### Repository model

The project uses separate repositories for the application layers:

```text
Frontend Repository
   └── React 18 + Vite + Redux Toolkit + Tailwind CSS

Backend Repository
   └── Java 21 + Spring Boot 3.5 + Spring Security + JPA/Hibernate
```

**Backend repository:** https://github.com/yashlodam/JobPortal-AI  
**Frontend repository:** add the exact frontend repository URL here before publishing this README.

---

## 🔄 Core Application Flows

### 1. Candidate Application → Match Analysis

```text
Candidate submits application
        ↓
Application stored in PostgreSQL
        ↓
Application event published
        ↓
Transaction commits
        ↓
Async matching listener
        ↓
Deterministic skill / experience matching
        ↓
Semantic AI analysis
        ↓
Candidate–job compatibility result
        ↓
Stored and exposed to authorized users
```

### 2. Resume Analysis

```text
PDF / DOCX upload
       ↓
Resume parser
       ↓
Text extraction
       ↓
Deterministic structure + keyword checks
       ↓
Spring AI / Gemini semantic analysis
       ↓
Aggregated resume insights
       ↓
Candidate-facing results
```

### 3. Real-Time Messaging

```text
Recruiter / Candidate
        ↓
Native WebSocket handshake
        ↓
STOMP CONNECT / authentication
        ↓
Message publish
        ↓
Server-side authorization
        ↓
Persist message
        ↓
Broadcast to conversation topic
        ↓
Connected client receives message
```

---

## 🧠 Engineering Highlights

### 1. Resource-Constrained JVM Optimization

The backend was tuned for deployment on a small-memory cloud container.

The optimization work included:

- JVM memory configuration.
- Metaspace limits.
- HikariCP connection-pool sizing.
- Bounded asynchronous task executors.
- Reduced unnecessary memory pressure from background processing.

A measured backend memory reduction from approximately **480 MB to 140 MB** is documented in the project case study.

### 2. Hybrid Deterministic + Semantic Matching

The matching pipeline separates deterministic rules from semantic AI processing.

```text
Deterministic signals
    ├── skills
    ├── experience
    ├── keywords
    └── structure

            +

Semantic signals
    ├── contextual relevance
    ├── qualitative feedback
    └── skill / requirement relationships
```

This approach keeps rule-based scoring predictable while using LLMs where contextual interpretation provides additional value.

### 3. Resilient WebSocket Communication

The chat subsystem uses native WebSocket + STOMP and includes bounded reconnect handling.

The documented client strategy includes:

- reconnect backoff
- capped retry attempts
- connection-state handling
- REST synchronization fallback
- cleanup of disconnected connections

### 4. Database-Backed File Recovery

The documented file-storage strategy uses local disk as a fast cache and PostgreSQL binary storage as a persistent backing layer.

```text
Read request
   ↓
Check local cache
   ├── Hit  → stream file
   └── Miss → read PostgreSQL bytea
                   ↓
              restore cache
                   ↓
              stream file
```

---

## 🧩 Tech Stack

| Layer | Technologies |
|---|---|
| Language | Java 21, JavaScript, SQL |
| Backend | Spring Boot 3.5, Spring MVC, Spring Security, Spring Data JPA, Hibernate |
| API | REST APIs, JSON, JWT |
| Frontend | React 18, Vite, Redux Toolkit, Tailwind CSS |
| Database | PostgreSQL 15, JPA/Hibernate, HikariCP |
| Real-Time | WebSocket, STOMP, `@stomp/stompjs` |
| AI | Spring AI, Google Gemini |
| Documents | Apache PDFBox, Apache POI |
| Email | Brevo |
| Build | Maven, npm |
| DevOps | Docker, Render, Vercel, Supabase |
| Testing / API Tools | JUnit, Mockito, Spring Security Test, Postman |

---

## 📁 Backend Structure

```text
src/main/java/com/jobportal/
├── chat/
│   ├── ChatController.java
│   ├── ChatWebSocketController.java
│   ├── CookieHandshakeInterceptor.java
│   ├── JwtChannelInterceptor.java
│   ├── StompPrincipal.java
│   └── WebSocketConfig.java
│
├── config/
│   ├── AsyncConfig.java
│   ├── SecurityConfig.java
│   └── WebConfig.java
│
├── controller/
│   ├── AdminUserController.java
│   ├── AuthController.java
│   ├── HealthController.java
│   ├── JobApplicationController.java
│   ├── JobController.java
│   ├── NotificationController.java
│   ├── ProfileController.java
│   ├── RecruiterController.java
│   └── UploadedFileController.java
│
├── copilot/
│   ├── AiCopilotController.java
│   └── AiCopilotServiceImpl.java
│
├── dto/
├── entity/
├── interview/
├── jobmatch/
├── repository/
├── resumeanalysis/
├── service/
├── serviceImpl/
└── utility/
```

---

## 🎨 Frontend Structure

```text
src/
├── api/
│   ├── chatApi.js
│   ├── interviewApi.js
│   └── jobMatchApi.js
│
├── components/
├── config/
├── context/
├── features/
│   ├── career-hub/
│   ├── mock-interview/
│   ├── notifications/
│   ├── resume-analyzer/
│   └── resume-builder/
│
├── hooks/
├── LandingPage/
├── Pages/
├── Profile/
├── State/
│   ├── applicationSlice.js
│   ├── AuthSlice.js
│   ├── CompanySlice.js
│   ├── JobSlice.js
│   ├── ProfileSlice.js
│   └── Store.js
├── utils/
├── App.jsx
├── index.css
└── main.jsx
```

---

## 🔐 Security Model

### Authentication

- JWT-based authentication.
- Password hashing with BCrypt.
- Stateless Spring Security configuration.
- HttpOnly cookie-based authentication where configured.

### Authorization

| Role | Typical Access |
|---|---|
| Candidate | Profile, job search, applications, resume tools, interviews, chat |
| Recruiter | Job management, applicants, matching, recruiter workflows, chat |
| Admin | Recruiter verification and platform administration |

### Security principles

- Server-side authorization is enforced independently of frontend visibility.
- API credentials and secrets are supplied through environment variables.
- Backend secrets are never intended for frontend bundles.
- WebSocket messages are authenticated and authorized before processing.

---

## 🤖 AI Features

### Resume Analysis

The resume-analysis pipeline combines deterministic checks with semantic AI evaluation.

Document extraction is handled by:

- Apache PDFBox for PDF content.
- Apache POI for DOCX content.

The analysis can evaluate areas such as:

- resume structure
- contact information
- section organization
- keyword presence
- competency gaps
- action-verb quality
- contextual relevance

### Job Matching

The platform uses a hybrid approach:

- deterministic skill and experience signals
- semantic analysis using Spring AI and Google Gemini
- asynchronous processing after application events

### AI Mock Interviews

The interview subsystem supports:

- dynamic question generation
- technical and behavioral interview flows
- candidate response evaluation
- qualitative feedback
- improvement-oriented guidance

---

## 📡 REST API Overview

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/verify-otp` | Public |
| `GET` | `/api/users/me` | Authenticated |

### Jobs & Applications

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/jobs` | Public |
| `GET` | `/api/jobs/{id}` | Public |
| `POST` | `/api/jobs` | Recruiter |
| `PUT` | `/api/jobs/{id}` | Recruiter / Owner |
| `POST` | `/api/applications/apply` | Candidate |
| `GET` | `/api/applications/my` | Candidate |
| `PATCH` | `/api/recruiter/applications/{id}/status` | Recruiter |

### AI / Career Intelligence

| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/api/resume-analysis/analyze` | Candidate |
| `POST` | `/api/interview/start` | Candidate |
| `POST` | `/api/interview/submit-answer` | Candidate |
| `GET` | `/api/recruiter/match/{jobId}/{candidateId}` | Recruiter |

---

## 💬 WebSocket Protocol

**Handshake:**

```text
wss://<HOST>/ws-chat
```

**Inbound destination:**

```text
/app/chat.sendMessage
```

**Conversation broadcast:**

```text
/topic/conversation.{conversationId}
```

**User-specific destination:**

```text
/user/queue/notifications
```

---

## ⚙️ Environment Configuration

Never commit real credentials to source control.

### Backend

Typical server-side configuration includes:

```properties
server.port=${PORT:8080}

spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}

spring.datasource.hikari.maximum-pool-size=${DB_POOL_MAX:3}
spring.datasource.hikari.minimum-idle=${DB_POOL_MIN:1}

jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

spring.ai.gemini.api-key=${GEMINI_API_KEY}

brevo.api.key=${BREVO_API_KEY}
brevo.sender.email=${MAIL_FROM}
brevo.sender.name=${MAIL_FROM_NAME:JobPortal AI}

app.frontend-url=${FRONTEND_URL}
```

### Frontend

Typical production variables:

```properties
VITE_API_BASE_URL=https://<BACKEND_HOST>
VITE_WS_URL=wss://<BACKEND_HOST>/ws-chat
```

Use your actual deployed values in the hosting platform rather than committing private credentials.

---

## 💻 Local Development

### Prerequisites

- Java 21
- Maven 3.9+
- Node.js 18+
- PostgreSQL 15+

### Backend

```bash
cd backend
./mvnw clean spring-boot:run
```

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd clean spring-boot:run
```

Backend default:

```text
http://localhost:8080
```

Health check:

```text
http://localhost:8080/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default:

```text
http://localhost:5173
```

---

## 🧪 Testing & Quality

### Backend

```bash
cd backend
./mvnw clean test
```

### Frontend

```bash
cd frontend
npm run build
```

Recommended checks before deployment:

```text
[ ] Backend tests pass
[ ] Frontend production build passes
[ ] Database connectivity verified
[ ] Health endpoint responds
[ ] CORS origin is correct
[ ] HttpOnly cookie flow is verified
[ ] WebSocket handshake succeeds
[ ] AI API key is configured server-side
[ ] No secrets are committed
```

---

## 🚀 Deployment

### Frontend — Vercel

The frontend is deployed as a Vite SPA.

Verify:

- production API base URL
- production WebSocket URL
- SPA route rewrites
- environment variables

### Backend — Render

The backend is containerized with Docker and deployed to Render.

Verify:

- Render `PORT` is respected
- JVM memory settings are appropriate for the selected instance
- health endpoint is configured
- Supabase connection variables are present
- CORS points to the deployed frontend origin
- WebSocket endpoint uses `wss://` behind HTTPS

### Database — Supabase

PostgreSQL is hosted on Supabase and accessed by the Spring Boot backend over JDBC.

The frontend should not connect directly to the database.

---

## 📊 Performance & Reliability Notes

The project includes explicit resource-management work for constrained cloud environments:

- HikariCP connection-pool rightsizing.
- Bounded asynchronous executors.
- Container-aware JVM configuration.
- WebSocket reconnect backoff.
- Pagination and bounded database access for larger datasets.
- Lightweight health checking.
- Separation of API, persistence, AI, and real-time communication concerns.

The project documentation records a measured backend-memory reduction from approximately **480 MB to 140 MB** during optimization work.

---

## 🛡️ Production Security Checklist

Before publishing or deploying:

- [ ] Rotate any credential that was ever exposed in source control.
- [ ] Keep `DATABASE_PASSWORD`, `JWT_SECRET`, `GEMINI_API_KEY`, and `BREVO_API_KEY` server-side.
- [ ] Do not place backend secrets in `VITE_*` variables.
- [ ] Use HTTPS for production APIs.
- [ ] Use `wss://` for production WebSocket connections.
- [ ] Restrict CORS to the deployed frontend origin.
- [ ] Keep authorization checks on the backend.
- [ ] Validate uploaded files and request sizes.

---

## 🔗 Project Links

- 🌐 **Live Demo:** https://job-portal-frontend-rho-nine.vercel.app
- ⚙️ **Backend Repository:** https://github.com/yashlodam/JobPortal-AI
- 🐛 **Issue Tracker:** https://github.com/yashlodam/JobPortal-AI/issues
- 📖 **Technical Case Study:** `PROJECT_PORTFOLIO_CASE_STUDY.md`

### Frontend Repository

Add the exact frontend repository URL here before publishing this README:

```text
<FRONTEND_REPOSITORY_URL>
```

---

## 👨‍💻 Author

**Yash Lodam**  
Java Full Stack Developer

- GitHub: https://github.com/yashlodam
- LinkedIn: https://www.linkedin.com/in/yashlodam
- LeetCode: https://leetcode.com/u/yashlodam2004/
- Email: yashlodam03@gmail.com

---

## 📄 License

This project is distributed under the MIT License.

See the repository license file for the complete terms.

---

<div align="center">

**Built as a production-oriented Java Full Stack project combining secure APIs, real-time communication, database-driven workflows, and AI-assisted career tooling.**

</div>
