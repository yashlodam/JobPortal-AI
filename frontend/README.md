# JobPortal AI — Frontend Client Application

> **Next-Generation AI-Powered Talent Ecosystem & Recruitment Platform**  
> Built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **Redux Toolkit**, and real-time **STOMP/WebSocket** streaming.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.12-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 🌟 Executive Overview

**JobPortal AI** is an intelligent full-stack employment platform uniting candidates, recruiters, and platform administrators. The client application delivers lightning-fast UI experiences, strict ATS-compliant resume tools, deterministic and semantic job matching, automated mock interview simulations, and role-based management studios.

---

## 🚀 Key Modules & Feature Highlights

### 1. 🤖 AI Career Hub
* **AI Resume Builder:**
  * **6 Tailored Layouts:** Modern, Minimalist, Professional (ATS), Software Engineer (Tech Stack), Creative (Design/Marketing), and Fresher/Graduate (Academic-First).
  * **100% Inline Styles for PDF Export:** Built to avoid `oklch()` rendering anomalies in HTML canvas engines, ensuring crystal-clear vector/raster A4 PDF downloads.
  * **Spring AI Integration:** Generates 3–4 sentence executive summaries, suggests contextual skills based on work history, and rewrites bullets with impact metrics.
  * **Resume Health Panel:** Live section completion checklist with progress indicators and on-demand ATS audits.
* **AI Resume Analyzer:**
  * Multi-format resume parsing (`.pdf`, `.docx`).
  * ATS score computation, keyword extraction, and gap analysis.
  * Structural feedback broken down into Brevity, Impact, Formatting, and Skills Alignment.
* **AI Mock Interview Coach:**
  * Simulated interview rounds across Technical, System Design, and Behavioral tracks.
  * Real-time timer, answer evaluation, STAR technique analysis, and personalized post-interview scorecards.
* **Floating AI Career Copilot:**
  * Context-aware interactive career advisor assisting with role discovery, salary negotiation strategies, and application optimization.

---

### 2. 🎯 Real AI Job Match Engine
* **Objective Deterministic Scoring:**
  * Direct skill alignment comparing candidate profile and resume data against employer requirements using canonical aliases and token boundaries.
  * **Honest Metrics:** No hardcoded floors or artificial score inflations. Displays true match percentages (0–100%).
* **Transparent Breakdown:**
  * Interactive accordion showing **Matched Skills**, **Missing Required Skills**, and personalized **Match Insights** (e.g., location match, experience alignment).
* **Dynamic Color-Coded Badging:**
  * 🟢 **85%+:** Excellent Fit
  * 🟣 **70–84%:** Great Fit
  * 🔵 **50–69%:** Good Fit
  * 🟡 **35–49%:** Fair Fit
  * 🔴 **<35%:** Low Fit

---

### 3. 💼 Candidate Experience
* **Semantic & Faceted Job Search:**
  * Full-text search with instant faceted filtering by City, State, Work Mode (`REMOTE`, `HYBRID`, `ONSITE`), Job Type, Category, Experience Level, and Salary sliders.
* **Streamlined 1-Click Application (`/apply-jobs`):**
  * Auto-loads candidate's verified profile data.
  * Instant resume picker with live AI match recalculation per selected resume.
  * AI-powered cover letter draft generator supporting multiple tones (*Results-Driven*, *Vision-Aligned*, *Concise*).
* **Application Tracker (`/my-jobs`):**
  * Multi-tab pipeline tracking (`Applied`, `Saved`, `Interviews`).
  * Stage indicators: `APPLIED` ➔ `UNDER_REVIEW` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `SELECTED` / `REJECTED`.

---

### 4. 🏢 Recruiter Studio
* **Recruiter Command Center (`/recruiter/dashboard`):**
  * Hiring metrics: active jobs, pending reviews, candidate pipeline volume.
* **Candidate Sourcing & Screening:**
  * Ranked candidate pipelines sorted by real AI match percentage.
  * **Match Analysis Modal:** Deep dive into candidate strengths, experience relevance, and missing skills before inviting to interview.
