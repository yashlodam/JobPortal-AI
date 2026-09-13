/**
 * src/components/admin/verification/AdminActionModals.jsx
 *
 * Accessible confirmation modals for Admin verification actions:
 * - Approval Confirmation (with optional note textarea)
 * - Rejection (with mandatory reason textarea)
 * - Suspension (with mandatory reason textarea and active jobs closure warning)
 */

import React, { useState } from "react";
import { Modal } from "../../ui/Modal";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  Loader2,
  Building2,
  User,
  Sparkles,
} from "lucide-react";
import { Textarea } from "@mantine/core";

const textareaStyles = {
  label: { color: "var(--text-heading)", fontSize: 12, fontWeight: 600, marginBottom: 6 },
  input: {
    backgroundColor: "var(--bg-surface-elevated)",
    borderColor: "var(--border-border)",
    color: "var(--text-heading)",
    borderRadius: 12,
    fontSize: 13,
  },
};

// ─── 1. Approve Recruiter Modal ───────────────────────────────────────────────
export function ApproveRecruiterModal({
  isOpen,
  onClose,
  recruiter,
  onConfirm,
  loading,
}) {
  const [note, setNote] = useState("");

  if (!recruiter) return null;

  const recruiterName = recruiter.fullName || recruiter.name || recruiter.recruiterName || "Recruiter";
  const companyName = recruiter.companyName || recruiter.company || "Company";

  const handleApprove = () => {
    onConfirm(note.trim() || "Verified");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="p-6 text-center space-y-5 text-heading">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 size={28} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-heading font-satoshi">
            Approve Recruiter Account?
          </h3>
          <p className="text-xs sm:text-sm text-body leading-relaxed max-w-sm mx-auto">
            Are you sure you want to approve <strong className="text-heading">{recruiterName}</strong> representing <strong className="text-primary">{companyName}</strong>?
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-left text-xs text-emerald-700 dark:text-emerald-200/90 leading-relaxed">
          <p className="font-semibold text-emerald-600 dark:text-emerald-300 mb-0.5">Effect of Approval:</p>
          Once approved, this recruiter will immediately gain full access to post jobs, manage candidate pipelines, and connect directly with applicants.
        </div>

        <div className="text-left space-y-1.5">
          <Textarea
            label="Approval Note / Verification Remarks (Optional)"
            placeholder="e.g. Verified official company registration and representative identity."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            minRows={2}
            maxRows={4}
            autosize
            styles={textareaStyles}
          />
        </div>

        <div className="pt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setNote("");
              onClose();
            }}
            className="h-11 rounded-xl border border-border bg-surface text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleApprove}
            className="h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Approving…</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Approve Recruiter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── 2. Reject Recruiter Modal ────────────────────────────────────────────────
export function RejectRecruiterModal({
  isOpen,
  onClose,
  recruiter,
  onConfirm,
  loading,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!recruiter) return null;

  const recruiterName = recruiter.fullName || recruiter.name || recruiter.recruiterName || "Recruiter";
  const companyName = recruiter.companyName || recruiter.company || "Company";

  const handleReject = () => {
    if (!reason.trim()) {
      setError("Please provide a mandatory explanation reason for rejecting verification.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="p-6 text-center space-y-5 text-heading">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 shadow-xl shadow-rose-500/20">
          <XCircle size={28} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-heading font-satoshi">
            Reject Recruiter Verification
          </h3>
          <p className="text-xs sm:text-sm text-body leading-relaxed max-w-sm mx-auto">
            Specify the mandatory reason for rejecting <strong className="text-heading">{recruiterName}</strong> ({companyName}). This feedback will be displayed directly to the recruiter.
          </p>
        </div>

        <div className="text-left space-y-1.5">
          <Textarea
            label={<span>Rejection Reason / Feedback (Mandatory) <span className="text-rose-400">*</span></span>}
            placeholder="e.g. Please provide a valid company website and official domain email address."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            error={error}
            minRows={3}
            maxRows={5}
            autosize
            styles={textareaStyles}
            required
          />
        </div>

        <div className="pt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setReason("");
              setError("");
              onClose();
            }}
            className="h-11 rounded-xl border border-border bg-surface text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleReject}
            className="h-11 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Rejecting…</span>
              </>
            ) : (
              <>
                <XCircle size={14} />
                <span>Reject Recruiter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── 3. Suspend Recruiter Modal ───────────────────────────────────────────────
export function SuspendRecruiterModal({
  isOpen,
  onClose,
  recruiter,
  onConfirm,
  loading,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!recruiter) return null;

  const recruiterName = recruiter.fullName || recruiter.name || recruiter.recruiterName || "Recruiter";
  const companyName = recruiter.companyName || recruiter.company || "Company";

  const handleSuspend = () => {
    if (!reason.trim()) {
      setError("Please provide a mandatory reason for account suspension.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="p-6 text-center space-y-5 text-heading">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 shadow-xl shadow-rose-500/20">
          <AlertOctagon size={28} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-heading font-satoshi">
            Suspend Recruiter Account
          </h3>
          <p className="text-xs sm:text-sm text-body leading-relaxed max-w-sm mx-auto">
            Suspending <strong className="text-heading">{recruiterName}</strong> ({companyName}) will revoke active job postings and recruiter features immediately.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-left text-xs text-rose-700 dark:text-rose-200 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
          <span>
            <strong>⚠️ Warning:</strong> This will immediately close all active job postings by this recruiter.
          </span>
        </div>

        <div className="text-left space-y-1.5">
          <Textarea
            label={<span>Suspension Reason (Mandatory) <span className="text-rose-400">*</span></span>}
            placeholder="e.g. Violation of job posting terms, spam postings, or policy non-compliance."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            error={error}
            minRows={3}
            maxRows={5}
            autosize
            styles={textareaStyles}
            required
          />
        </div>

        <div className="pt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setReason("");
              setError("");
              onClose();
            }}
            className="h-11 rounded-xl border border-border bg-surface text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSuspend}
            className="h-11 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-xs font-bold text-white shadow-lg shadow-rose-700/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Suspending…</span>
              </>
            ) : (
              <>
                <AlertOctagon size={14} />
                <span>Confirm Suspension</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
