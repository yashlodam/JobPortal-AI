/**
 * src/Pages/SettingsPage.jsx
 *
 * Clean Candidate Settings Center.
 * Includes:
 * 1. Profile & Bio (Name, Email, Title, Phone, Location, Recruiter Visibility)
 * 2. Password & Security (Password update, 2FA toggle)
 * 3. Data & Privacy (Export Data, Delete Account)
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Sparkles,
  Lock,
  CheckCircle2,
  Save,
  Key,
} from "lucide-react";
import { useAppSelector } from "../State/Store";
import { useToast } from "../components/ui/ToastNotification";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.profile);

  // Tab State: 'profile' | 'security' | 'privacy'
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [title, setTitle] = useState(user?.title || user?.headline || "");
  const [location, setLocation] = useState(user?.location || "");
  const [visibility, setVisibility] = useState("public"); // 'public' | 'stealth'

  // Sync state when profile is loaded from Redux
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setTitle(user.title || user.headline || "");
      setLocation(user.location || "");
    }
  }, [user]);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toast = useToast();

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    toast.success("Account settings updated successfully!");
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const exportPayload = {
      user: user || {},
      exportedAt: new Date().toISOString(),
      accountType: "CANDIDATE",
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobportal-candidate-data-${user?.name?.replace(/\s+/g, "_") || "profile"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Candidate data exported successfully.");
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 font-inter text-body">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1 text-xs font-black text-indigo-500 dark:text-indigo-300 font-satoshi shadow-sm">
            <Sparkles size={14} className="text-amber-500 dark:text-amber-300 fill-amber-300/20" /> Candidate Settings
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-heading font-satoshi tracking-tight mt-1.5">
            Account <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1 font-medium max-w-xl">
            Manage your candidate profile details, visibility settings, password security, and data privacy options.
          </p>
        </div>

        {/* Success Banner */}
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-300"
          >
            <CheckCircle2 size={16} className="text-emerald-500" />
            Your settings have been saved successfully!
          </motion.div>
        )}

        {/* Main 2-Column Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Tabs (Left Sidebar) */}
          <div className="lg:col-span-3 space-y-1.5 bg-surface border border-border p-3 rounded-3xl backdrop-blur-xl shadow-xl font-satoshi">
            {[
              { id: "profile", label: "Profile & Bio", icon: User },
              { id: "security", label: "Password & Security", icon: Lock },
              { id: "privacy", label: "Data & Privacy", icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md font-extrabold"
                      : "text-muted hover:bg-surface-hover hover:text-heading"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-white" : "text-indigo-500 dark:text-indigo-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content Area (Right Main Column) */}
          <div className="lg:col-span-9 rounded-3xl border border-border bg-surface p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            
            {/* ── TAB 1: Profile & Bio ── */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <h3 className="text-lg font-black text-heading font-satoshi border-b border-border pb-3">
                  Personal & Professional Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block font-bold text-heading mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-2xl border border-border bg-surface-hover px-4 py-3 text-heading placeholder:text-muted outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-heading mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-border bg-surface-hover px-4 py-3 text-heading placeholder:text-muted outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-heading mb-1.5">Professional Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full rounded-2xl border border-border bg-surface-hover px-4 py-3 text-heading placeholder:text-muted outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-heading mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 555-0199"
                      className="w-full rounded-2xl border border-border bg-surface-hover px-4 py-3 text-heading placeholder:text-muted outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-heading mb-1.5">Preferred Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA (Open to Remote)"
                      className="w-full rounded-2xl border border-border bg-surface-hover px-4 py-3 text-heading placeholder:text-muted outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* Profile Visibility */}
                <div className="pt-4 border-t border-border space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-satoshi">
                    Recruiter Visibility Mode
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <button
                      type="button"
                      onClick={() => setVisibility("public")}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        visibility === "public"
                          ? "border-indigo-500 bg-indigo-500/10 text-heading shadow-sm"
                          : "border-border bg-surface-hover text-muted hover:text-heading"
                      }`}
                    >
                      <h5 className="font-extrabold text-sm font-satoshi text-heading">🟢 Public Candidate</h5>
                      <p className="mt-1 text-[11px] leading-relaxed font-medium text-muted">Visible to verified executive recruiters & hiring managers.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility("stealth")}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        visibility === "stealth"
                          ? "border-indigo-500 bg-indigo-500/10 text-heading shadow-sm"
                          : "border-border bg-surface-hover text-muted hover:text-heading"
                      }`}
                    >
                      <h5 className="font-extrabold text-sm font-satoshi text-heading">🕵️ Stealth Mode</h5>
                      <p className="mt-1 text-[11px] leading-relaxed font-medium text-muted">Only visible to companies you explicitly apply to.</p>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:scale-105 transition cursor-pointer font-satoshi"
                >
                  <Save size={15} /> Save Profile Changes
                </button>
              </form>
            )}

            {/* ── TAB 2: Password & Security ── */}
            {activeTab === "security" && (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <h3 className="text-lg font-black text-heading font-satoshi border-b border-border pb-3">
                  Password & Security Credentials
                </h3>

                <div className="space-y-4 max-w-md text-xs">
                  <div>
                    <label className="block font-bold text-heading mb-1.5">Current Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-2xl border border-border bg-surface-hover px-4 py-3 text-heading placeholder:text-muted outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-heading mb-1.5">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-2xl border border-border bg-surface-hover px-4 py-3 text-heading placeholder:text-muted outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-heading mb-1.5">Confirm New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-2xl border border-border bg-surface-hover px-4 py-3 text-heading placeholder:text-muted outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                {/* 2FA Toggle */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-heading font-satoshi">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-muted mt-0.5 font-medium">Secure your candidate account with an extra verification code on login.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer ${
                      twoFactor ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300" : "bg-surface-hover border border-border text-muted"
                    }`}
                  >
                    {twoFactor ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:scale-105 transition cursor-pointer font-satoshi"
                >
                  <Key size={15} /> Update Password & Security
                </button>
              </form>
            )}

            {/* ── TAB 3: Data & Privacy ── */}
            {activeTab === "privacy" && (
              <div className="space-y-6 text-xs">
                <h3 className="text-lg font-black text-heading font-satoshi border-b border-border pb-3">
                  Data Portability & Account Management
                </h3>

                <div className="p-4 rounded-2xl bg-surface-hover border border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-heading font-satoshi">Export My Candidate Data</h4>
                    <p className="text-[11px] text-muted mt-0.5 font-medium">Download a JSON archive of your applications, saved jobs, and profile history.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-2xl bg-surface border border-border text-xs font-bold text-heading hover:bg-surface-hover transition cursor-pointer shadow-sm"
                  >
                    Export Data
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-rose-600 dark:text-rose-300 font-satoshi">Delete Account & Erase Profile</h4>
                    <p className="text-[11px] text-rose-600/80 dark:text-rose-300/70 mt-0.5 font-medium">Permanently delete your profile, resume files, and message history.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-2xl bg-rose-600 text-xs font-extrabold text-white shadow hover:bg-rose-500 transition cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          toast.info("Account deletion request submitted. An administrative verification email has been dispatched.");
        }}
        title="Delete Candidate Account"
        description="Are you sure you want to permanently delete your account and all associated resumes, applications, and messages? This action cannot be reversed."
        confirmLabel="Erase My Account"
        variant="danger"
      />
    </div>
  );
}
