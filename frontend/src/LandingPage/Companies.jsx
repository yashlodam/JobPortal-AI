import React from "react";
import MarqueeModule from "react-fast-marquee";
import { Link } from "react-router-dom";
import {
  Code2,
  Cpu,
  Cloud,
  Database,
  Terminal,
  Layers,
  Smartphone,
  ShieldCheck,
  Workflow,
  Sparkles,
  Server,
  Palette,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Marquee = MarqueeModule.default ?? MarqueeModule;

const TECH_DOMAINS = [
  {
    name: "Fullstack Engineering",
    query: "Fullstack",
    icon: Layers,
    color: "#6366F1",
    subtext: "React, Node, TypeScript",
  },
  {
    name: "AI & Machine Learning",
    query: "AI",
    icon: Cpu,
    color: "#8B5CF6",
    subtext: "LLMs, PyTorch, Python",
  },
  {
    name: "Java & Spring Boot",
    query: "Java",
    icon: Server,
    color: "#EC4899",
    subtext: "Microservices, Postgres",
  },
  {
    name: "Cloud & DevOps",
    query: "DevOps",
    icon: Cloud,
    color: "#06B6D4",
    subtext: "AWS, Kubernetes, CI/CD",
  },
  {
    name: "Data Engineering",
    query: "Data",
    icon: Database,
    color: "#10B981",
    subtext: "Kafka, Spark, SQL",
  },
  {
    name: "Frontend Architecture",
    query: "React",
    icon: Code2,
    color: "#3B82F6",
    subtext: "Next.js, Tailwind, Web",
  },
  {
    name: "Product UI/UX",
    query: "UI/UX",
    icon: Palette,
    color: "#F59E0B",
    subtext: "Design Systems, Figma",
  },
  {
    name: "Cybersecurity",
    query: "Security",
    icon: ShieldCheck,
    color: "#14B8A6",
    subtext: "AppSec, Network, IAM",
  },
  {
    name: "Mobile Development",
    query: "Mobile",
    icon: Smartphone,
    color: "#F43F5E",
    subtext: "React Native, iOS, Android",
  },
  {
    name: "Backend Architecture",
    query: "Backend",
    icon: Terminal,
    color: "#818CF8",
    subtext: "Distributed Systems, APIs",
  },
];

export default function Companies() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <section
      className={`relative overflow-hidden py-10 sm:py-14 border-y font-inter transition-colors duration-300 bg-transparent ${
        isLight ? "border-slate-200/80 text-slate-800" : "border-white/10 text-slate-200"
      }`}
      aria-label="Featured Hiring Domains"
    >
      {/* Section Header */}
      <div className="section-container relative z-10 text-center mb-6 sm:mb-8">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 shadow-xs backdrop-blur-md ${
            isLight
              ? "border-indigo-200 bg-indigo-50/90 text-indigo-800"
              : "border-indigo-500/30 bg-indigo-500/15 text-indigo-300"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest font-satoshi">
            Specialized Tech Domains
          </span>
        </div>
        <h3
          className={`mt-2.5 text-2xl sm:text-3xl font-black font-satoshi tracking-tight ${
            isLight ? "text-slate-900" : "text-white"
          }`}
        >
          Explore Roles Across High-Impact Tech Disciplines
        </h3>
      </div>

      {/* Marquee Cards */}
      <div className="relative z-10 py-2 sm:py-3">
        <Marquee speed={28} gradient={false} pauseOnHover autoFill>
          {TECH_DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <Link
                key={domain.name}
                to={`/find-jobs?keyword=${encodeURIComponent(domain.query)}`}
                className={`mx-2 sm:mx-3 group relative flex h-14 sm:h-16 w-56 sm:w-64 items-center justify-between rounded-2xl border px-3.5 sm:px-4 py-2.5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer shrink-0 ${
                  isLight
                    ? "border-slate-200/90 bg-white/85 shadow-xs hover:border-indigo-300 hover:shadow-md"
                    : "border-white/10 bg-surface/80 hover:border-indigo-500/40 hover:bg-surface-elevated"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${domain.color}15`,
                      color: domain.color,
                      border: `1px solid ${domain.color}30`,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-bold font-satoshi truncate ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {domain.name}
                    </p>
                    <p className="text-[10px] text-muted truncate">{domain.subtext}</p>
                  </div>
                </div>

                <div
                  className="flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${domain.color}10`,
                    borderColor: `${domain.color}25`,
                    color: domain.color,
                  }}
                >
                  <span>Explore</span>
                </div>
              </Link>
            );
          })}
        </Marquee>
      </div>
    </section>
  );
}