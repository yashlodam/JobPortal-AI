/**
 * src/components/recruiter/verification/PendingRecruiterDashboard.jsx
 *
 * Useful limited dashboard for recruiters awaiting verification or review.
 * Displays verification status, progress roadmap, submitted company information,
 * profile completion, and next steps.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  Building2,
  User,
  Globe,
  Mail,
  MapPin,
  FileText,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Edit3,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import VerificationStatusCard from "./VerificationStatusCard";
import VerificationForm from "./VerificationForm";
import { Modal } from "../../ui/Modal";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/Card";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import { fetchVerificationStatus } from "../../../State/verificationSlice";

export default function PendingRecruiterDashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.profile);
  const { recruiterVerification, verificationLoading } = useAppSelector(
    (state) => state.verification
  );

  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchVerificationStatus());
  }, [dispatch]);

  // Merge verification data from endpoint or fallback from user profile
  const verificationData = recruiterVerification?.data || recruiterVerification || {};
  const currentStatus =
    verificationData?.status ||
    user?.verificationStatus ||
    user?.status ||
    "PENDING_VERIFICATION";

  const submittedAt =
    verificationData?.submittedAt ||
    verificationData?.createdAt ||
    (user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently");

  const isApproved = currentStatus === "APPROVED" || currentStatus === "VERIFIED";
  const isRejected = currentStatus === "REJECTED" || currentStatus === "VERIFICATION_REJECTED";
  const isSuspended = currentStatus === "SUSPENDED";

  // companyName now comes from the API (populated from the companies table after submitVerification)
  const hasSubmittedCompany = Boolean(verificationData?.companyName);

  // Stepper Calculation
  const steps = [
    {
      id: 1,
      title: "Email Verified",
      desc: "Your login credentials and email address have been confirmed.",
      completed: true,
      current: false,
    },
    {
      id: 2,
      title: "Company Information Submitted",
      desc: hasSubmittedCompany
        ? "Corporate details and verification metadata recorded."
        : "Action needed: submit your company verification profile.",
      completed: hasSubmittedCompany,
      current: !hasSubmittedCompany,
    },
    {
      id: 3,
      title: "Admin Review",
      desc: isApproved
        ? "Review complete — organization credentials approved."
        : isRejected
        ? "Review concluded — updates required."
        : "Compliance and background verification in progress.",
      completed: isApproved,
      current: hasSubmittedCompany && !isApproved && !isRejected && !isSuspended,
    },
    {
      id: 4,
      title: "Full Recruiter Studio Unlocked",
      desc: isApproved
        ? "Active: You can post jobs, source candidates, and manage interviews."
        : "Awaiting approval from platform administrators.",
      completed: isApproved,
      current: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-inter text-body">
      {/* 1. Status Overview Banner */}
      <VerificationStatusCard
        status={currentStatus}
        submittedAt={submittedAt}
        rejectionReason={verificationData?.rejectionReason || user?.rejectionReason}
        suspensionReason={verificationData?.suspensionReason || user?.suspensionReason}
        onResubmit={() => setEditModalOpen(true)}
      />

      {/* 2. Verification Progress Roadmap */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-heading font-satoshi flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What Happens Next? (Verification Pipeline)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              To protect candidates and maintain platform integrity, all hiring accounts undergo verification.
            </p>
          </div>

          {!hasSubmittedCompany && (
            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl gradient-bg-signature px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-105 transition cursor-pointer shrink-0"
            >
              <PlusCircle size={14} /> Submit Company Info
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`rounded-2xl border p-4 transition-all duration-300 relative ${
                step.completed
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : step.current
                  ? "border-amber-500/40 bg-amber-500/10 ring-2 ring-amber-500/20"
                  : "border-border bg-surface-elevated"
              }`}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                    step.completed
                      ? "bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30"
                      : step.current
                      ? "bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30 animate-pulse"
                      : "bg-surface text-muted border border-border"
                  }`}
                >
                  {step.completed ? <CheckCircle2 size={16} /> : step.id}
                </div>
                <span
                  className={`text-xs font-bold font-satoshi truncate ${
                    step.completed
                      ? "text-emerald-600 dark:text-emerald-400"
                      : step.current
                      ? "text-amber-600 dark:text-amber-300"
                      : "text-muted"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              <p className="text-[11px] text-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Company Metadata & Verification Submission Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Submitted Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="text-base font-bold text-heading font-satoshi">Submitted Company Information</h4>
                  <p className="text-xs text-muted">Information submitted for compliance and admin review.</p>
                </div>
              </div>

              <button
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
              >
                <Edit3 size={13} />
                <span>{hasSubmittedCompany ? "Edit Details" : "Add Details"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1">
                <span className="text-muted block">Company Name:</span>
                <p className="font-bold text-heading text-sm font-satoshi">
                  {verificationData?.companyName || user?.companyName || "Not Submitted"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1">
                <span className="text-muted block">Official Website:</span>
                <p className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                  {verificationData?.companyWebsite ? (
                    <a
                      href={verificationData.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline inline-flex items-center gap-1"
                    >
                      <span>{verificationData.companyWebsite}</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    "Not Submitted"
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1">
                <span className="text-muted block">Recruiter Representative:</span>
                <p className="font-semibold text-heading">
                  {verificationData?.fullName || user?.name || "Representative"}
                  {verificationData?.designation ? ` (${verificationData.designation})` : ""}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1">
                <span className="text-muted block">Work Email:</span>
                <p className="font-semibold text-heading">
                  {verificationData?.workEmail || user?.email || "Not Submitted"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1 sm:col-span-2">
                <span className="text-muted block">Headquarters / Location:</span>
                <p className="font-semibold text-heading">
                  {verificationData?.companyLocation || "Not Provided"}
                </p>
              </div>

              {verificationData?.companyDescription && (
                <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-1 sm:col-span-2">
                  <span className="text-muted block">Company Overview:</span>
                  <p className="text-body leading-relaxed text-[11px]">
                    {verificationData.companyDescription}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: FAQ & Support */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <HelpCircle className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <h4 className="text-sm font-bold text-heading font-satoshi">Frequently Asked Questions</h4>
            </div>

            <div className="space-y-3.5 text-xs text-body">
              <div>
                <h5 className="font-bold text-heading">How long does verification take?</h5>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                  Verification is typically completed within 12–24 business hours by our operations team.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-heading">What can I do while waiting?</h5>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                  You can ensure your corporate profile and contact information are fully accurate. Once verified, you will immediately gain full access to post roles.
                </p>
              </div>

              <div>
                <h5 className="font-bold text-heading">Need expedited verification?</h5>
                <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
                  Please reach out to support@jobportal.ai from your official company work email address.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit / Submission Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Submit Company Verification"
        size="lg"
      >
        <div className="p-2 sm:p-4">
          <VerificationForm
            initialData={verificationData}
            onSuccess={() => {
              setEditModalOpen(false);
              dispatch(fetchVerificationStatus());
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
