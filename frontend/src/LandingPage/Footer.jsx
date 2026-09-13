import React, { useState } from "react";
import { Sparkles, ArrowRight, Send, CheckCircle2, ShieldCheck, Mail, Heart, Code2, ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function TwitterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const FOOTER_SECTIONS = [
  {
    title: "Job Seekers",
    links: [
      { label: "Find Live Jobs", href: "/find-jobs", internal: true },
      { label: "Applied Jobs Pipeline", href: "/my-jobs/applied", internal: true },
      { label: "Saved Tech Roles", href: "/my-jobs/saved", internal: true },
      { label: "Interview Sessions", href: "/my-jobs/interviews", internal: true },
      { label: "Offer Letters & Comp", href: "/my-jobs/offers", internal: true },
    ],
  },
  {
    title: "AI Career Tools",
    links: [
      { label: "AI Resume Studio", href: "/career-hub/resume-builder", internal: true, badge: "AI" },
      { label: "AI Resume Analyzer", href: "/career-hub/resume-analyzer", internal: true, badge: "AI" },
      { label: "AI Interview Coach", href: "/career-hub/interview-coach", internal: true, badge: "AI" },
      { label: "Salary Benchmarks 2026", href: "/career-hub/salary-insights", internal: true },
      { label: "Career Intelligence Hub", href: "/career-hub", internal: true },
    ],
  },
  {
    title: "For Employers",
    links: [
      { label: "Post a Job (Free)", href: "/upload-job", internal: true },
      { label: "Manage Job Studio", href: "/recruiter/jobs", internal: true },
      { label: "Candidate Pipeline", href: "/recruiter/applications", internal: true },
      { label: "Find Tech Talent", href: "/find-talent", internal: true },
      { label: "Recruiter Portal", href: "/recruiter/dashboard", internal: true },
    ],
  },
  {
    title: "Platform & Founder",
    links: [
      { label: "About JobPortal AI", href: "/about", internal: true },
      { label: "Founder: Yash Lodam", href: "mailto:yashlodam03@gmail.com", internal: false },
      { label: "Support: yashlodam03@gmail.com", href: "mailto:yashlodam03@gmail.com", internal: false },
      { label: "GitHub Profile", href: "https://github.com/yashlodam", internal: false },
      { label: "LinkedIn Profile", href: "https://linkedin.com/in/yashlodam", internal: false },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  if (location.pathname === "/signup" || location.pathname === "/login") {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className={`relative border-t font-satoshi overflow-hidden transition-colors duration-300 ${
      isLight ? "bg-surface border-border text-body" : "bg-surface border-border text-body"
    }`} role="contentinfo">
      {/* Top Gradient Glow Accent */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="section-container py-16 sm:py-20 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-12">
          
          {/* Brand & Platform Architecture Column */}
          <div className="col-span-2 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
                <Sparkles size={20} className="text-white fill-white/20" />
              </div>
              <span className={`text-2xl font-black font-satoshi tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                JobPortal <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">AI</span>
              </span>
            </Link>

            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              Next-generation AI recruitment engine engineered by <strong className={isLight ? "text-slate-900" : "text-white"}>Yash Lodam</strong>. Connecting verified engineering talent with top tech companies through deterministic skill scoring.
            </p>

            {/* Direct Official Contact Pill */}
            <div className="pt-1">
              <a
                href="mailto:yashlodam03@gmail.com"
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-extrabold transition shadow-sm max-w-full truncate ${
                  isLight
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:text-white hover:bg-indigo-500/20"
                }`}
              >
                <Mail size={15} className={isLight ? "text-indigo-600 shrink-0" : "text-indigo-400 shrink-0"} />
                <span className="truncate">yashlodam03@gmail.com</span>
              </a>
            </div>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className={`text-xs font-extrabold uppercase tracking-wider font-satoshi mb-2.5 ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                Stay Updated on Tech Roles & AI Insights
              </p>
              {subscribed ? (
                <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-extrabold ${
                  isLight ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                }`}>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Subscribed to AI Career Updates!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col xs:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address..."
                    required
                    className={`flex-1 rounded-2xl border px-4 py-2.5 text-xs outline-none transition font-medium ${
                      isLight
                        ? "border-border bg-surface-elevated text-heading placeholder-muted focus:border-indigo-500"
                        : "border-border bg-surface-elevated text-heading placeholder-muted focus:border-indigo-500"
                    }`}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-2.5 text-xs font-black !text-white shadow-lg hover:scale-105 transition cursor-pointer shrink-0"
                  >
                    <Send size={13} className="!text-white" />
                    <span className="!text-white">Join</span>
                  </button>
                </form>
              )}
            </div>

            {/* Social & Founder Links */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://github.com/yashlodam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yash Lodam GitHub"
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-slate-100 hover:text-slate-900"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-indigo-500/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <GitHubIcon />
              </a>
              <a
                href="https://linkedin.com/in/yashlodam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yash Lodam LinkedIn"
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-slate-100 hover:text-slate-900"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-indigo-500/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <LinkedInIcon />
              </a>
              <a
                href="mailto:yashlodam03@gmail.com"
                aria-label="Email Yash Lodam"
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-slate-100 hover:text-slate-900"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-indigo-500/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* 4 Categorized Link Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className={`text-xs font-black uppercase tracking-widest font-satoshi ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => {
                  const LinkComponent = link.internal ? Link : "a";
                  const linkProps = link.internal
                    ? { to: link.href }
                    : { href: link.href, target: link.href.startsWith("mailto:") ? "_self" : "_blank", rel: "noopener noreferrer" };

                  return (
                    <li key={link.label}>
                      <LinkComponent
                        {...linkProps}
                        className={`group inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                          isLight ? "text-slate-600 hover:text-indigo-600" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <ArrowRight
                          size={12}
                          className="mr-0.5 -translate-x-1.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-indigo-500 shrink-0"
                        />
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className={`rounded-md border px-1.5 py-0.2 text-[9px] font-black ${
                            isLight ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                          }`}>
                            {link.badge}
                          </span>
                        )}
                      </LinkComponent>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright & Live Status Row */}
        <div className={`mt-14 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 font-satoshi ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}>
          <p className={`text-xs font-medium flex flex-wrap items-center gap-1 ${
            isLight ? "text-slate-600" : "text-slate-400"
          }`}>
            <span>© {new Date().getFullYear()} JobPortal AI Platform.</span>
            <span>Founded & Architected by</span>
            <strong className={isLight ? "text-slate-900 font-bold" : "text-white font-bold"}>Yash Lodam</strong>
            <span>(</span>
            <a href="mailto:yashlodam03@gmail.com" className="text-indigo-600 font-bold hover:underline">
              yashlodam03@gmail.com
            </a>
            <span>)</span>
          </p>

          <div className={`flex items-center gap-2 rounded-full border px-3.5 py-1 shadow-sm ${
            isLight ? "border-emerald-200 bg-emerald-50" : "border-emerald-500/30 bg-emerald-500/10"
          }`}>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-[11px] font-bold font-satoshi ${isLight ? "text-emerald-700" : "text-emerald-300"}`}>
              All REST APIs & AI Match Engines 100% Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
