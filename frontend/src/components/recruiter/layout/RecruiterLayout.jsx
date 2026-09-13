/**
 * src/components/recruiter/layout/RecruiterLayout.jsx
 *
 * Master layout wrapper for all Recruiter pages:
 * - Automatically fetches verification status on layout mount: GET /api/recruiter/verification-status
 * - Handles the 4 lifecycle states with top banners:
 *   1. PENDING_VERIFICATION: Warning banner for restricted actions
 *   2. APPROVED: No banner, full access
 *   3. REJECTED: Error banner with rejection reason + "Update & Resubmit Verification" button opening <ResubmitModal />
 *   4. SUSPENDED: Critical alert banner
 */

import React, { useState, useEffect } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterNavbar from "./RecruiterNavbar";
import ResubmitModal from "../verification/ResubmitModal";
import { Breadcrumb } from "../../ui/Breadcrumb";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import { fetchVerificationStatus } from "../../../State/verificationSlice";
import {
  Clock,
  AlertTriangle,
  AlertOctagon,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export default function RecruiterLayout({ title, subtitle, breadcrumbs = [], action, noPadding = false, children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.profile);
  const { recruiterVerification } = useAppSelector((state) => state.verification);

  useEffect(() => {
    dispatch(fetchVerificationStatus());
  }, [dispatch]);

  const verificationData = recruiterVerification?.data || recruiterVerification || {};
  const status = (
    verificationData?.status ||
    user?.verificationStatus ||
    user?.status ||
    "PENDING_VERIFICATION"
  ).toUpperCase();

  const isPending = status === "PENDING_VERIFICATION" || status === "PENDING" || status === "UNDER_REVIEW";
  const isApproved = status === "APPROVED" || status === "VERIFIED";
  const isRejected = status === "REJECTED" || status === "VERIFICATION_REJECTED";
  const isSuspended = status === "SUSPENDED";

  const rejectionReason =
    verificationData?.rejectionReason ||
    user?.rejectionReason ||
    "Company information could not be verified.";

  return (
    <div className={`bg-background font-inter text-body flex ${noPadding ? "h-[100dvh] max-h-[100dvh] overflow-hidden" : "min-h-screen"}`}>
      {/* Sidebar */}
      <RecruiterSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"} ${noPadding ? "h-full overflow-hidden" : ""}`}>
        {/* Navbar */}
        <RecruiterNavbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Content Area */}
        <main className={`flex-1 min-h-0 w-full mx-auto ${noPadding ? "p-0 max-w-full flex flex-col overflow-hidden" : "p-4 sm:p-6 lg:p-8 max-w-7xl space-y-6"}`}>
          {/* ── LIFECYCLE RESTRICTION BANNERS ── */}
          {isPending && (
            <div className={`border border-amber-500/30 bg-amber-500/10 text-xs text-amber-600 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5 backdrop-blur-xl ${noPadding ? "m-3 rounded-xl p-3" : "rounded-2xl p-4"}`}>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />
                <span>
                  <strong>Pending Verification:</strong> Your recruiter account is pending administrator verification. Job posting, talent search, and initiating new candidate chats are temporarily restricted.
                </span>
              </div>
            </div>
          )}

          {isRejected && (
            <div className={`border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-rose-500/5 backdrop-blur-xl ${noPadding ? "m-3 rounded-xl p-3" : "rounded-2xl p-4"}`}>
              <div className="flex items-start sm:items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <strong>Verification Not Approved:</strong> {rejectionReason}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setResubmitOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition cursor-pointer shrink-0"
              >
                <RotateCcw size={13} />
                <span>Update & Resubmit Verification</span>
              </button>
            </div>
          )}

          {isSuspended && (
            <div className={`border border-rose-600/40 bg-rose-500/10 dark:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-200 flex items-center gap-3 shadow-xl shadow-rose-600/10 backdrop-blur-xl ${noPadding ? "m-3 rounded-xl p-3" : "rounded-2xl p-4"}`}>
              <AlertOctagon className="h-5 w-5 text-rose-500 shrink-0" />
              <span>
                <strong>Account Suspended:</strong> Your recruiter account has been suspended. Recruiter functionality is currently unavailable. Please contact platform support.
              </span>
            </div>
          )}

          {/* Breadcrumb */}
          {!noPadding && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

          {/* Page Header */}
          {!noPadding && (title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
              <div>
                {title && <h1 className="text-2xl sm:text-3xl font-black text-heading font-satoshi tracking-tight">{title}</h1>}
                {subtitle && <p className="text-xs sm:text-sm text-muted mt-1">{subtitle}</p>}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
          )}

          {/* Main Body */}
          {children}
        </main>
      </div>

      {/* Resubmission Modal */}
      <ResubmitModal
        isOpen={resubmitOpen}
        onClose={() => setResubmitOpen(false)}
        initialData={verificationData}
      />
    </div>
  );
}
