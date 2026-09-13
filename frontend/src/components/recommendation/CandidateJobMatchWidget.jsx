/**
 * src/components/recommendation/CandidateJobMatchWidget.jsx
 *
 * Real-time match scoring widget for Job Detail pages.
 * Mirrors the backend DeterministicJobMatcher scoring logic:
 *   Skills 55% + Location 25% + Experience 15% (fixed baseline) + Freshness 5%
 *
 * Uses word-boundary matching to prevent:
 *   "java" matching "javascript"
 *   "git" matching "digital"
 *   "r" matching "react" etc.
 */

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Star,
  ArrowRight,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useAppSelector } from "../../State/Store";

// ── Skill alias map (mirrors backend DeterministicJobMatcher) ─────────────────
// Only the most common aliases — keeps bundle light while catching key synonyms
const SKILL_ALIASES = {
  "spring boot": "spring boot",
  springboot: "spring boot",
  "spring-boot": "spring boot",
  spring: "spring boot",
  "spring framework": "spring boot",
  "spring mvc": "spring boot",
  java: "java",
  "java 21": "java",
  "java 17": "java",
  "java 11": "java",
  "java 8": "java",
  "core java": "java",
  j2ee: "java",
  "jakarta ee": "java",
  python: "python",
  python3: "python",
  "python 3": "python",
  javascript: "javascript",
  js: "javascript",
  ecmascript: "javascript",
  es6: "javascript",
  typescript: "typescript",
  ts: "typescript",
  react: "react",
  "react.js": "react",
  reactjs: "react",
  "react js": "react",
  angular: "angular",
  angularjs: "angular",
  "angular 2+": "angular",
  vue: "vue",
  "vue.js": "vue",
  vuejs: "vue",
  "node.js": "node.js",
  nodejs: "node.js",
  node: "node.js",
  "express.js": "express.js",
  express: "express.js",
  expressjs: "express.js",
  django: "django",
  flask: "flask",
  fastapi: "fastapi",
  "next.js": "next.js",
  nextjs: "next.js",
  "nuxt.js": "nuxt.js",
  nuxtjs: "nuxt.js",
  aws: "aws",
  "amazon web services": "aws",
  gcp: "gcp",
  "google cloud": "gcp",
  azure: "azure",
  "microsoft azure": "azure",
  docker: "docker",
  containerization: "docker",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  "ci/cd": "ci/cd",
  cicd: "ci/cd",
  jenkins: "ci/cd",
  "github actions": "ci/cd",
  git: "git",
  github: "git",
  gitlab: "git",
  "version control": "git",
  postgresql: "postgresql",
  postgres: "postgresql",
  mysql: "mysql",
  mongodb: "mongodb",
  mongo: "mongodb",
  redis: "redis",
  kafka: "kafka",
  "apache kafka": "kafka",
  rabbitmq: "rabbitmq",
  sql: "sql",
  "rest api": "rest api",
  "restful api": "rest api",
  restful: "rest api",
  rest: "rest api",
  microservices: "microservices",
  microservice: "microservices",
  golang: "golang",
  go: "golang",
  "c#": "c#",
  csharp: "c#",
  ".net": ".net",
  ".net core": ".net",
  "asp.net": ".net",
  "c++": "c++",
  cpp: "c++",
  html: "html",
  html5: "html",
  css: "css",
  css3: "css",
  tailwind: "tailwind",
  tailwindcss: "tailwind",
  flutter: "flutter",
  dart: "flutter",
  kotlin: "kotlin",
  swift: "swift",
  "machine learning": "machine learning",
  ml: "machine learning",
  "deep learning": "deep learning",
  tensorflow: "tensorflow",
  pytorch: "pytorch",
  agile: "agile",
  scrum: "agile",
};

function normalizeSkill(raw) {
  if (!raw || !raw.trim()) return "";
  const clean = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9#+./\- ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return SKILL_ALIASES[clean] || clean;
}

/**
 * Word-boundary aware skill match.
 * Prevents "java" → "javascript", "git" → "digital", etc.
 */
function isWordBoundaryContained(needle, haystack) {
  if (!haystack.includes(needle)) return false;
  const idx = haystack.indexOf(needle);
  const startOk = idx === 0 || !/[a-zA-Z0-9]/.test(haystack[idx - 1]);
  const end = idx + needle.length;
  const endOk = end >= haystack.length || !/[a-zA-Z0-9]/.test(haystack[end]);
  return startOk && endOk;
}

