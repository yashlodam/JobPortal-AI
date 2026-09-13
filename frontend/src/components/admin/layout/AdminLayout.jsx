/**
 * src/components/admin/layout/AdminLayout.jsx
 *
 * Master layout wrapper for Admin Studio and Verification Management.
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Briefcase,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import { logout } from "../../../State/AuthSlic";
import ProfileMenu from "../../../Header/ProfileMenu";
import { Breadcrumb } from "../../ui/Breadcrumb";
import { useTheme } from "../../../context/ThemeContext";

const ADMIN_SIDEBAR_LINKS = [
  { name: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Recruiter Verifications", url: "/admin/recruiters", icon: ShieldCheck, badge: "Review" },
  { name: "Users", url: "/admin/users", icon: Users },
  { name: "Companies", url: "/admin/companies", icon: Building2 },
  { name: "Job Postings", url: "/admin/jobs", icon: Briefcase },
  { name: "System Analytics", url: "/admin/reports", icon: BarChart3 },
];

export default function AdminLayout({ title, subtitle, breadcrumbs = [], action, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.profile);
  const { theme } = useTheme();
  const isLight = theme === "light";

  const isLinkActive = (path) => {
    if (path === "/admin/dashboard") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        {/* Logo & Brand */}
        <div className="flex items-center justify-between pb-6 border-b border-border px-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 shadow-lg shadow-purple-500/30">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black font-satoshi tracking-tight text-heading">
                  JobPortal <span className="text-purple-600 dark:text-purple-400">Admin</span>
                </span>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                  Control Console
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:bg-surface-hover hover:text-heading transition cursor-pointer"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-xl bg-surface text-muted hover:bg-surface-hover hover:text-heading transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1">
          {ADMIN_SIDEBAR_LINKS.map((item) => {
            const active = isLinkActive(item.url);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold"
                    : "text-muted hover:bg-surface hover:text-heading"
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${
                  active
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-muted group-hover:text-heading"
                }`} />
                {!collapsed && <span className="truncate">{item.name}</span>}

                {!collapsed && item.badge && (
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-extrabold border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                    {item.badge}
                  </span>
                )}

                {active && (
                  <motion.div
                    layoutId="adminSidebarActiveIndicator"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-purple-600 dark:bg-purple-500"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Identity & Logout */}
      <div className="space-y-2 pt-2 border-t border-border">
        {!collapsed && (
          <div className="rounded-2xl border border-border bg-surface p-3 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold font-satoshi text-heading">
                  {user?.name || "System Admin"}
                </p>
                <p className="truncate text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/15 transition cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-inter text-body flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-background/95 backdrop-blur-2xl transition-all duration-300 z-40 fixed top-0 left-0 h-screen ${collapsed ? "w-20" : "w-64"}`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-72 h-full border-r border-border bg-surface z-10"
            >
              {SidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        {/* Admin Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-2xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:bg-surface-hover hover:text-heading transition cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-300">
              <ShieldAlert className="h-3.5 w-3.5" /> Platform Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-muted hover:text-heading transition"
            >
              View Main Platform →
            </Link>
            {user && <ProfileMenu user={user} />}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
              <div>
                {title && <h1 className="text-2xl sm:text-3xl font-black text-heading font-satoshi tracking-tight">{title}</h1>}
                {subtitle && <p className="text-xs sm:text-sm text-muted mt-1">{subtitle}</p>}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
