/**
 * src/components/MobileBottomNavbar.jsx
 *
 * Ultra-Sleek Professional Mobile Bottom Navigation Bar.
 * Designed for modern smartphones (iOS & Android) with:
 * - 1-tap thumb navigation for high-frequency actions
 * - Dynamic role tabs (Job Seeker / Guest vs Recruiter vs Admin)
 * - Live badge counts (saved jobs, applications, unread messages)
 * - Safe Area Inset support (iPhone Home Bar / dynamic island)
 * - Smart route hiding on full-action views (Job Details Apply Bar, Messages input, Resume Editor)
 * - 100% theme-aware (Light & Dark) with frosted glass backdrop blur
 */

import React, { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  Briefcase,
  Sparkles,
  User,
  LayoutDashboard,
  Users,
  MessageSquare,
  ShieldCheck,
  Building2,
  BarChart3,
} from "lucide-react";
import { useAppSelector } from "../State/Store";
import { selectProfile } from "../State/profileSlice";
import { useTheme } from "../context/ThemeContext";

function MobileBottomNavbar() {
  const location = useLocation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const user = useAppSelector((state) => state.auth.profile);
  const savedJobs = useAppSelector((state) => state.savedJobs?.savedJobs || []);
  const myApplications = useAppSelector((state) => state.application?.myApplications || []);
  const reduxProfile = useAppSelector(selectProfile);

  // Role detection
  const role = (user?.role || user?.accountType || "").toUpperCase();
  const isRecruiter = role === "RECRUITER" || role === "EMPLOYER";
  const isAdmin = role === "ADMIN";

  // Hide condition: Do not render on pages that require full-bleed controls or have sticky bars
  const pathname = location.pathname;
  const isAuthRoute =
    pathname === "/auth" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register" ||
    pathname === "/reset-password";

  const isJobDetailRoute = pathname.startsWith("/jobs/");
  const isApplyRoute = pathname.startsWith("/apply-jobs");
  const isResumeEditorRoute = pathname.includes("resume-builder");
  const isMessagesRoute = pathname.startsWith("/messages") || pathname.startsWith("/recruiter/messages");

  if (isAuthRoute || isJobDetailRoute || isApplyRoute || isResumeEditorRoute || isMessagesRoute) {
    return null;
  }

  // Define tab items per user role
  let navItems = [];

  if (isAdmin) {
    navItems = [
      { id: "dashboard", label: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
      { id: "recruiters", label: "Recruiters", url: "/admin/recruiters", icon: ShieldCheck },
      { id: "jobs", label: "Jobs", url: "/admin/jobs", icon: Briefcase },
      { id: "users", label: "Users", url: "/admin/users", icon: Users },
      { id: "reports", label: "Reports", url: "/admin/reports", icon: BarChart3 },
    ];
  } else if (isRecruiter) {
    navItems = [
      { id: "dashboard", label: "Dashboard", url: "/recruiter/dashboard", icon: LayoutDashboard },
      { id: "jobs", label: "Jobs", url: "/recruiter/jobs", icon: Briefcase },
      { id: "applicants", label: "Candidates", url: "/recruiter/applications", icon: Users },
      { id: "messages", label: "Messages", url: "/recruiter/messages", icon: MessageSquare },
      { id: "company", label: "Company", url: "/recruiter/company", icon: Building2 },
    ];
  } else {
    // Candidate / Job Seeker / Guest
    const totalJobsBadge = (savedJobs?.length || 0) + (myApplications?.length || 0);

    navItems = [
      { id: "home", label: "Home", url: "/", icon: Home },
      { id: "find-jobs", label: "Jobs", url: "/find-jobs", icon: Search },
      {
        id: "my-jobs",
        label: "My Jobs",
        url: "/my-jobs",
        icon: Briefcase,
        badge: totalJobsBadge > 0 ? totalJobsBadge : null,
      },
      {
        id: "career-hub",
        label: "AI Hub",
        url: "/career-hub",
        icon: Sparkles,
        isAi: true,
      },
      {
        id: "profile",
        label: user ? "Profile" : "Sign In",
        url: user ? "/profile" : "/login",
        icon: User,
      },
    ];
  }

  const isTabActive = (url) => {
    if (url === "/") return pathname === "/";
    return pathname.startsWith(url);
  };

  return (
    <nav
      role="navigation"
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-auto"
      style={{
        paddingBottom: "max(8px, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        className={`mx-auto border-t backdrop-blur-2xl transition-colors duration-300 ${
          isLight
            ? "border-slate-200/90 bg-white/92 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
            : "border-white/10 bg-[#070b12]/92 shadow-[0_-4px_28px_rgba(0,0,0,0.7)]"
        }`}
      >
        <div className="grid grid-cols-5 items-center h-14 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isTabActive(item.url);

            return (
              <Link
                key={item.id}
                to={item.url}
                className="group relative flex flex-col items-center justify-center h-full w-full py-1 text-center transition-all cursor-pointer"
              >
                {/* Active Indicator Bar / Pill */}
                {active && (
                  <motion.span
                    layoutId="mobileNavIndicator"
                    className="absolute top-0 h-0.5 w-7 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="relative flex items-center justify-center">
                  {/* Icon */}
                  <div
                    className={`transition-all duration-200 ${
                      active
                        ? "scale-110 text-indigo-600 dark:text-indigo-400"
                        : isLight
                        ? "text-slate-500 group-hover:text-slate-900"
                        : "text-slate-400 group-hover:text-white"
                    } ${item.isAi && !active ? "text-indigo-500/90" : ""}`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-black text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}

                  {/* AI Sparkle Pill */}
                  {item.isAi && (
                    <span className="absolute -top-1.5 -right-2.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 px-1 py-0.2 text-[8px] font-black uppercase text-white shadow-xs">
                      AI
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`mt-0.5 text-[10px] font-satoshi transition-colors truncate max-w-[62px] ${
                    active
                      ? isLight
                        ? "font-black text-indigo-700"
                        : "font-black text-indigo-300"
                      : isLight
                      ? "font-bold text-slate-600 group-hover:text-slate-900"
                      : "font-bold text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default memo(MobileBottomNavbar);