function skillMatches(required, candidateNormalized) {
  const normReq = normalizeSkill(required);
  if (!normReq) return false;
  if (candidateNormalized.has(normReq)) return true;

  for (const cand of candidateNormalized) {
    if (cand === normReq) return true;
    // Word-boundary containment (only for skills >= 4 chars)
    if (normReq.length >= 4 && cand.length >= 4) {
      if (isWordBoundaryContained(normReq, cand) || isWordBoundaryContained(cand, normReq)) {
        return true;
      }
    }
  }
  return false;
}

// ── Grade helpers ──────────────────────────────────────────────────────────────

function resolveGrade(pct) {
  if (pct >= 85) return { grade: "EXCELLENT", color: "emerald" };
  if (pct >= 70) return { grade: "GREAT", color: "indigo" };
  if (pct >= 55) return { grade: "GOOD", color: "cyan" };
  if (pct >= 35) return { grade: "FAIR", color: "amber" };
  return { grade: "LOW", color: "rose" };
}

const COLOR_MAP = {
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    bar: "bg-emerald-500",
  },
  indigo: {
    text: "text-primary dark:text-indigo-400",
    bg: "bg-primary/15",
    border: "border-primary/30",
    bar: "bg-primary",
  },
  cyan: {
    text: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    bar: "bg-cyan-500",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    bar: "bg-amber-500",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    bar: "bg-rose-500",
  },
};

