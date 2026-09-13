/**
 * src/components/admin/verification/AdminRecruiterTable.jsx
 *
 * Professional Recruiter Verification Table for Admin portal.
 * Columns: Recruiter Name & Email, Company & Website Link, Designation, Status Badge, Submitted At, Actions.
 */

import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Pagination,
} from "../../ui/Table";
import { StatusChip } from "../../ui/Badge";
import {
  Eye,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Building2,
  Mail,
  Calendar,
  Search,
  ExternalLink,
} from "lucide-react";

export default function AdminRecruiterTable({
  recruiters = [],
  loading,
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
  onViewDetails,
  onApprove,
  onReject,
  onSuspend,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-muted font-satoshi">
          Loading recruiter verifications…
        </p>
      </div>
    );
  }

  if (!recruiters || recruiters.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-2 shadow-sm">
        <Building2 size={36} className="text-muted mx-auto opacity-60" />
        <h4 className="text-sm font-bold text-heading font-satoshi">No Recruiters Found</h4>
        <p className="text-xs text-muted max-w-sm mx-auto">
          No recruiter verification records match the current filter or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop & Tablet Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Recruiter Name & Email</TableHead>
            <TableHead>Company & Website</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Status Badge</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {recruiters.map((recruiter) => {
            const recruiterName = recruiter.recruiterName || recruiter.fullName || recruiter.name || "Recruiter";
            const recruiterEmail = recruiter.recruiterEmail || recruiter.workEmail || recruiter.email || "—";
            const companyName = recruiter.companyName || recruiter.company || "Company";
            const status = (recruiter.status || recruiter.verificationStatus || "PENDING_VERIFICATION").toUpperCase();
            const isApproved = status === "APPROVED" || status === "VERIFIED";
            const isRejected = status === "REJECTED" || status === "VERIFICATION_REJECTED";
            const isSuspended = status === "SUSPENDED";

            const submittedDate = recruiter.submittedAt || recruiter.createdAt
              ? new Date(recruiter.submittedAt || recruiter.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recently";

            return (
              <TableRow key={recruiter.id || recruiter.userId || recruiter.recruiterId || Math.random()}>
                {/* Recruiter Name & Email */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold text-xs">
                      {recruiterName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-heading font-satoshi text-xs">{recruiterName}</p>
                      <p className="text-[11px] text-muted font-mono">{recruiterEmail}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Company & Website Link */}
                <TableCell>
                  <div>
                    <p className="font-semibold text-heading text-xs">{companyName}</p>
                    {recruiter.companyWebsite && (
                      <a
                        href={recruiter.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <span className="truncate max-w-[140px]">{recruiter.companyWebsite}</span>
                        <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                </TableCell>

                {/* Designation */}
                <TableCell>
                  <span className="text-body text-xs font-medium">
                    {recruiter.designation || "Recruiter"}
                  </span>
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <StatusChip status={status} />
                </TableCell>

                {/* Submitted At */}
                <TableCell>
                  <span className="text-muted text-xs">{submittedDate}</span>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewDetails(recruiter)}
                      title="Inspect Verification Details"
                      className="flex h-8 items-center gap-1 rounded-xl border border-border bg-surface px-2.5 text-[11px] font-semibold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Details</span>
                    </button>

                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => onApprove(recruiter)}
                        title="Approve Recruiter"
                        className="flex h-8 items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-2.5 text-[11px] font-bold text-white shadow-sm transition cursor-pointer"
                      >
                        <CheckCircle2 size={13} />
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        type="button"
                        onClick={() => onReject(recruiter)}
                        title="Reject Verification"
                        className="flex h-8 items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 px-2.5 text-[11px] font-bold transition cursor-pointer"
                      >
                        <XCircle size={13} />
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    )}

                    {!isSuspended && isApproved && (
                      <button
                        type="button"
                        onClick={() => onSuspend(recruiter)}
                        title="Suspend Account"
                        className="flex h-8 items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 px-2 text-[11px] font-semibold transition cursor-pointer"
                      >
                        <AlertOctagon size={13} />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={onPageChange}
      />
    </div>
  );
}
