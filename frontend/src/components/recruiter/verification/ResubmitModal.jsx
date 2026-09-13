/**
 * src/components/recruiter/verification/ResubmitModal.jsx
 *
 * Modal allowing recruiters with REJECTED verification status to update
 * their designation, notes, and company verification details, and submit
 * POST /api/recruiter/verification/submit to reset status back to PENDING_VERIFICATION.
 */

import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/Modal";
import { TextInput, Textarea, Button } from "@mantine/core";
import {
  RotateCcw,
  Building2,
  Globe,
  Mail,
  User,
  MapPin,
  Briefcase,
  Link2,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import { submitVerification, fetchVerificationStatus } from "../../../State/verificationSlice";
import { useToast } from "../../ui/ToastNotification";

const fieldStyles = {
  label: { color: "var(--text-heading)", fontSize: 12, fontWeight: 600, marginBottom: 5 },
  input: {
    backgroundColor: "var(--bg-surface-elevated)",
    borderColor: "var(--border-border)",
    color: "var(--text-heading)",
    borderRadius: 12,
    fontSize: 13,
  },
};

export default function ResubmitModal({ isOpen, onClose, initialData }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const user = useAppSelector((state) => state.auth.profile);
  const { verificationSubmitting, verificationError } = useAppSelector(
    (state) => state.verification
  );

  const [formData, setFormData] = useState({
    designation: initialData?.designation || "",
    note: initialData?.note || "",
    companyName: initialData?.companyName || user?.companyName || "",
    companyWebsite: initialData?.companyWebsite || "",
    workEmail: initialData?.workEmail || user?.email || "",
    companyLocation: initialData?.companyLocation || "",
    companyDescription: initialData?.companyDescription || "",
    linkedinProfile: initialData?.linkedinProfile || "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.designation?.trim()) {
      errs.designation = "Designation / Role is required";
    }
    if (!formData.companyName?.trim()) {
      errs.companyName = "Company name is required";
    }
    if (!formData.companyWebsite?.trim()) {
      errs.companyWebsite = "Official company website is required";
    }
    if (!formData.workEmail?.trim()) {
      errs.workEmail = "Work email address is required";
    }
    if (!formData.note?.trim()) {
      errs.note = "Please provide an explanation note of the corrections made";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      toast.warning("Please complete all required fields.");
      return;
    }

    try {
      await dispatch(submitVerification(formData)).unwrap();
      toast.success("Verification resubmitted successfully. Your account is now pending review.");
      dispatch(fetchVerificationStatus());
      onClose();
    } catch (err) {
      toast.error(err || "Failed to resubmit verification details.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update & Resubmit Verification"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-2 sm:p-4 space-y-5 text-heading">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-600 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
          <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <span>
            Please address any issues highlighted in your review feedback. Resubmitting will immediately update your status back to <strong>Pending Verification</strong> for administrator review.
          </span>
        </div>

        {verificationError && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{verificationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label={<span>Designation / Title <span className="text-rose-400">*</span></span>}
            placeholder="e.g. Lead Talent Acquisition Partner"
            value={formData.designation}
            onChange={(e) => handleChange("designation", e.target.value)}
            error={errors.designation}
            leftSection={<Briefcase size={15} className="text-muted" />}
            styles={fieldStyles}
            required
          />

          <TextInput
            label={<span>Official Work Email <span className="text-rose-400">*</span></span>}
            placeholder="e.g. name@company.com"
            value={formData.workEmail}
            onChange={(e) => handleChange("workEmail", e.target.value)}
            error={errors.workEmail}
            leftSection={<Mail size={15} className="text-muted" />}
            styles={fieldStyles}
            required
          />

          <TextInput
            label={<span>Company Name <span className="text-rose-400">*</span></span>}
            placeholder="e.g. TechCorp Solutions Inc."
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            error={errors.companyName}
            leftSection={<Building2 size={15} className="text-muted" />}
            styles={fieldStyles}
            required
          />

          <TextInput
            label={<span>Company Website <span className="text-rose-400">*</span></span>}
            placeholder="e.g. https://techcorp.com"
            value={formData.companyWebsite}
            onChange={(e) => handleChange("companyWebsite", e.target.value)}
            error={errors.companyWebsite}
            leftSection={<Globe size={15} className="text-muted" />}
            styles={fieldStyles}
            required
          />

          <div className="sm:col-span-2">
            <TextInput
              label="Company Location / Headquarters"
              placeholder="e.g. San Francisco, CA"
              value={formData.companyLocation}
              onChange={(e) => handleChange("companyLocation", e.target.value)}
              leftSection={<MapPin size={15} className="text-muted" />}
              styles={fieldStyles}
            />
          </div>

          <div className="sm:col-span-2">
            <Textarea
              label={<span>Correction Note / Message to Admin <span className="text-rose-400">*</span></span>}
              placeholder="Explain the changes made (e.g. Provided corporate email address and verified registration website)..."
              value={formData.note}
              onChange={(e) => handleChange("note", e.target.value)}
              error={errors.note}
              styles={fieldStyles}
              minRows={3}
              maxRows={5}
              autosize
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            disabled={verificationSubmitting}
            onClick={onClose}
            className="h-10 rounded-xl border border-border bg-surface px-4 text-xs font-bold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer"
          >
            Cancel
          </button>

          <Button
            type="submit"
            radius="xl"
            size="md"
            loading={verificationSubmitting}
            loaderProps={{ type: "dots" }}
            disabled={verificationSubmitting}
            rightSection={!verificationSubmitting && <ArrowRight size={15} />}
            className="!bg-gradient-to-r !from-indigo-600 !to-violet-600 hover:!from-indigo-500 hover:!to-violet-500 !text-white !font-bold !shadow-lg !shadow-indigo-500/25 transition cursor-pointer"
          >
            {verificationSubmitting ? "Resubmitting…" : "Resubmit Verification"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