function ScoreRow({ label, value }) {
  const barColor = value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted font-medium">{label}</span>
        <span className={`font-black ${value >= 70 ? "text-emerald-600 dark:text-emerald-400" : value >= 40 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CandidateJobMatchWidget({ job }) {
  const { profile: authProfile } = useAppSelector((s) => s.auth);
  const { profile: userProfile } = useAppSelector((s) => s.profile);

  const currentProfile = userProfile || authProfile;

  const matchEvaluation = useMemo(() => {
    if (!job || !currentProfile) return null;

    // 1. Normalize candidate skills to canonical set
    const rawSkills = currentProfile.skills || [];
    const candidateNormalized = new Set(
      rawSkills
        .map((s) => normalizeSkill(typeof s === "string" ? s : s.name || ""))
        .filter(Boolean)
    );

    // 2. Skill evaluation
    const requiredList = job.skillsRequired || [];
    const preferredList = job.preferredSkills || [];

    const matchedRequired = [];
    const missingRequired = [];
    const matchedPreferred = [];

    requiredList.forEach((req) => {
      if (skillMatches(req, candidateNormalized)) {
        matchedRequired.push(req);
      } else {
        missingRequired.push(req);
      }
    });

    preferredList.forEach((pref) => {
      if (skillMatches(pref, candidateNormalized)) {
        matchedPreferred.push(pref);
      }
    });

    const hasRequired = requiredList.length > 0;
    const hasPreferred = preferredList.length > 0;

    let skillScore;
    if (hasRequired && hasPreferred) {
      const reqPct = Math.round((matchedRequired.length / requiredList.length) * 100);
      const prefPct = Math.round((matchedPreferred.length / preferredList.length) * 100);
      skillScore = Math.round(reqPct * 0.85 + prefPct * 0.15);
    } else if (hasRequired) {
      skillScore = Math.round((matchedRequired.length / requiredList.length) * 100);
    } else if (hasPreferred) {
      skillScore = Math.round((matchedPreferred.length / preferredList.length) * 100 * 0.75);
    } else {
      skillScore = 35; // No skills listed — neutral baseline (same as backend)
    }

    // 3. Location score (mirrors backend evaluateLocation)
    const mode = job.workingMode;
    let locScore;
    if (mode === "REMOTE") {
      locScore = 100;
    } else {
      const profileLoc = currentProfile.location;
      if (!profileLoc) {
        locScore = mode === "HYBRID" ? 45 : 35;
      } else {
        const candLoc = profileLoc.toLowerCase().trim();
        const jobCity = (job.city || "").toLowerCase().trim();
        const jobState = (job.state || "").toLowerCase().trim();
        const jobCountry = (job.country || "").toLowerCase().trim();

        const cityMatch = jobCity && isWordBoundaryContained(jobCity, candLoc);
        const stateMatch = jobState && isWordBoundaryContained(jobState, candLoc);
        const countryMatch = jobCountry && isWordBoundaryContained(jobCountry, candLoc);

        if (cityMatch) {
          locScore = 100;
        } else if (stateMatch) {
          locScore = mode === "HYBRID" ? 65 : 45;
        } else if (countryMatch) {
          locScore = mode === "HYBRID" ? 30 : 15;
        } else {
          locScore = mode === "HYBRID" ? 15 : 0;
        }
      }
    }

    // 4. Experience baseline (client-side — no actual date computation; use level comparison)
    // We give a neutral 75 because we don't have full experience date access on the client
    const expScore = 75;

    // 5. Freshness (use postedAt if available)
    let freshScore = 50;
    if (job.postedAt || job.createdAt) {
      const posted = new Date(job.postedAt || job.createdAt);
      const daysOld = Math.floor((Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOld <= 3) freshScore = 100;
      else if (daysOld <= 7) freshScore = 90;
      else if (daysOld <= 14) freshScore = 75;
      else if (daysOld <= 30) freshScore = 50;
      else if (daysOld <= 60) freshScore = 30;
      else freshScore = 15;
    }

    // 6. Raw composite (55/25/15/5)
    let composite = Math.round(
      skillScore * 0.55 + locScore * 0.25 + expScore * 0.15 + freshScore * 0.05
    );

    // 7. Gating rules (mirror backend)
    if (hasRequired) {
      const reqPct = requiredList.length > 0
        ? Math.round((matchedRequired.length / requiredList.length) * 100)
        : 100;
      if (reqPct === 0) composite = Math.min(composite, 15);
      else if (reqPct < 30) composite = Math.min(composite, 30);
      else if (reqPct < 50) composite = Math.min(composite, 50);
    }
    if (mode === "ONSITE" && locScore === 0) composite = Math.min(composite, 25);

    // Minor boosts
    if (job.urgentHiring) composite = Math.min(100, composite + 3);
    if (job.featured) composite = Math.min(100, composite + 2);

    composite = Math.min(100, Math.max(0, composite));

    return {
      percentage: composite,
      ...resolveGrade(composite),
      matched: matchedRequired,
      missing: missingRequired,
      matchedPreferred,
      skillScore,
      locScore,
      expScore,
      freshScore,
      totalRequired: requiredList.length,
    };
  }, [job, currentProfile]);

  // ── Guest / No Profile State ─────────────────────────────────────────────────
  if (!currentProfile) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-center space-y-3 shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-heading font-satoshi">See Your Match Score</h4>
        <p className="text-xs text-muted leading-relaxed">
          Log in and update your profile to see how your skills match this role.
        </p>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 rounded-xl gradient-bg-signature px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition shadow"
        >
          <span>Update Profile</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (!matchEvaluation) return null;

  const { percentage, grade, color, matched, missing, matchedPreferred, totalRequired,
          skillScore, locScore, expScore, freshScore } = matchEvaluation;
  const c = COLOR_MAP[color];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-heading font-satoshi">
            Your Match Analysis
          </h4>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}
        >
          {grade}
        </span>
      </div>

      {/* Overall Score + Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className={`text-3xl font-black font-satoshi ${c.text}`}>
            {percentage}%
          </span>
          <span className="text-xs text-muted font-medium">
            {totalRequired > 0
              ? `${matched.length}/${totalRequired} required skills`
              : "No required skills listed"}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${c.bar}`}
          />
        </div>
      </div>

      {/* Score Breakdown (4 dimensions) */}
      <div className="space-y-2.5 pt-1 border-t border-border">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
          Score Breakdown
        </p>
        <ScoreRow label="Skills (55%)" value={skillScore} />
        <ScoreRow label="Location (25%)" value={locScore} />
        <ScoreRow label="Experience (15%)" value={expScore} />
        <ScoreRow label="Freshness (5%)" value={freshScore} />
      </div>

      {/* Matched Required Skills */}
      {matched.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-heading flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Matched Skills:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 capitalize"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Matched Preferred Skills */}
      {matchedPreferred.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-heading flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-primary" />
            Preferred Skills (Bonus):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchedPreferred.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-primary/15 border border-primary/30 px-2 py-0.5 text-[11px] font-medium text-primary capitalize"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missing.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-muted flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
            Skills to Learn:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-300 capitalize"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
        <span className="text-muted">Based on your profile · Live calculation</span>
        <Link
          to="/profile"
          className="font-bold text-primary hover:underline transition"
        >
          Edit Skills →
        </Link>
      </div>
    </motion.div>
  );
}
