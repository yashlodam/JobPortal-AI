/**
 * src/components/recruiter/verification/VerificationForm.jsx
 *
 * Professional verification submission form for recruiters.
 * Features client validation, required field indicators, loading states, and error handling.
 */

import React, { useState, useEffect } from "react";
import { TextInput, Textarea, Button } from "@mantine/core";
import {
  Building2,
  Globe,
  Mail,
  User,
  MapPin,
  Briefcase,
  Link2,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import { submitVerification } from "../../../State/verificationSlice";
import { useToast } from "../../ui/ToastNotification";

const fieldStyles = {
  label: { color: "var(--text-heading)", fontSize: 13, fontWeight: 600, marginBottom: 6 },
  input: {
    backgroundColor: "var(--bg-surface-elevated)",
    borderColor: "var(--border-border)",
    color: "var(--text-heading)",
    borderRadius: 14,
    fontSize: 13,
  },
};

export default function VerificationForm({ initialData, onSuccess }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.profile);
  const { verificationSubmitting, verificationError } = useAppSelector((state) => state.verification);
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || user?.name || "",
    workEmail: initialData?.workEmail || user?.email || "",
    designation: initialData?.designation || "",
    companyName: initialData?.companyName || user?.companyName || "",
    companyWebsite: initialData?.companyWebsite || "",
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

    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required";
    }

    if (!formData.workEmail.trim()) {
      errs.workEmail = "Work email address is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.workEmail.trim())) {
      errs.workEmail = "Please provide a valid email format";
    }

    if (!formData.designation.trim()) {
      errs.designation = "Your designation/role at the company is required";
    }

    if (!formData.companyName.trim()) {
      errs.companyName = "Company name is required";
    }

    if (!formData.companyWebsite.trim()) {
      errs.companyWebsite = "Official company website is required";
    } else if (
      !/^https?:\/\//i.test(formData.companyWebsite.trim()) &&
      !formData.companyWebsite.includes(".")
    ) {
      errs.companyWebsite = "Enter a valid website URL (e.g. https://company.com)";
    }

    if (!formData.companyLocation.trim()) {
      errs.companyLocation = "Company headquarters / primary location is required";
    }

    if (!formData.companyDescription.trim()) {
      errs.companyDescription = "Brief company overview is required";
    } else if (formData.companyDescription.trim().length < 20) {
      errs.companyDescription = "Description must be at least 20 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      toast.warning("Please fill out all required verification fields.");
      return;
    }

    try {
      await dispatch(submitVerification(formData)).unwrap();
      toast.success("Verification information submitted for review.");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err || "Failed to submit verification details. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {verificationError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{verificationError}</span>
        </div>
      )}

      {/* Section 1: Recruiter Identity */}
      <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <User className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-extrabold text-heading font-satoshi">Recruiter & Representative Identity</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label={<span>Full Legal Name <span className="text-rose-400">*</span></span>}
            placeholder="e.g. Sarah Jenkins"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            error={errors.fullName}
            leftSection={<User size={15} className="text-muted" />}
            styles={fieldStyles}
            required
          />

          <TextInput
            label={<span>Designation / Role <span className="text-rose-400">*</span></span>}
            placeholder="e.g. Head of Talent Acquisition"
            value={formData.designation}
            onChange={(e) => handleChange("designation", e.target.value)}
            error={errors.designation}
            leftSection={<Briefcase size={15} className="text-muted" />}
            styles={fieldStyles}
            required
          />

          <TextInput
            label={<span>Work Email Address <span className="text-rose-400">*</span></span>}
            placeholder="e.g. sarah@techcorp.com"
            value={formData.workEmail}
            onChange={(e) => handleChange("workEmail", e.target.value)}
            error={errors.workEmail}
            leftSection={<Mail size={15} className="text-muted" />}
            styles={fieldStyles}
            required
          />

          <TextInput
            label="LinkedIn / Professional Profile (Optional)"
            placeholder="e.g. https://linkedin.com/in/sarahjenkins"
            value={formData.linkedinProfile}
            onChange={(e) => handleChange("linkedinProfile", e.target.value)}
            error={errors.linkedinProfile}
            leftSection={<Link2 size={15} className="text-muted" />}
            styles={fieldStyles}
          />
        </div>
      </div>

      {/* Section 2: Company Verification Information */}
      <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Building2 className="h-4 w-4 text-purple-500" />
          <h4 className="text-sm font-extrabold text-heading font-satoshi">Corporate & Employer Information</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label={<span>Company / Organization Name <span className="text-rose-400">*</span></span>}
            placeholder="e.g. TechCorp Solutions Inc."
            value={formData.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            error={errors.companyName}
            leftSection={<Building2 size={15} className="text-muted" />}
            styles={fieldStyles}
            required
          />

          <TextInput
            label={<span>Official Website URL <span className="text-rose-400">*</span></span>}
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
              label={<span>Headquarters / Office Location <span className="text-rose-400">*</span></span>}
              placeholder="e.g. San Francisco, CA or Bengaluru, India"
              value={formData.companyLocation}
              onChange={(e) => handleChange("companyLocation", e.target.value)}
              error={errors.companyLocation}
              leftSection={<MapPin size={15} className="text-muted" />}
              styles={fieldStyles}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Textarea
              label={<span>Company Overview & Industry <span className="text-rose-400">*</span></span>}
              placeholder="Describe your organization's business, technology stack, and primary operations..."
              value={formData.companyDescription}
              onChange={(e) => handleChange("companyDescription", e.target.value)}
              error={errors.companyDescription}
              styles={fieldStyles}
              minRows={3}
              maxRows={6}
              autosize
              required
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          radius="xl"
          size="md"
          loading={verificationSubmitting}
          loaderProps={{ type: "dots" }}
          disabled={verificationSubmitting}
          rightSection={!verificationSubmitting && <ArrowRight size={16} />}
          className="!bg-gradient-to-r !from-indigo-600 !via-purple-600 !to-pink-600 hover:!from-indigo-500 hover:!to-pink-500 !text-white !font-bold !shadow-lg !shadow-indigo-500/25 transition-all cursor-pointer"
        >
          {verificationSubmitting ? "Submitting for Review..." : "Submit Verification Information"}
        </Button>
      </div>
    </form>
  );
}