* **Job Management & Publishing:**
  * Multi-step job posting wizard with salary bands, skill requirements, and vacancy controls.
* **Real-Time Messaging (`/recruiter/messages`):**
  * WebSocket-powered direct messaging with candidates.

---

### 5. 🛡️ Admin Console (`/admin/*`)
* Verification workflow for newly registered recruiter accounts.
* Global user management (Candidates, Recruiters, Admins) with suspension toggles.
* System-wide job moderation, employer compliance tracking, and dispute resolution.

---

## 🎨 Design System & Theme Engine

The frontend uses **Tailwind CSS v4** coupled with custom CSS design tokens to guarantee seamless light and dark mode transitions without UI flickers or contrast regressions.

### Color Tokens (`src/index.css`)

| Semantic Token | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `var(--bg-app)` | `#F8FAFC` (Slate 50) | `#070B12` (Deep Obsidian) | Page Background |
| `var(--bg-surface)` | `#FFFFFF` (Pure White) | `#0D1117` (Dark Navy) | Cards, Modals, Menus |
| `var(--bg-elevated)` | `#F1F5F9` (Slate 100) | `#161B22` (Elevated Charcoal) | Hover States, Insets |
| `var(--text-heading)` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Titles, Metric Headers |
| `var(--text-body)` | `#334155` (Slate 700) | `#94A3B8` (Slate 400) | Paragraphs, Descriptions |
| `var(--text-muted)` | `#64748B` (Slate 500) | `#64748B` (Slate 500) | Captions, Timestamps |
| `var(--border-subtle)` | `#E2E8F0` (Slate 200) | `rgba(255,255,255,0.08)` | Dividers, Card Outlines |

---

## 📂 Project Architecture

```
job-portal-frontend/
├── public/                     # Static assets (favicons, banners, illustrations)
├── src/
│   ├── api/                    # Centralized API service functions (Axios)
│   │   ├── jobMatchApi.js      # Match scoring & candidate ranking endpoints
│   │   └── recruiterApi.js     # Recruiter pipeline & interview management
│   ├── ApplyJob/               # 1-Click Job Application page & logic
│   ├── components/             # Reusable UI primitives & layouts
│   │   ├── admin/              # Admin layout & management tables
│   │   ├── auth/               # Route guards (ProtectedRoute, RecruiterRoute, AdminRoute)
│   │   ├── recruiter/          # Match badges, candidate modals, status pickers
│   │   ├── recommendation/     # CandidateJobMatchWidget & Recommendations feed
│   │   ├── ui/                 # Token-aware primitives (Card, Badge, Button, Modal, Table)
│   │   └── Layout.jsx          # Root shell layout with navigation & footer
│   ├── config/
│   │   └── Api.js              # Axios base instance with cookie & error interceptors
│   ├── context/
│   │   └── ThemeContext.jsx    # Theme provider with system preference detection
│   ├── features/               # Modular business domains
│   │   ├── mock-interview/     # Audio/text AI interview sessions & scorecards
│   │   ├── notifications/      # Real-time alert feed & category filters
│   │   ├── resume-analyzer/    # Resume upload & ATS diagnostic report views
│   │   └── resume-builder/     # 6 ATS resume templates, live canvas & Redux state
│   ├── Header/                 # Navigation bar, notifications bell, user avatar menu
│   ├── LandingPage/            # Marketing homepage, hero search dock, trust badges
│   ├── Pages/                  # Route-level page components
│   │   ├── admin/              # Admin pages (Users, Recruiters, Jobs, Reports)
│   │   ├── recruiter/          # Recruiter pages (Dashboard, Pipeline, Analytics)
│   │   ├── TalentProfile/      # Candidate talent cards & public portfolio views
│   │   ├── FindJobs.jsx        # Faceted job search catalog
│   │   ├── JobDetail.jsx       # Job description & match score widget
│   │   └── MyJobsPage.jsx      # Candidate application tracking dashboard
│   ├── State/                  # Redux Toolkit global store configuration
│   │   ├── Store.js            # Central store registration & custom typed hooks
│   │   ├── AuthSlic.js         # User session & profile state
│   │   ├── JobSlice.js         # Jobs catalog & active job selection
│   │   ├── applicationSlice.js # Job application submissions & status
│   │   ├── profileSlice.js     # Candidate profile data, skills & experience
│   │   └── resumeSlice.js      # Uploaded PDF resumes & default resume pointer
│   ├── utils/                  # String formatters, date utilities, URL resolvers
│   ├── App.jsx                 # Route definitions, Code-splitting & Error Boundaries
│   ├── index.css               # Tailwind v4 directives & semantic CSS variables
│   └── main.jsx                # Application root entry point
├── package.json                # Project dependencies & build scripts
├── vite.config.js              # Vite configuration, proxy setup & plugins
└── README.md                   # Project documentation
```

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Core Framework** | React 19, Vite 8 |
| **Routing** | React Router DOM v7 (Lazy loading with Suspense) |
| **State Management** | Redux Toolkit 2.x, React-Redux |
| **Styling & Design** | Tailwind CSS v4, Custom CSS Variables, Lucide React, Tabler Icons |
| **Animations** | Framer Motion 12 |
| **Networking** | Axios (HttpOnly cookie authentication) |
| **Real-Time Streaming**| StompJS, SockJS Client (WebSockets) |
| **Document Generation**| html2canvas, jsPDF, html2pdf.js |
| **Notifications** | Mantine Notifications, Custom Toast Notification System |

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the frontend project:

