/**
 * src/components/admin/verification/AdminRecruiterDetailDrawer.jsx
 *
 * Detailed slide-over inspection drawer for Admin review.
 */

import React from "react";
import { Drawer } from "../../ui/Modal";
import { StatusChip } from "../../ui/Badge";
import {
  Building2,
  Globe,
  Mail,
  User,
  MapPin,
  Briefcase,
  Link2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ExternalLink,
  Clock,
} from "lucide-react";

export default function AdminRecruiterDetailDrawer({
  isOpen,
  onClose,
  recruiter,
  onOpenApprove,
  onOpenReject,
  onOpenSuspend,
}) {
  if (!recruiter) return null;

  const recruiterName = recruiter.fullName || recruiter.name || "Recruiter";
  const companyName = recruiter.companyName || recruiter.company || "Company";
  const status = (recruiter.verificationStatus || recruiter.status || "PENDING_VERIFICATION").toUpperCase();
  const isApproved = status === "APPROVED" || status === "VERIFIED";
  const isRejected = status === "REJECTED" || status === "VERIFICATION_REJECTED";
  const isSuspended = status === "SUSPENDED";

  const submittedDate = recruiter.submittedAt || recruiter.createdAt
    ? new Date(recruiter.submittedAt || recruiter.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Recruiter Verification Profile" position="right">
      <div className="space-y-6 pb-6 text-heading font-inter">
        {/* Header Profile Summary */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-surface-elevated border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-extrabold text-lg shadow-lg">
              {recruiterName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-heading font-satoshi">{recruiterName}</h3>
              <p className="text-xs text-primary font-medium">{recruiter.designation || "Recruiter Representative"}</p>
              <p className="text-[11px] text-muted mt-0.5">{recruiter.workEmail || recruiter.email}</p>
            </div>
          </div>

          <StatusChip status={status} />
        </div>

        {/* Action Toolbar */}
        <div className="p-3.5 rounded-2xl border border-border bg-surface space-y-2">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
            Admin Verification Actions
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {!isApproved && (
              <button
                type="button"
                onClick={() => onOpenApprove(recruiter)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
              >
                <CheckCircle2 size={14} /> Approve Recruiter
              </button>
            )}

            {!isRejected && (
              <button
                type="button"
                onClick={() => onOpenReject(recruiter)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
              >
                <XCircle size={14} /> Reject Verification
              </button>
            )}

            {!isSuspended && isApproved && (
              <button
                type="button"
                onClick={() => onOpenSuspend(recruiter)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
              >
                <AlertOctagon size={14} /> Suspend Account
              </button>
            )}
          </div>
        </div>

        {/* Company Information */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <Building2 className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider font-satoshi">
              Company & Corporate Details
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted">Company Name:</span>
              <span className="font-bold text-heading font-satoshi text-sm">{companyName}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted">Official Website:</span>
              <span className="font-medium text-primary">
                {recruiter.companyWebsite ? (
                  <a
                    href={recruiter.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1"
                  >
                    <span>{recruiter.companyWebsite}</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  "Not Provided"
                )}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted">Headquarters / Location:</span>
              <span className="font-medium text-heading">{recruiter.companyLocation || recruiter.location || "Not Provided"}</span>
            </div>

            {recruiter.linkedinProfile && (
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted">LinkedIn Profile:</span>
                <a
                  href={recruiter.linkedinProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>View LinkedIn</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {recruiter.companyDescription && (
              <div className="pt-2">
                <span className="text-muted block mb-1">Company Description:</span>
                <div className="p-3 rounded-xl bg-surface-elevated border border-border text-body leading-relaxed text-[11px]">
                  {recruiter.companyDescription}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification & Review Metadata */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <Clock className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-heading uppercase tracking-wider font-satoshi">
              Audit & Metadata
            </h4>
          </div>

          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted">Recruiter ID:</span>
            <span className="font-mono text-primary font-bold">#{recruiter.id || recruiter.userId || "REC-01"}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted">Submitted On:</span>
            <span className="text-heading font-medium">{submittedDate}</span>
          </div>

          {recruiter.rejectionReason && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 space-y-0.5">
              <span className="font-bold block">Previous Rejection Reason:</span>
              <p className="text-[11px] text-rose-600 dark:text-rose-200">{recruiter.rejectionReason}</p>
            </div>
          )}

          {recruiter.suspensionReason && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 space-y-0.5">
              <span className="font-bold block">Suspension Reason:</span>
              <p className="text-[11px] text-rose-600 dark:text-rose-200">{recruiter.suspensionReason}</p>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