```env
# Backend Base API URL
VITE_API_BASE_URL=http://localhost:8080/api

# WebSocket Server URL
VITE_WS_BASE_URL=http://localhost:8080/ws

# Optional App Environment Identifier
VITE_APP_ENV=development
```

---

## 🚦 Getting Started

### Prerequisites
* **Node.js**: `v20.x` or higher (LTS recommended)
* **Package Manager**: `npm` (v10+) or `pnpm`
* **Backend API**: Spring Boot server running on `http://localhost:8080`

### 1. Installation
Clone the repository and install dependencies:
```bash
cd "job-portal-frontend"
npm install
```

### 2. Run the Development Server
Launch Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Verification
Create an optimized production bundle:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🔐 Authentication & Route Protection

The frontend uses **HttpOnly JWT cookies** for secure authentication, eliminating XSS token theft vulnerabilities.

```mermaid
graph TD
    A[Visitor] -->|Public Routes| B[Home / Find Jobs / Login / Register]
    A -->|Protected Route| C{Authenticated?}
    C -->|No| D[Redirect to /login]
    C -->|Yes| E{Role Authorization}
    E -->|APPLICANT| F[Career Hub / Apply / My Jobs / Profile]
    E -->|RECRUITER| G{Verified Status?}
    G -->|Pending| H[/recruiter/verification]
    G -->|Approved| I[Recruiter Dashboard / Pipeline / Post Job]
    E -->|ADMIN| J[Admin Console / Verification Management]
```

### Key Guards (`src/components/auth/`):
* `ProtectedRoute`: Ensures the user is logged in before accessing candidate tools.
* `RecruiterRoute`: Validates that the active session has `RECRUITER` role.
* `RecruiterVerificationGuard`: Restricts unverified recruiters to the verification status screen.
* `AdminRoute`: Enforces `ADMIN` authority for platform configuration and user management.

---

## 🤝 Contribution & Quality Standards

1. **Clean Semantic Architecture**: Use design token classes (`bg-surface`, `text-heading`, `border-border`) rather than hardcoded hex values.
2. **Deterministic Fallbacks**: Never insert fake scores, simulated delays, or artificial rating floors (`Math.max`). Always display genuine platform data.
3. **Print & PDF Integrity**: When modifying resume templates, enforce inline styles to preserve PDF rendering fidelity across canvas tools.

---

## 📄 License
This project is open-source and available under the **MIT License**.
