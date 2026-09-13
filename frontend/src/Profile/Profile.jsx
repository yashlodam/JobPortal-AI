import { ActionIcon, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBriefcase,
  IconCamera,
  IconCertificate,
  IconDeviceFloppy,
  IconExternalLink,
  IconGlobe,
  IconLanguage,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconBrandGithub,
  IconBrandLinkedin,
  IconSchool,
  IconTrash,
  IconX,
  IconUser,
  IconStar,
  IconPhoto,
  IconMaximize,
  IconDownload,
  IconEye,
   IconFileCv
} from "@tabler/icons-react";

import { MonthPickerInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import dayjs from "dayjs";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
} from "react";

import { useAppDispatch, useAppSelector } from "../State/Store";
import { getAssetUrl, resolveImageUrl } from "../utils/assetUtils";

// ── Thunks ────────────────────────────────────────────────────────────────────
import {
  uploadProfileImageThunk,
  uploadBannerImageThunk,
  updateHeaderThunk,
  updateLinksThunk,
  updateAboutThunk,
  addSkillThunk,
  deleteSkillThunk,
  addExperienceThunk,
  updateExperienceThunk,
  fetchExperiencesThunk,
  deleteExperienceThunk,
  addEducationThunk,
  updateEducationThunk,
  fetchEducationsThunk,
  deleteEducationThunk,
  addCertificationThunk,
  updateCertificationThunk,
  fetchCertificationsThunk,
  deleteCertificationThunk,
  addLanguageThunk,
  deleteLanguageThunk,
  fetchLanguagesThunk,
  fetchMyProfileThunk,
} from "../State/profileThunk";
import {
  fetchMyResumesThunk,
  uploadResumeThunk,
  deleteResumeThunk,
  setDefaultResumeThunk,
} from "../State/resumeThunk";

// ── Selectors ─────────────────────────────────────────────────────────────────
import {
  selectProfile,
  selectProfileLoading,
  selectProfileError,
  selectProfileSuccess,
  clearProfileSuccess,
  clearProfileError,
} from "../State/profileSlice";

/* ============================================================
   Helpers
   ============================================================ */

let _counter = Date.now();
const uid = () => `id_${(_counter++).toString(36)}`;

const revokeBlob = (url) => {
  if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
};

/** Deep-clone a plain JS value (arrays/objects of primitives). */
const deepClone = (v) => JSON.parse(JSON.stringify(v));

/** Normalise backend ProfileResponse into the unified UI profile schema. */
function normaliseProfile(rp) {
  if (!rp) return null;
  return {
    id: rp.id ?? rp.profileId ?? rp.userId ?? rp._id,
    name: rp.name ?? "",
    jobTitle: rp.headline ?? rp.jobTitle ?? rp.role ?? "",
    company: rp.company ?? rp.currentCompany ?? "",
    location: rp.location ?? "",
    about: typeof rp.about === "string" ? rp.about : rp.about?.about ?? "",
    experienceLevel: rp.experienceLevel ?? "MID_LEVEL",
    availability: rp.availability ? (
      rp.availability === "Open to Work" || rp.availability === "Open to Opportunities" ? "OPEN_TO_WORK" :
      rp.availability === "Employed" ? "EMPLOYED" :
      rp.availability === "Not Looking" ? "NOT_LOOKING" :
      rp.availability
    ) : "OPEN_TO_WORK",
    profileImage: rp.profileImage ?? null,
    bannerImage: rp.bannerImage ?? null,

    skills: Array.isArray(rp.skills) ? rp.skills : [],

    // Map ExperienceResponse fields → local UI fields
    experience: (rp.experiences ?? rp.experience ?? []).map((e) => ({
      _id: e.id ? `id_${e.id}` : uid(),
      id: e.id ?? e._id ?? null,
      title: e.title ?? e.jobTitle ?? e.role ?? "",
      company: e.company ?? e.companyName ?? "",
      location: e.location ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
      working: e.working ?? e.currentlyWorking ?? false,
      description: e.description ?? "",
      employmentType: e.employmentType ?? "",
    })),

    // Map EducationResponse fields → local UI fields
    education: (rp.educations ?? rp.education ?? []).map((e) => ({
      _id: e.id ? `id_${e.id}` : uid(),
      id: e.id ?? e._id ?? null,
      degree: e.degree ?? "",
      collegeName: e.collegeName ?? e.school ?? e.institution ?? "",
      university: e.university ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
      location: e.location ?? "",
      grade: e.grade ?? "",
    })),

    // Map CertificationResponse fields → local UI fields
    certifications: (rp.certifications ?? []).map((c) => ({
      _id: c.id ? `id_${c.id}` : uid(),
      id: c.id ?? c._id ?? null,
      title: c.title ?? c.name ?? "",
      issuer: c.issuer ?? c.issuingOrganization ?? "",
      issueDate: c.issueDate ?? "",
      certificateId: c.certificateId ?? "",
      certificateUrl: c.certificateUrl ?? "",
      imageUrl: c.imageUrl ?? c.certificateImage ?? null,
    })),

    languages: Array.isArray(rp.languages) ? rp.languages : [],

    socialLinks: {
      linkedin: rp.linkedinUrl ?? rp.links?.linkedinUrl ?? rp.socialLinks?.linkedin ?? "",
      github: rp.githubUrl ?? rp.links?.githubUrl ?? rp.socialLinks?.github ?? "",
      portfolio: rp.portfolioUrl ?? rp.links?.portfolioUrl ?? rp.socialLinks?.portfolio ?? "",
    },

    resume: {
      resumeUrl: rp.resumeUrl ?? null,
      resumeName: rp.resumeName ?? null,
    }
  };
}

/* ============================================================
   Design tokens
   ============================================================ */

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-heading placeholder:text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200";
const textareaCls = `${inputCls} resize-none leading-6`;
const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted";
const sectionHeadingCls =
  "font-satoshi text-xl font-bold tracking-tight text-heading sm:text-2xl";

/* ============================================================
   ✅ REUSABLE — ActionButtons
   Renders [Cancel] [Save] when editing=true, [Edit pencil] otherwise.
   ============================================================ */

function ActionButtons({ editing, saving, onEdit, onSave, onCancel, hasAddButton, onAdd, addLabel }) {
  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        {hasAddButton && (
          <ActionIcon
            variant="light"
            radius="xl"
            size="lg"
            aria-label={addLabel ?? "Add item"}
            className="!bg-white/5 hover:!bg-primary/15 border border-white/10 hover:border-primary/40 transition-all duration-300"
            onClick={onAdd}
          >
            <IconPlus size={20} className="text-slate-400" />
          </ActionIcon>
        )}
        <ActionIcon
          variant="light"
          radius="xl"
          size="lg"
          aria-label="Edit section"
          className="!bg-white/5 hover:!bg-cyan-500/15 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 shrink-0"
          onClick={onEdit}
        >
          <IconPencil size={20} className="text-slate-400" />
        </ActionIcon>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Cancel — ghost style */}
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        aria-label="Cancel editing"
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-transparent px-3 py-1.5 text-sm font-medium text-muted hover:border-white/20 hover:bg-white/[0.04] hover:text-body disabled:opacity-40 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/30"
      >
        <IconX size={15} />
        Cancel
      </button>

      {/* Save — primary gradient */}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        aria-label="Save changes"
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-violet px-3 py-1.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.5)] hover:-translate-y-px disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {saving ? (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <IconDeviceFloppy size={15} />
        )}
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

/* ============================================================
   Small reusable primitives
   ============================================================ */

function Field({ label, htmlFor, children, required }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="mt-3 text-sm italic text-muted/70">{text}</p>;
}

function ConfirmModal({ opened, onClose, onConfirm, title, message }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      size="sm"
      overlayProps={{ blur: 4 }}
    >
      <p className="text-sm text-body">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => { onConfirm(); onClose(); }}
          className="btn btn-sm rounded-xl bg-danger/90 text-white hover:bg-danger"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}

/* ============================================================
   Certificate Fullscreen Preview Modal
   ============================================================ */

const CertificatePreviewModal = memo(function CertificatePreviewModal({ src, alt, onClose }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate preview: ${alt}`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <IconX size={18} />
      </button>
      <div
        className="relative max-h-[90vh] max-w-[90vw] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="max-h-[88vh] max-w-[88vw] w-auto h-auto object-contain rounded-2xl shadow-2xl"
          style={{ imageOrientation: "from-image" }}
        />
      </div>
    </div>
  );
});

/* ============================================================
   Section wrapper
   ============================================================ */

function Section({ children }) {
  return (
    <section className="relative rounded-2xl border border-white/[0.06] bg-surface/50 p-5 sm:p-6 backdrop-blur-sm">
      {children}
    </section>
  );
}

/* ============================================================
   DeleteButton (inline per-row)
   ============================================================ */

function DeleteButton({ onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="shrink-0 rounded-lg p-1 text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200"
    >
      <IconTrash size={16} />
    </button>
  );
}

/* ============================================================
   Constants
   ============================================================ */

export const AVAILABILITY_OPTIONS = [
  {
    label: "Open to Work",
    value: "OPEN_TO_WORK",
    color: "bg-success/15 border-success/30 text-success-light",
  },
  {
    label: "Employed",
    value: "EMPLOYED",
    color: "bg-indigo-50 dark:bg-primary/15 border-indigo-200 dark:border-primary/30 text-indigo-700 dark:text-indigo-300",
  },
  {
    label: "Not Looking",
    value: "NOT_LOOKING",
    color: "bg-white/5 border-white/10 text-muted",
  },
];

export const EXPERIENCE_LEVELS = [
  {
    label: "Internship",
    value: "INTERNSHIP",
  },
  {
    label: "Entry Level",
    value: "ENTRY_LEVEL",
  },
  {
    label: "Mid Level",
    value: "MID_LEVEL",
  },
  {
    label: "Senior Level",
    value: "SENIOR_LEVEL",
  },
  {
    label: "Lead",
    value: "LEAD",
  },
  {
    label: "Manager",
    value: "MANAGER",
  },
  {
    label: "Executive",
    value: "EXECUTIVE",
  },
];
export const JOB_TYPES = [
  {
    label: "Full Time",
    value: "FULL_TIME",
  },
  {
    label: "Part Time",
    value: "PART_TIME",
  },
  {
    label: "Internship",
    value: "INTERNSHIP",
  },
  {
    label: "Contract",
    value: "CONTRACT",
  },
  {
    label: "Freelance",
    value: "FREELANCE",
  },
];
/* ============================================================
/* ============================================================
   BannerPlaceholder
   ============================================================ */

function BannerPlaceholder({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer select-none group/ph"
      role="button"
      tabIndex={0}
      aria-label="Upload banner image"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet/10 to-accent/15 opacity-80" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-2 opacity-70 group-hover/ph:opacity-100 group-hover/ph:scale-105 transition-all duration-200">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-md">
          <IconPhoto size={24} stroke={1.5} className="text-white" />
        </div>
        <span className="text-xs font-semibold text-white tracking-wider uppercase">
          Add a banner image
        </span>
        <span className="text-[11px] text-white/60">
          Click to upload PNG, JPG or WEBP (up to 5MB)
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   ProfileSkeleton
   ============================================================ */

function ProfileSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16 animate-pulse">
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-surface">
        <div className="relative h-60 sm:h-72 bg-white/[0.04] overflow-hidden">
          <div className="absolute inset-0 animate-[shimmer-slide_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
        <div className="px-5 sm:px-7 pb-6 -mt-14">
          <div className="h-28 w-28 rounded-2xl bg-white/[0.08]" />
          <div className="mt-4 space-y-2">
            <div className="h-7 w-48 rounded-xl bg-white/[0.06]" />
            <div className="h-4 w-36 rounded-xl bg-white/[0.04]" />
          </div>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      ))}
    </div>
  );
}

/* ============================================================
   CertificateImageCard
   ============================================================ */

const CertificateImageCard = memo(function CertificateImageCard({ src, alt, onOpenPreview }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Preview certificate: ${alt}`}
      onClick={() => onOpenPreview(src, alt)}
      className="group relative block w-full overflow-hidden rounded-xl border border-white/[0.08] bg-surface-elevated shadow-[0_4px_24px_rgba(0,0,0,0.35)] hover:border-primary/30 hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary/60"
      style={{ aspectRatio: "auto" }}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated animate-pulse">
          <div className="h-8 w-8 rounded-full bg-white/10 animate-ping" />
        </div>
      )}
      {error && (
        <div className="flex h-48 items-center justify-center bg-surface-elevated">
          <div className="flex flex-col items-center gap-2 text-muted">
            <IconPhoto size={32} stroke={1.2} />
            <span className="text-xs">Image not available</span>
          </div>
        </div>
      )}
      {!error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={[
            "max-h-[420px] w-full object-contain rounded-xl bg-neutral-900",
            "transition-all duration-500 group-hover:scale-[1.02]",
            loaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
          style={{ imageOrientation: "from-image" }}
        />
      )}
      {loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 group-hover:bg-black/40 transition-all duration-300">
          <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <IconMaximize size={14} />
            View full size
          </div>
        </div>
      )}
    </button>
  );
});

/* ============================================================
   ✅ REUSABLE HOOK — useEditableSection
   Manages draft state, edit mode, saving spinner, and cancel revert.

   Usage:
     const { draft, setDraft, editing, saving,
             startEdit, cancelEdit, saveEdit } = useEditableSection(source);

   - source : the slice of data to mirror (e.g. data.about, data.skills)
   - startEdit()        : captures a snapshot and enters edit mode
   - cancelEdit()       : exits edit mode, restores snapshot via callback
   - saveEdit(thunkFn)  : dispatches the thunk, exits on success
   ============================================================ */

const formatDateToYYYYMMDD = (val) => {
  if (!val) return null;
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const parsed = dayjs(val);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
};

function useEditableSection(opts = {}) {
  const storeDispatch = useAppDispatch();
  const dispatch = (opts && typeof opts.dispatch === "function") ? opts.dispatch : storeDispatch;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const snapshotRef = useRef(null); // deep clone of data at edit-start

  const startEdit = useCallback((currentData) => {
    snapshotRef.current = deepClone(currentData);
    setEditing(true);
  }, []);

  const cancelEdit = useCallback((restoreFn) => {
    // restoreFn receives the snapshot and should reset the relevant state
    if (snapshotRef.current !== null && restoreFn) {
      restoreFn(snapshotRef.current);
    }
    snapshotRef.current = null;
    setEditing(false);
  }, []);

  const saveEdit = useCallback(
    async (actionOrFn, onSuccess) => {
      setSaving(true);
      try {
        if (typeof actionOrFn === "function") {
          const res = dispatch(actionOrFn);
          if (res && typeof res.unwrap === "function") {
            await res.unwrap();
          } else {
            await res;
          }
        } else if (actionOrFn && typeof actionOrFn.unwrap === "function") {
          await actionOrFn.unwrap();
        } else if (actionOrFn?.then) {
          await actionOrFn;
        } else if (actionOrFn) {
          const res = dispatch(actionOrFn);
          if (res && typeof res.unwrap === "function") {
            await res.unwrap();
          } else {
            await res;
          }
        }
        snapshotRef.current = null;
        setEditing(false);
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Save section error:", err);
        const errorMsg =
          err?.message ||
          err?.error ||
          (typeof err === "string" ? err : "Failed to save changes. Please try again.");
        notifications.show({
          title: "Save Failed",
          message: errorMsg,
          color: "red",
          autoClose: 4000,
        });
      } finally {
        setSaving(false);
      }
    },
    [dispatch]
  );

  return { editing, saving, startEdit, cancelEdit, saveEdit };
}

/* ============================================================
   Main Profile Component
   ============================================================ */

function Profile() {
  const dispatch = useAppDispatch();

  // ── Redux state ─────────────────────────────────────────────────────────
  const reduxProfile = useAppSelector(selectProfile);
  const isLoading = useAppSelector(selectProfileLoading);
  const reduxError = useAppSelector(selectProfileError);
  const reduxSuccess = useAppSelector(selectProfileSuccess);

  // ── Canonical local data (synced from Redux) ─────────────────────────────
  const [data, setData] = useState(() => reduxProfile ? normaliseProfile(reduxProfile) : null);

  // ── Per-section draft state (only active while editing) ──────────────────
  // Each section stores its own editable copy separately from `data`,
  // so Cancel can restore cleanly without touching other sections.

  const [headerDraft, setHeaderDraft] = useState(null);
  const [aboutDraft, setAboutDraft] = useState(null);
  const [linksDraft, setLinksDraft] = useState(null);
  const [skillsDraft, setSkillsDraft] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [expDraft, setExpDraft] = useState(null);
  const [eduDraft, setEduDraft] = useState(null);
  const [certDraft, setCertDraft] = useState(null);
  const [langDraft, setLangDraft] = useState(null);
  const [langInput, setLangInput] = useState("");

  // ── Misc UI state ─────────────────────────────────────────────────────────
  const [confirm, setConfirm] = useState(null);
  const [certPreview, setCertPreview] = useState(null);
  const [bannerError, setBannerError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // ── Image refs ────────────────────────────────────────────────────────────
  const bannerInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const prevBannerRef = useRef(null);
  const prevAvatarRef = useRef(null);

  // ── Per-section hooks ────────────────────────────────────────────────────
  const headerSection = useEditableSection({ dispatch, sectionKey: "header" });
  const aboutSection = useEditableSection({ dispatch, sectionKey: "about" });
  const linksSection = useEditableSection({ dispatch, sectionKey: "links" });
  const skillsSection = useEditableSection({ dispatch, sectionKey: "skills" });
  const expSection = useEditableSection({ dispatch, sectionKey: "experience" });
  const eduSection = useEditableSection({ dispatch, sectionKey: "education" });
  const certSection = useEditableSection({ dispatch, sectionKey: "certifications" });
  const langSection = useEditableSection({ dispatch, sectionKey: "languages" });
  const resumeSection = useEditableSection({ dispatch, sectionKey: "resume" });

  const resumeInputRef = useRef(null);


 

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchMyProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!reduxProfile) return;
    const normalised = normaliseProfile(reduxProfile);
    setData(normalised);
    if (reduxProfile.bannerImage !== prevBannerRef.current) {
      prevBannerRef.current = reduxProfile.bannerImage ?? null;
      setBannerError(false);
    }
    if (reduxProfile.profileImage !== prevAvatarRef.current) {
      prevAvatarRef.current = reduxProfile.profileImage ?? null;
      setAvatarError(false);
    }
  }, [reduxProfile]);

  // ── Toast handlers ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!reduxSuccess) return;
    notifications.show({ title: "Saved", message: "Your profile has been updated.", color: "teal", autoClose: 2500 });
    dispatch(clearProfileSuccess());
  }, [reduxSuccess, dispatch]);

  useEffect(() => {
    if (!reduxError) return;
    notifications.show({ title: "Something went wrong", message: reduxError, color: "red", autoClose: 4000 });
    dispatch(clearProfileError());
  }, [reduxError, dispatch]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => () => { revokeBlob(prevBannerRef.current); revokeBlob(prevAvatarRef.current); }, []);

  useEffect(() => {
    document.body.style.overflow = certPreview ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [certPreview]);

  /* ── Generic draft updaters ── */

  const updateDraftField = useCallback((setDraftFn, field, value) => {
    setDraftFn((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateDraftListItem = useCallback((setDraftFn, id, field, value) => {
    setDraftFn((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  /* ── Image uploads (no cancel; immediate optimistic + API) ── */

  const handleBannerSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: "File Too Large",
        message: "Banner image must be under 5MB.",
        color: "red",
        autoClose: 4000,
      });
      e.target.value = "";
      return;
    }

    const previousBanner = data.bannerImage;
    revokeBlob(prevBannerRef.current);
    const url = URL.createObjectURL(file);
    prevBannerRef.current = url;
    setBannerError(false);
    setData((prev) => ({ ...prev, bannerImage: url }));
    e.target.value = "";
    try {
      const res = await dispatch(uploadBannerImageThunk(file)).unwrap();
      const payload = res?.data ?? res;
      const newBanner = payload?.bannerImage || payload?.url || payload?.bannerUrl;
      if (newBanner) {
        setData((prev) => ({ ...prev, bannerImage: newBanner }));
        prevBannerRef.current = newBanner;
      }
      dispatch(fetchMyProfileThunk());
      notifications.show({
        title: "Banner Updated",
        message: "Your banner image has been updated successfully.",
        color: "teal",
        autoClose: 3000,
      });
    } catch (err) {
      setData((prev) => ({ ...prev, bannerImage: previousBanner }));
      prevBannerRef.current = previousBanner;
      notifications.show({
        title: "Banner Upload Failed",
        message: err?.message || "Failed to upload banner image.",
        color: "red",
        autoClose: 4000,
      });
    }
  }, [data, dispatch]);

  const handleAvatarSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: "File Too Large",
        message: "Profile photo must be under 5MB.",
        color: "red",
        autoClose: 4000,
      });
      e.target.value = "";
      return;
    }

    const previousAvatar = data.profileImage;
    revokeBlob(prevAvatarRef.current);
    const url = URL.createObjectURL(file);
    prevAvatarRef.current = url;
    setAvatarError(false);
    setData((prev) => ({ ...prev, profileImage: url }));
    e.target.value = "";
    try {
      const res = await dispatch(uploadProfileImageThunk(file)).unwrap();
      const payload = res?.data ?? res;
      if (payload?.profileImage) {
        setData((prev) => ({ ...prev, profileImage: payload.profileImage }));
      }
      dispatch(fetchMyProfileThunk());
      notifications.show({
        title: "Profile Photo Updated",
        message: "Your profile photo has been updated successfully.",
        color: "teal",
        autoClose: 3000,
      });
    } catch (err) {
      setData((prev) => ({ ...prev, profileImage: previousAvatar }));
      notifications.show({
        title: "Photo Upload Failed",
        message: err?.message || "Failed to upload profile photo.",
        color: "red",
        autoClose: 4000,
      });
    }
  }, [data, dispatch]);


  const { resumes, uploadLoading } = useAppSelector((state) => state.resume);

  useEffect(() => {
    dispatch(fetchMyResumesThunk());
  }, [dispatch]);

  const handleResumeUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await dispatch(
          uploadResumeThunk({
            file,
            resumeName: file.name,
            isDefault: resumes.length === 0,
          })
        ).unwrap();
        dispatch(fetchMyResumesThunk());
        notifications.show({
          title: "Resume Uploaded",
          message: `${file.name} uploaded successfully.`,
          color: "teal",
          autoClose: 2500,
        });
      } catch (error) {
        notifications.show({
          title: "Upload Failed",
          message: error?.message || "Could not upload resume.",
          color: "red",
          autoClose: 4000,
        });
      } finally {
        e.target.value = "";
      }
    },
    [dispatch, resumes]
  );

  const handleDeleteResume = useCallback(
    async (resumeId) => {
      try {
        await dispatch(deleteResumeThunk(resumeId)).unwrap();
        dispatch(fetchMyResumesThunk());
        notifications.show({
          title: "Resume Deleted",
          message: "Resume removed successfully.",
          color: "teal",
          autoClose: 2500,
        });
      } catch (error) {
        notifications.show({
          title: "Delete Failed",
          message: error?.message || "Could not delete resume.",
          color: "red",
          autoClose: 4000,
        });
      }
    },
    [dispatch]
  );

  const handleSetDefaultResume = useCallback(
    async (resumeId) => {
      try {
        await dispatch(setDefaultResumeThunk(resumeId)).unwrap();
        dispatch(fetchMyResumesThunk());
        notifications.show({
          title: "Default Resume Updated",
          message: "Set as default application resume.",
          color: "teal",
          autoClose: 2500,
        });
      } catch (error) {
        notifications.show({
          title: "Update Failed",
          message: error?.message || "Could not update default resume.",
          color: "red",
          autoClose: 4000,
        });
      }
    },
    [dispatch]
  );
  /* ================================================================
     HEADER section handlers
     ================================================================ */

  const onEditHeader = useCallback(() => {
    setHeaderDraft({
      name: data.name,
      jobTitle: data.jobTitle,
      company: data.company,
      location: data.location,
      availability: data.availability,
      experienceLevel: data.experienceLevel,
    });
    headerSection.startEdit(null);
  }, [data, headerSection]);

  const onCancelHeader = useCallback(() => {
    setHeaderDraft(null);
    headerSection.cancelEdit(null);
  }, [headerSection]);

  const onSaveHeader = useCallback(() => {
    if (!data || !headerDraft) return;
    headerSection.saveEdit(async () => {
      const payload = {
        name: headerDraft.name ? headerDraft.name.trim() : null,
        headline: headerDraft.jobTitle ? headerDraft.jobTitle.trim() : null,
        currentCompany: headerDraft.company ? headerDraft.company.trim() : null,
        location: headerDraft.location ? headerDraft.location.trim() : null,
        availability: headerDraft.availability || null,
        experienceLevel: headerDraft.experienceLevel || null,
      };
      await dispatch(updateHeaderThunk(payload)).unwrap();
      setData((prev) => ({ ...prev, ...headerDraft }));
      setHeaderDraft(null);
      await dispatch(fetchMyProfileThunk()).unwrap();
    });
  }, [data, headerDraft, headerSection, dispatch]);

  /* ================================================================
     ABOUT section handlers
     ================================================================ */

  const onEditAbout = useCallback(() => {
    setAboutDraft(data.about);
    aboutSection.startEdit(null);
  }, [data, aboutSection]);

  const onCancelAbout = useCallback(() => {
    setAboutDraft(null);
    aboutSection.cancelEdit(null);
  }, [aboutSection]);

  const onSaveAbout = useCallback(() => {
    if (!data) return;
    aboutSection.saveEdit(async () => {
      await dispatch(updateAboutThunk({ about: aboutDraft ?? "" })).unwrap();
      setData((prev) => ({ ...prev, about: aboutDraft ?? "" }));
      setAboutDraft(null);
      await dispatch(fetchMyProfileThunk()).unwrap();
    });
  }, [data, aboutDraft, aboutSection, dispatch]);

  /* ================================================================
     LINKS section handlers
     ================================================================ */

  const onEditLinks = useCallback(() => {
    setLinksDraft({ ...data.socialLinks });
    linksSection.startEdit(null);
  }, [data, linksSection]);

  const onCancelLinks = useCallback(() => {
    setLinksDraft(null);
    linksSection.cancelEdit(null);
  }, [linksSection]);

  const onSaveLinks = useCallback(() => {
    if (!data || !linksDraft) return;
    linksSection.saveEdit(async () => {
      const payload = {
        linkedinUrl: linksDraft.linkedin ? linksDraft.linkedin.trim() : null,
        githubUrl: linksDraft.github ? linksDraft.github.trim() : null,
        portfolioUrl: linksDraft.portfolio ? linksDraft.portfolio.trim() : null,
      };
      await dispatch(updateLinksThunk(payload)).unwrap();
      setData((prev) => ({ ...prev, socialLinks: { ...linksDraft } }));
      setLinksDraft(null);
      await dispatch(fetchMyProfileThunk()).unwrap();
    });
  }, [data, linksDraft, linksSection, dispatch]);

  /* ================================================================
     SKILLS section handlers
     ── Skills are optimistic (add/delete fires immediately to API).
     ── Cancel restores the snapshot taken at edit-open.
     ================================================================ */

  const onEditSkills = useCallback(() => {
    // Snapshot current skills
    setSkillsDraft(deepClone(data.skills));
    skillsSection.startEdit(null);
    setSkillInput("");
  }, [data, skillsSection]);

  const onCancelSkills = useCallback(() => {
    // Restore from snapshot — we DON'T call the API here;
    // the local data.skills is reset to the snapshot.
    if (skillsDraft !== null) {
      setData((prev) => ({ ...prev, skills: deepClone(skillsDraft) }));
    }
    setSkillsDraft(null);
    setSkillInput("");
    skillsSection.cancelEdit(null);
  }, [skillsDraft, skillsSection]);

  const onSaveSkills = useCallback(async () => {
    const pendingSkill = skillInput.trim();
    if (pendingSkill) {
      if (!data.skills.some((s) => (typeof s === "string" ? s : s.skill || s.name) === pendingSkill)) {
        setData((prev) => ({ ...prev, skills: [...prev.skills, pendingSkill] }));
        try {
          await dispatch(addSkillThunk(pendingSkill)).unwrap();
        } catch {
          // Toast handled by Redux
        }
      }
    }
    setSkillsDraft(null);
    setSkillInput("");
    skillsSection.cancelEdit(null);
    notifications.show({
      title: "Skills Saved",
      message: "Your skills have been updated.",
      color: "teal",
      autoClose: 2500,
    });
  }, [skillInput, data, dispatch, skillsSection]);

  const addSkillLocal = useCallback(() => {
    const value = skillInput.trim();
    if (!value) return;
    if (data.skills.some((s) => (typeof s === "string" ? s : s.skill) === value)) {
      setSkillInput("");
      return;
    }
    setData((prev) => ({ ...prev, skills: [...prev.skills, value] }));
    setSkillInput("");
    if (data) dispatch(addSkillThunk(value));
  }, [skillInput, data, dispatch]);

  const removeSkillLocal = useCallback((skill) => {
    const skillName = typeof skill === "object" ? skill.skill : skill;
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => {
        const cur = typeof s === "object" ? s.skill : s;
        return cur !== skillName;
      }),
    }));
    dispatch(deleteSkillThunk(skillName));
  }, [dispatch]);

  /* ================================================================
     EXPERIENCE section handlers
     ================================================================ */

  const onEditExp = useCallback(() => {
    setExpDraft(deepClone(data.experience));
    expSection.startEdit(null);
  }, [data, expSection]);

  const onCancelExp = useCallback(() => {
    if (expDraft !== null) {
      setData((prev) => ({ ...prev, experience: deepClone(expDraft) }));
    }
    setExpDraft(null);
    expSection.cancelEdit(null);
  }, [expDraft, expSection]);

  const onSaveExp = useCallback(() => {
    if (!data) return;

    // Filter out completely empty items
    const validExperiences = data.experience.filter((item) => {
      return (
        Boolean(item.title?.trim()) ||
        Boolean(item.company?.trim()) ||
        Boolean(item.location?.trim()) ||
        Boolean(item.description?.trim())
      );
    });

    // Validate required fields on each remaining item
    for (const item of validExperiences) {
      if (!item.title?.trim()) {
        notifications.show({
          title: "Validation Error",
          message: "Role / Job title is required for all experiences.",
          color: "red",
          autoClose: 4000,
        });
        return;
      }
      if (!item.company?.trim()) {
        notifications.show({
          title: "Validation Error",
          message: `Company name is required for "${item.title}".`,
          color: "red",
          autoClose: 4000,
        });
        return;
      }
      const formattedStartDate = formatDateToYYYYMMDD(item.startDate);
      if (!formattedStartDate) {
        notifications.show({
          title: "Validation Error",
          message: `Start date is required for "${item.title}".`,
          color: "red",
          autoClose: 4000,
        });
        return;
      }
    }

    expSection.saveEdit(async () => {
      if (validExperiences.length === 0 && data.experience.length > 0) {
        setData((prev) => ({ ...prev, experience: [] }));
        setExpDraft(null);
        return;
      }

      const promises = validExperiences.map((item) => {
        const payload = {
          title: item.title.trim(),
          company: item.company.trim(),
          location: item.location?.trim() || null,
          startDate: formatDateToYYYYMMDD(item.startDate),
          endDate: formatDateToYYYYMMDD(item.endDate),
          working: item.working ?? false,
          description: item.description?.trim() || null,
          employmentType: item.employmentType || null,
        };
        if (item.isNew || !item.id) {
          return dispatch(addExperienceThunk(payload)).unwrap();
        } else {
          return dispatch(updateExperienceThunk({ experienceId: item.id, data: payload })).unwrap();
        }
      });

      await Promise.all(promises);
      await dispatch(fetchExperiencesThunk()).unwrap();
      await dispatch(fetchMyProfileThunk()).unwrap();
      setExpDraft(null);
    });
  }, [data, expSection, dispatch]);

  const addExpItem = useCallback(() => {
    const newItem = {
      _id: uid(), id: null, title: "", company: "", location: "",
      startDate: "", endDate: "", working: false,
      employmentType: "", description: "", isNew: true,
    };
    setData((prev) => ({ ...prev, experience: [...prev.experience, newItem] }));
    if (!expSection.editing) {
      setExpDraft(deepClone(data.experience));
      expSection.startEdit(null);
    }
  }, [data, expSection]);

  const updateExpItem = useCallback((id, field, value) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const confirmRemoveExp = useCallback((localId, role, backendId) => {
    setConfirm({
      title: "Remove Experience",
      message: `Are you sure you want to remove "${role || "this role"}"?`,
      onConfirm: async () => {
        setData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e._id !== localId) }));
        if (backendId) {
          try {
            await dispatch(deleteExperienceThunk(backendId)).unwrap();
            dispatch(fetchExperiencesThunk());
          } catch {
            // Handled via toast
          }
        }
      },
    });
  }, [dispatch]);

  /* ================================================================
     EDUCATION section handlers
     ================================================================ */

  const onEditEdu = useCallback(() => {
    setEduDraft(deepClone(data.education));
    eduSection.startEdit(null);
  }, [data, eduSection]);

  const onCancelEdu = useCallback(() => {
    if (eduDraft !== null) {
      setData((prev) => ({ ...prev, education: deepClone(eduDraft) }));
    }
    setEduDraft(null);
    eduSection.cancelEdit(null);
  }, [eduDraft, eduSection]);

  const onSaveEdu = useCallback(() => {
    if (!data) return;

    // Filter out completely empty items
    const validEducations = data.education.filter((item) => {
      return (
        Boolean(item.degree?.trim()) ||
        Boolean(item.collegeName?.trim()) ||
        Boolean(item.university?.trim()) ||
        Boolean(item.grade?.trim())
      );
    });

    // Validate required fields
    for (const item of validEducations) {
      if (!item.degree?.trim()) {
        notifications.show({
          title: "Validation Error",
          message: "Degree / Program is required for all education entries.",
          color: "red",
          autoClose: 4000,
        });
        return;
      }
      if (!item.collegeName?.trim()) {
        notifications.show({
          title: "Validation Error",
          message: `College / Institution name is required for "${item.degree}".`,
          color: "red",
          autoClose: 4000,
        });
        return;
      }
    }

    eduSection.saveEdit(async () => {
      if (validEducations.length === 0 && data.education.length > 0) {
        setData((prev) => ({ ...prev, education: [] }));
        setEduDraft(null);
        return;
      }

      const promises = validEducations.map((item) => {
        const payload = {
          degree: item.degree.trim(),
          collegeName: item.collegeName.trim(),
          university: item.university?.trim() || null,
          startDate: formatDateToYYYYMMDD(item.startDate),
          endDate: formatDateToYYYYMMDD(item.endDate),
          location: item.location?.trim() || null,
          grade: item.grade?.trim() || null,
        };
        if (item.isNew || !item.id) {
          return dispatch(addEducationThunk(payload)).unwrap();
        } else {
          return dispatch(updateEducationThunk({ educationId: item.id, data: payload })).unwrap();
        }
      });

      await Promise.all(promises);
      await dispatch(fetchEducationsThunk()).unwrap();
      await dispatch(fetchMyProfileThunk()).unwrap();
      setEduDraft(null);
    });
  }, [data, eduSection, dispatch]);

  const addEduItem = useCallback(() => {
    const newItem = {
      _id: uid(), id: null, degree: "", collegeName: "", university: "",
      startDate: "", endDate: "", location: "", grade: "", isNew: true,
    };
    setData((prev) => ({ ...prev, education: [...prev.education, newItem] }));
    if (!eduSection.editing) {
      setEduDraft(deepClone(data.education));
      eduSection.startEdit(null);
    }
  }, [data, eduSection]);

  const updateEduItem = useCallback((id, field, value) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item._id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const confirmRemoveEdu = useCallback((localId, degree, backendId) => {
    setConfirm({
      title: "Remove Education",
      message: `Are you sure you want to remove "${degree || "this entry"}"?`,
      onConfirm: async () => {
        setData((prev) => ({ ...prev, education: prev.education.filter((e) => e._id !== localId) }));
        if (backendId) {
          try {
            await dispatch(deleteEducationThunk(backendId)).unwrap();
            dispatch(fetchEducationsThunk());
          } catch {
            // Handled via toast
          }
        }
      },
    });
  }, [dispatch]);

  /* ================================================================
     CERTIFICATIONS section handlers
     ================================================================ */

  const onEditCert = useCallback(() => {
    setCertDraft(deepClone(data.certifications));
    certSection.startEdit(null);
  }, [data, certSection]);

  const onCancelCert = useCallback(() => {
    if (certDraft !== null) {
      setData((prev) => ({ ...prev, certifications: deepClone(certDraft) }));
    }
    setCertDraft(null);
    certSection.cancelEdit(null);
  }, [certDraft, certSection]);

  const onSaveCert = useCallback(() => {
    if (!data) return;

    // Filter out completely empty items
    const validCertifications = data.certifications.filter((cert) => {
      return (
        Boolean(cert.title?.trim()) ||
        Boolean(cert.issuer?.trim()) ||
        Boolean(cert.certificateId?.trim()) ||
        Boolean(cert.certificateUrl?.trim())
      );
    });

    // Validate required fields
    for (const cert of validCertifications) {
      if (!cert.title?.trim()) {
        notifications.show({
          title: "Validation Error",
          message: "Certificate title is required for all certifications.",
          color: "red",
          autoClose: 4000,
        });
        return;
      }
      if (!cert.issuer?.trim()) {
        notifications.show({
          title: "Validation Error",
          message: `Issuer is required for "${cert.title}".`,
          color: "red",
          autoClose: 4000,
        });
        return;
      }
    }

    certSection.saveEdit(async () => {
      if (validCertifications.length === 0 && data.certifications.length > 0) {
        setData((prev) => ({ ...prev, certifications: [] }));
        setCertDraft(null);
        return;
      }

      const promises = validCertifications.map((cert) => {
        const payload = {
          title: cert.title.trim(),
          issuer: cert.issuer.trim(),
          issueDate: formatDateToYYYYMMDD(cert.issueDate),
          certificateId: cert.certificateId?.trim() || null,
          certificateUrl: cert.certificateUrl?.trim() || null,
        };
        if (cert.isNew || !cert.id) {
          return dispatch(addCertificationThunk(payload)).unwrap();
        } else {
          return dispatch(updateCertificationThunk({ certificationId: cert.id, data: payload })).unwrap();
        }
      });

      await Promise.all(promises);
      await dispatch(fetchCertificationsThunk()).unwrap();
      await dispatch(fetchMyProfileThunk()).unwrap();
      setCertDraft(null);
    });
  }, [data, certSection, dispatch]);

  const addCertItem = useCallback(() => {
    const newItem = {
      _id: uid(), id: null, title: "", issuer: "", issueDate: "",
      certificateId: "", certificateUrl: "", isNew: true,
    };
    setData((prev) => ({ ...prev, certifications: [...prev.certifications, newItem] }));
    if (!certSection.editing) {
      setCertDraft(deepClone(data.certifications));
      certSection.startEdit(null);
    }
  }, [data, certSection]);

  const updateCertItem = useCallback((id, field, value) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c._id === id ? { ...c, [field]: value } : c
      ),
    }));
  }, []);

  const confirmRemoveCert = useCallback((localId, title, backendId) => {
    setConfirm({
      title: "Remove Certification",
      message: `Are you sure you want to remove "${title || "this certification"}"?`,
      onConfirm: async () => {
        setData((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c._id !== localId) }));
        if (backendId) {
          try {
            await dispatch(deleteCertificationThunk(backendId)).unwrap();
            dispatch(fetchCertificationsThunk());
          } catch {
            // Handled via toast
          }
        }
      },
    });
  }, [dispatch]);

  /* ================================================================
     LANGUAGES section handlers
     ================================================================ */

  const onEditLang = useCallback(() => {
    setLangDraft(deepClone(data.languages));
    langSection.startEdit(null);
    setLangInput("");
  }, [data, langSection]);

  const onCancelLang = useCallback(() => {
    if (langDraft !== null) {
      setData((prev) => ({ ...prev, languages: deepClone(langDraft) }));
    }
    setLangDraft(null);
    setLangInput("");
    langSection.cancelEdit(null);
  }, [langDraft, langSection]);

  const onSaveLang = useCallback(async () => {
    const pendingLang = langInput.trim();
    if (pendingLang) {
      const exists = data.languages.some((l) =>
        (typeof l === "object" ? l.language ?? l.name : l) === pendingLang
      );
      if (!exists) {
        setData((prev) => ({ ...prev, languages: [...prev.languages, pendingLang] }));
        try {
          await dispatch(addLanguageThunk(pendingLang)).unwrap();
        } catch {
          // Handled via toast
        }
      }
    }
    setLangDraft(null);
    setLangInput("");
    langSection.cancelEdit(null);
    notifications.show({
      title: "Languages Saved",
      message: "Your languages have been updated.",
      color: "teal",
      autoClose: 2500,
    });
  }, [langInput, data, dispatch, langSection]);

  const addLangLocal = useCallback(() => {
    const value = langInput.trim();
    if (!value) return;
    const exists = data.languages.some((l) =>
      (typeof l === "object" ? l.language ?? l.name : l) === value
    );
    if (exists) { setLangInput(""); return; }
    setData((prev) => ({ ...prev, languages: [...prev.languages, value] }));
    setLangInput("");
    if (data) dispatch(addLanguageThunk(value));
  }, [langInput, data, dispatch]);

  const removeLangLocal = useCallback((lang) => {
    const languageValue = typeof lang === "object" ? lang.language ?? lang.name ?? lang.id : lang;
    setData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => {
        const current = typeof l === "object" ? l.language ?? l.name ?? l.id : l;
        return current !== languageValue;
      }),
    }));
    if (data) dispatch(deleteLanguageThunk(languageValue));
  }, [data, dispatch]);

  /* ── Derived display values ── */

  const availBadge = AVAILABILITY_OPTIONS.find((o) => o.value === data?.availability) ?? AVAILABILITY_OPTIONS[0];

  const bannerSrc = useMemo(() => resolveImageUrl(data?.bannerImage, "uploads"), [data?.bannerImage]);
  const avatarSrc = useMemo(() => resolveImageUrl(data?.profileImage, "uploads"), [data?.profileImage]);

  /* ── Certificate preview ── */
  const openCertPreview = useCallback((src, alt) => setCertPreview({ src, alt }), []);
  const closeCertPreview = useCallback(() => setCertPreview(null), []);

  /* ── Display data (draft takes precedence while editing) ── */
  const displayHeader = headerSection.editing ? headerDraft : data;
  const displayAbout = aboutSection.editing ? aboutDraft : data?.about;
  const displayLinks = linksSection.editing ? linksDraft : data?.socialLinks;

  /* ── Loading guard ── */
  if (isLoading && !data) return <ProfileSkeleton />;
  if (!data) return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-muted">Profile not found. Please try again.</p>
    </div>
  );

  /* ======================================================
     RENDER
     ====================================================== */

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16">

      <ConfirmModal
        opened={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.onConfirm}
        title={confirm?.title}
        message={confirm?.message}
      />

      {certPreview && (
        <CertificatePreviewModal
          src={certPreview.src}
          alt={certPreview.alt}
          onClose={closeCertPreview}
        />
      )}

      {/* ════════════════════════════════════════════════
          HEADER — Banner + Avatar + Identity
          ════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-surface shadow-[0_4px_40px_rgba(0,0,0,0.35)]">

        {/* Banner */}
        <div className="group relative h-60 md:h-72 w-full overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/20 via-violet/10 to-accent/15">
          {(!bannerSrc || bannerError) && (
            <BannerPlaceholder onClick={() => bannerInputRef.current?.click()} />
          )}
          {bannerSrc && !bannerError && (
            <img
              src={bannerSrc}
              alt={`${data.name || "Profile"} banner`}
              onError={() => {
                setBannerError(true);
              }}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              style={{ imageOrientation: "from-image" }}
              loading="eager"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface/70 via-transparent to-transparent pointer-events-none" />
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            aria-label="Change banner image"
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/50 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200 hover:bg-black/70 hover:border-white/40 shadow-sm"
          >
            <IconCamera size={14} />
            {bannerSrc && !bannerError ? "Change banner" : "Upload banner"}
          </button>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerSelect} aria-label="Upload banner image" />
        </div>

        {/* Avatar + Identity row */}
        <div className="px-5 sm:px-7 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16">

            {/* Avatar */}
            <div className="group relative w-fit">
              <div className="h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl border-[3px] border-surface bg-surface-elevated shadow-[0_8px_32px_rgba(0,0,0,0.45)] flex items-center justify-center">
                {avatarSrc && !avatarError ? (
                  <img
                    src={avatarSrc}
                    alt={`${data.name || "User"} profile photo`}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.06]"
                    style={{ imageOrientation: "from-image" }}
                    loading="eager"
                    decoding="async"
                    onError={() => {
                      setAvatarError(true);
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-violet/20">
                    <IconUser size={44} className="text-indigo-600 dark:text-indigo-400" stroke={1.5} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Change profile photo"
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200 text-white text-xs font-medium gap-1.5 backdrop-blur-[2px]"
              >
                <IconCamera size={20} stroke={1.8} />
                <span className="text-[10px] tracking-wide font-semibold">Change</span>
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} aria-label="Upload profile photo" />
            </div>

            {/* Availability badge + Header action buttons */}
            <div className="flex items-center gap-2 sm:mb-1">
              {!headerSection.editing && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${availBadge.color}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {
                    
                    AVAILABILITY_OPTIONS.find(
                      (option) => option.value === data.availability
                    )?.label || data.availability
                  }
                </span>
              )}
              <ActionButtons
                editing={headerSection.editing}
                saving={headerSection.saving}
                onEdit={onEditHeader}
                onSave={onSaveHeader}
                onCancel={onCancelHeader}
              />
            </div>
          </div>

          {/* Identity fields / view */}
          <div className="mt-4">
            {headerSection.editing && headerDraft ? (
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Full Name" required>
                    <input className={inputCls} value={headerDraft.name} placeholder="e.g. Yash Lodam"
                      onChange={(e) => setHeaderDraft((p) => ({ ...p, name: e.target.value }))} />
                  </Field>
                  <Field label="Location">
                    <input className={inputCls} value={headerDraft.location} placeholder="e.g. Pune, India"
                      onChange={(e) => setHeaderDraft((p) => ({ ...p, location: e.target.value }))} />
                  </Field>
                  <Field label="Current Role">
                    <input className={inputCls} value={headerDraft.jobTitle} placeholder="e.g. Software Developer"
                      onChange={(e) => setHeaderDraft((p) => ({ ...p, jobTitle: e.target.value }))} />
                  </Field>
                  <Field label="Company">
                    <input className={inputCls} value={headerDraft.company} placeholder="e.g. Google"
                      onChange={(e) => setHeaderDraft((p) => ({ ...p, company: e.target.value }))} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Availability">
                    <select
                      className={inputCls}
                      value={headerDraft.availability}
                      onChange={(e) =>
                        setHeaderDraft((p) => ({
                          ...p,
                          availability: e.target.value,
                        }))
                      }
                    >
                      {AVAILABILITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="text-black">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Experience Level">
                    <select
                      className={inputCls}
                      value={headerDraft.experienceLevel ?? ""}
                      onChange={(e) =>
                        setHeaderDraft((p) => ({
                          ...p,
                          experienceLevel: e.target.value,
                        }))
                      }
                    >
                      <option value="" className="text-black">Select level</option>
                      {EXPERIENCE_LEVELS.map((l) => (
                        <option key={l.value} value={l.value} className="text-black">
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-satoshi text-2xl sm:text-3xl font-bold tracking-tight text-heading">
                  {data.name || <span className="text-muted font-normal italic">Add your name</span>}
                </h1>
                {(data.jobTitle || data.company) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-body">
                    <IconBriefcase size={15} className="shrink-0 text-muted" />
                    {data.jobTitle && <span className="font-medium">{data.jobTitle}</span>}
                    {data.jobTitle && data.company && <span className="text-muted">at</span>}
                    {data.company && <span className="font-semibold text-indigo-600 dark:text-indigo-400">{data.company}</span>}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                  {data.location && (
                    <span className="flex items-center gap-1">
                      <IconMapPin size={14} />
                      {data.location}
                    </span>
                  )}

                  {data.experienceLevel && (
                    <span className="flex items-center gap-1">
                      <IconStar size={14} />
                      {EXPERIENCE_LEVELS.find((l) => l.value === data.experienceLevel)?.label ?? data.experienceLevel}
                    </span>
                  )}

                  {data.jobType && (
                    <span className="flex items-center gap-1">
                      <IconBriefcase size={14} />
                      {JOB_TYPES.find((j) => j.value === data.jobType)?.label ?? data.jobType}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          SOCIAL LINKS
          ════════════════════════════════════════════════ */}
      <Section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionHeadingCls}>Links</h2>
          <ActionButtons
            editing={linksSection.editing}
            saving={linksSection.saving}
            onEdit={onEditLinks}
            onSave={onSaveLinks}
            onCancel={onCancelLinks}
          />
        </div>

        {linksSection.editing && linksDraft ? (
          <div className="space-y-3 max-w-lg">
            <Field label="LinkedIn">
              <div className="relative">
                <IconBrandLinkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input className={`${inputCls} pl-9`} value={linksDraft.linkedin ?? ""} placeholder="https://linkedin.com/in/username"
                  onChange={(e) => setLinksDraft((p) => ({ ...p, linkedin: e.target.value }))} />
              </div>
            </Field>
            <Field label="GitHub">
              <div className="relative">
                <IconBrandGithub size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input className={`${inputCls} pl-9`} value={linksDraft.github ?? ""} placeholder="https://github.com/username"
                  onChange={(e) => setLinksDraft((p) => ({ ...p, github: e.target.value }))} />
              </div>
            </Field>
            <Field label="Portfolio / Website">
              <div className="relative">
                <IconGlobe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input className={`${inputCls} pl-9`} value={linksDraft.portfolio ?? ""} placeholder="https://yourwebsite.com"
                  onChange={(e) => setLinksDraft((p) => ({ ...p, portfolio: e.target.value }))} />
              </div>
            </Field>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {data.socialLinks.linkedin && (
              <a href={data.socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="Visit LinkedIn profile (opens in new tab)"
                className="group inline-flex items-center gap-2 rounded-full border border-[#0A66C2]/30 bg-[#0A66C2]/10 px-4 py-2 text-sm font-medium text-[#70B5F9] hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/20 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(10,102,194,0.25)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#0A66C2]/50">
                <IconBrandLinkedin size={16} className="text-[#0A66C2]" />
                LinkedIn
                <IconExternalLink size={12} className="text-[#70B5F9]/60 group-hover:text-[#70B5F9]" />
              </a>
            )}
            {data.socialLinks.github && (
              <a href={data.socialLinks.github} target="_blank" rel="noreferrer" aria-label="Visit GitHub profile (opens in new tab)"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-heading hover:border-white/30 hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.08)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/30">
                <IconBrandGithub size={16} className="text-white" />
                GitHub
                <IconExternalLink size={12} className="text-muted group-hover:text-body" />
              </a>
            )}
            {data.socialLinks.portfolio && (
              <a href={data.socialLinks.portfolio} target="_blank" rel="noreferrer" aria-label="Visit portfolio website (opens in new tab)"
                className="group inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-light hover:border-accent/50 hover:bg-accent/20 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(6,182,212,0.2)] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent/50">
                <IconGlobe size={16} className="text-accent" />
                Portfolio
                <IconExternalLink size={12} className="text-accent-light/60 group-hover:text-accent-light" />
              </a>
            )}
            {!data.socialLinks.linkedin && !data.socialLinks.github && !data.socialLinks.portfolio && (
              <EmptyState text="No links added yet. Click the pencil to add your profiles." />
            )}
          </div>
        )}
      </Section>

      {/* ════════════════════════════════════════════════
          ABOUT
          ════════════════════════════════════════════════ */}
      <Section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionHeadingCls}>About</h2>
          <ActionButtons
            editing={aboutSection.editing}
            saving={aboutSection.saving}
            onEdit={onEditAbout}
            onSave={onSaveAbout}
            onCancel={onCancelAbout}
          />
        </div>
        {aboutSection.editing ? (
          <Field label="Bio">
            <textarea
              className={textareaCls}
              rows={5}
              value={aboutDraft ?? ""}
              placeholder="Tell people about your experience, what you're looking for, and what makes you unique."
              onChange={(e) => setAboutDraft(e.target.value)}
            />
          </Field>
        ) : data.about ? (
          <p className="text-sm leading-7 text-body sm:text-[15px] whitespace-pre-line">{data.about}</p>
        ) : (
          <EmptyState text="You haven't added a bio yet. Click the pencil to introduce yourself." />
        )}
      </Section>

      {/* ════════════════════════════════════════════════
          SKILLS
          ════════════════════════════════════════════════ */}
      <Section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionHeadingCls}>Skills</h2>
          <ActionButtons
            editing={skillsSection.editing}
            saving={skillsSection.saving}
            onEdit={onEditSkills}
            onSave={onSaveSkills}
            onCancel={onCancelSkills}
          />
        </div>

        {data.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => {
              const label = typeof skill === "object" ? skill.name ?? skill.skill : skill;
              const key = typeof skill === "object" ? skill.id ?? skill.skill : skill;
              return (
                <span key={key} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 transition-all duration-300 hover:border-indigo-300 dark:hover:border-primary/40 hover:bg-indigo-100 dark:hover:bg-primary/15">
                  {label}
                  {skillsSection.editing && (
                    <button type="button" aria-label={`Remove ${label}`} onClick={() => removeSkillLocal(skill)}
                      className="ml-0.5 rounded text-indigo-500/80 dark:text-indigo-400/80 hover:text-danger transition-colors">
                      <IconX size={13} />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          !skillsSection.editing && <EmptyState text="No skills added yet. Click the pencil to add what you're good at." />
        )}

        {skillsSection.editing && (
          <div className="mt-4 max-w-sm">
            <Field label="Add a skill">
              <div className="flex gap-2">
                <input
                  className={inputCls}
                  placeholder="e.g. Figma, React, SQL"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillLocal(); } }}
                />
                <ActionIcon variant="light" radius="xl" size="lg" aria-label="Add skill"
                  className="!bg-indigo-50 dark:!bg-primary/10 hover:!bg-indigo-100 dark:hover:!bg-primary/20 border border-indigo-200 dark:border-primary/20 shrink-0" onClick={addSkillLocal}>
                  <IconPlus size={18} className="text-indigo-600 dark:text-indigo-400" />
                </ActionIcon>
              </div>
            </Field>
          </div>
        )}
      </Section>

      {/* ════════════════════════════════════════════════
          EXPERIENCE
          ════════════════════════════════════════════════ */}
      <Section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionHeadingCls}>Experience</h2>
          <ActionButtons
            editing={expSection.editing}
            saving={expSection.saving}
            onEdit={onEditExp}
            onSave={onSaveExp}
            onCancel={onCancelExp}
            hasAddButton
            onAdd={addExpItem}
            addLabel="Add experience"
          />
        </div>

        {data.experience.length === 0 && <EmptyState text="No experience added yet. Click + to add your first role." />}

        <div className="space-y-6">
          {data.experience.map((item) => (
          <div key={item._id} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated">
                {item.logo
                  ? <img src={item.logo} alt={item.company} className="h-8 w-8 object-contain" loading="lazy" />
                  : <IconBriefcase size={20} className="text-muted" />}
              </div>
              <div className="flex-1 min-w-0">
                {expSection.editing ? (
                  <div className="space-y-3 rounded-xl border border-white/[0.06] bg-surface-elevated/40 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Edit Entry</p>
                      <DeleteButton onClick={() => confirmRemoveExp(item._id, item.title, item.id)} label="Remove experience" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Role">
                        <input className={inputCls} value={item.title ?? ""} placeholder="e.g. Software Engineer"
                          onChange={(e) => updateExpItem(item._id, "title", e.target.value)} />
                      </Field>
                      <Field label="Company">
                        <input className={inputCls} value={item.company ?? ""} placeholder="e.g. Google"
                          onChange={(e) => updateExpItem(item._id, "company", e.target.value)} />
                      </Field>
                      <Field label="Start Date" required>
                        <MonthPickerInput
                          value={item.startDate ? dayjs(item.startDate).toDate() : null}
                          valueFormat="MMM YYYY"
                          placeholder="Select month"
                          clearable
                          onChange={(v) =>
                            updateExpItem(item._id, "startDate", formatDateToYYYYMMDD(v) || "")
                          }
                        />
                      </Field>
                      <Field label="End Date">
                        <MonthPickerInput
                          value={item.endDate ? dayjs(item.endDate).toDate() : null}
                          valueFormat="MMM YYYY"
                          placeholder="Present"
                          clearable
                          onChange={(v) =>
                            updateExpItem(item._id, "endDate", formatDateToYYYYMMDD(v) || "")
                          }
                        />
                      </Field>
                      <Field label="Employment Type">
                        <select className={inputCls} value={item.employmentType ?? ""}
                          onChange={(e) => updateExpItem(item._id, "employmentType", e.target.value)}>
                          <option value="" className="text-black">Select type</option>
                          {JOB_TYPES.map((t) => <option key={t.value} value={t.value} className="text-black">{t.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Location">
                        <input className={inputCls} value={item.location ?? ""} placeholder="e.g. Remote"
                          onChange={(e) => updateExpItem(item._id, "location", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Description">
                      <textarea className={textareaCls} rows={3} value={item.description ?? ""}
                        placeholder="What did you work on? What did you ship or improve?"
                        onChange={(e) => updateExpItem(item._id, "description", e.target.value)} />
                    </Field>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-satoshi text-base font-semibold text-heading sm:text-lg leading-snug">
                          {item.title || "Untitled role"}
                        </h3>
                        <p className="mt-0.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{item.company}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-muted bg-surface-elevated border border-white/[0.06] rounded-lg px-2.5 py-1">
                        {item.startDate ? dayjs(item.startDate).format("MMM YYYY") : "Start"} — {item.endDate ? dayjs(item.endDate).format("MMM YYYY") : "Present"}
                      </span>
                    </div>
                    {(item.employmentType || item.location) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                        {item.employmentType && <span className="rounded-full border border-white/10 px-2 py-0.5">{JOB_TYPES.find((t) => t.value === item.employmentType)?.label ?? item.employmentType}</span>}
                        {item.location && <span className="flex items-center gap-1"><IconMapPin size={12} />{item.location}</span>}
                      </div>
                    )}
                    {item.description && <p className="mt-2.5 text-sm leading-6 text-body">{item.description}</p>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          EDUCATION
          ════════════════════════════════════════════════ */}
      <Section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionHeadingCls}>Education</h2>
          <ActionButtons
            editing={eduSection.editing}
            saving={eduSection.saving}
            onEdit={onEditEdu}
            onSave={onSaveEdu}
            onCancel={onCancelEdu}
            hasAddButton
            onAdd={addEduItem}
            addLabel="Add education"
          />
        </div>

        {data.education.length === 0 && <EmptyState text="No education added yet. Click + to add your first degree." />}

        <div className="space-y-6">
          {data.education.map((item) => (
            <div key={item._id} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-indigo-400">
                <IconSchool size={22} stroke={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                {eduSection.editing ? (
                  <div className="space-y-3 rounded-xl border border-white/[0.06] bg-surface-elevated/40 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Edit Entry</p>
                      <DeleteButton onClick={() => confirmRemoveEdu(item._id, item.degree, item.id)} label="Remove education" />
                    </div>
                    <Field label="Degree / Program">
                      <input className={inputCls} value={item.degree ?? ""} placeholder="e.g. B.E. Computer Engineering"
                        onChange={(e) => updateEduItem(item._id, "degree", e.target.value)} />
                    </Field>
                    <Field label="College / Institution">
                      <input className={inputCls} value={item.collegeName ?? ""} placeholder="e.g. GNSC Engineering"
                        onChange={(e) => updateEduItem(item._id, "collegeName", e.target.value)} />
                    </Field>
                    <Field label="University / Board">
                      <input className={inputCls} value={item.university ?? ""} placeholder="e.g. Savitribai Phule Pune University"
                        onChange={(e) => updateEduItem(item._id, "university", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <Field label="Start Date">
                        <MonthPickerInput
                          value={item.startDate ? dayjs(item.startDate).toDate() : null}
                          valueFormat="MMM YYYY"
                          placeholder="Select month"
                          clearable
                          onChange={(v) =>
                            updateEduItem(item._id, "startDate", formatDateToYYYYMMDD(v) || "")
                          }
                        />
                      </Field>
                      <Field label="End Date">
                        <MonthPickerInput
                          value={item.endDate ? dayjs(item.endDate).toDate() : null}
                          valueFormat="MMM YYYY"
                          placeholder="Present"
                          clearable
                          onChange={(v) =>
                            updateEduItem(item._id, "endDate", formatDateToYYYYMMDD(v) || "")
                          }
                        />
                      </Field>
                      <Field label="Location">
                        <input className={inputCls} value={item.location ?? ""} placeholder="e.g. Pune"
                          onChange={(e) => updateEduItem(item._id, "location", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Grade / CGPA">
                      <input className={inputCls} value={item.grade ?? ""} placeholder="e.g. 8.5 CGPA"
                        onChange={(e) => updateEduItem(item._id, "grade", e.target.value)} />
                    </Field>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-satoshi text-base font-semibold text-heading sm:text-lg leading-snug">
                          {item.degree || "Untitled degree"}
                        </h3>
                        <p className="mt-0.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{item.collegeName}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-muted bg-surface-elevated border border-white/[0.06] rounded-lg px-2.5 py-1">
                        {item.startDate ? dayjs(item.startDate).format("MMM YYYY") : ""} {item.endDate ? `— ${dayjs(item.endDate).format("MMM YYYY")}` : item.startDate ? "— Present" : ""}
                      </span>
                    </div>
                    {item.university && <p className="mt-1 text-sm text-body">{item.university}</p>}
                    {item.grade && <p className="mt-0.5 text-xs text-muted">Grade: {item.grade}</p>}
                    {item.location && (
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                        <IconMapPin size={12} /><span>{item.location}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          CERTIFICATIONS
          ════════════════════════════════════════════════ */}
      <Section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionHeadingCls}>Certifications</h2>
          <ActionButtons
            editing={certSection.editing}
            saving={certSection.saving}
            onEdit={onEditCert}
            onSave={onSaveCert}
            onCancel={onCancelCert}
            hasAddButton
            onAdd={addCertItem}
            addLabel="Add certification"
          />
        </div>

        {data.certifications.length === 0 && <EmptyState text="No certifications added yet. Click + to add one." />}

        <div className="space-y-5">
          {data.certifications.map((cert) => (
            <div key={cert._id} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent-warm/20 bg-accent-warm/10 text-accent-warm-light">
                <IconCertificate size={22} stroke={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                {certSection.editing ? (
                  <div className="space-y-3 rounded-xl border border-white/[0.06] bg-surface-elevated/40 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Edit Entry</p>
                      <DeleteButton onClick={() => confirmRemoveCert(cert._id, cert.title, cert.id)} label="Remove certification" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Certificate Title">
                        <input className={inputCls} value={cert.title ?? ""} placeholder="e.g. AWS Solutions Architect"
                          onChange={(e) => updateCertItem(cert._id, "title", e.target.value)} />
                      </Field>
                      <Field label="Issuer">
                        <input className={inputCls} value={cert.issuer ?? ""} placeholder="e.g. Amazon Web Services"
                          onChange={(e) => updateCertItem(cert._id, "issuer", e.target.value)} />
                      </Field>
                      <Field label="Issue Date">
                        <MonthPickerInput
                          value={cert.issueDate ? dayjs(cert.issueDate).toDate() : null}
                          valueFormat="MMM YYYY"
                          placeholder="Select month"
                          clearable
                          onChange={(v) =>
                            updateCertItem(cert._id, "issueDate", formatDateToYYYYMMDD(v) || "")
                          }
                        />
                      </Field>
                      <Field label="Certificate ID">
                        <input className={inputCls} value={cert.certificateId ?? ""} placeholder="e.g. AWS-SAA-2025"
                          onChange={(e) => updateCertItem(cert._id, "certificateId", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Certificate URL">
                      <input className={inputCls} value={cert.certificateUrl ?? ""} placeholder="https://..."
                        onChange={(e) => updateCertItem(cert._id, "certificateUrl", e.target.value)} />
                    </Field>
                    {cert.imageUrl && (
                      <div className="mt-2">
                        <p className={labelCls}>Certificate Image Preview</p>
                        <CertificateImageCard
                          src={resolveImageUrl(cert.imageUrl, "uploads/certificates")}
                          alt={cert.title || "Certificate"}
                          onOpenPreview={openCertPreview}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-satoshi text-base font-semibold text-heading sm:text-lg leading-snug">
                          {cert.title || "Untitled certificate"}
                        </h3>
                        <p className="mt-0.5 text-sm font-medium text-accent-warm-light">{cert.issuer}</p>
                      </div>
                      {cert.issueDate && (
                        <span className="shrink-0 text-xs font-medium text-muted bg-surface-elevated border border-white/[0.06] rounded-lg px-2.5 py-1">
                          Issued {dayjs(cert.issueDate).isValid() ? dayjs(cert.issueDate).format("MMM YYYY") : cert.issueDate}
                        </span>
                      )}
                    </div>
                    {cert.certificateId && <p className="mt-1.5 text-xs text-muted font-mono">ID: {cert.certificateId}</p>}
                    {cert.certificateUrl && (
                      <a href={cert.certificateUrl} target="_blank" rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                        aria-label={`View credential for ${cert.title} (opens in new tab)`}>
                        Show credential
                        <IconExternalLink size={14} stroke={1.8} />
                      </a>
                    )}
                    {cert.imageUrl && (
                      <div className="mt-4">
                        <CertificateImageCard
                          src={resolveImageUrl(cert.imageUrl, "uploads/certificates")}
                          alt={cert.title || "Certificate image"}
                          onOpenPreview={openCertPreview}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════
          LANGUAGES
          ════════════════════════════════════════════════ */}
      <Section>
        <div className="flex items-center justify-between mb-4">
          <h2 className={sectionHeadingCls}>Languages</h2>
          <ActionButtons
            editing={langSection.editing}
            saving={langSection.saving}
            onEdit={onEditLang}
            onSave={onSaveLang}
            onCancel={onCancelLang}
          />
        </div>

        {data.languages.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.languages.map((lang) => {
              const label = typeof lang === "object" ? lang.language ?? lang.name : lang;
              const key = typeof lang === "object" ? lang.id : lang;
              return (
                <span key={key} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm font-medium text-body transition-all duration-200 hover:border-white/20">
                  <IconLanguage size={14} className="text-muted" />
                  {label}
                  {langSection.editing && (
                    <button type="button" aria-label={`Remove ${label}`} onClick={() => removeLangLocal(lang)}
                      className="ml-0.5 rounded text-muted hover:text-danger transition-colors">
                      <IconX size={13} />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        ) : (
          !langSection.editing && <EmptyState text="No languages added. Click the pencil to add the languages you speak." />
        )}

        {langSection.editing && (
          <div className="mt-4 max-w-sm">
            <Field label="Add a language">
              <div className="flex gap-2">
                <input
                  className={inputCls}
                  placeholder="e.g. English, Hindi"
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLangLocal(); } }}
                />
                <ActionIcon variant="light" radius="xl" size="lg" aria-label="Add language"
                  className="!bg-white/5 hover:!bg-white/10 border border-white/10 shrink-0" onClick={addLangLocal}>
                  <IconPlus size={18} className="text-slate-400" />
                </ActionIcon>
              </div>
            </Field>
          </div>
        )}
      </Section>


      {/* ════════════════════════════════════════════════
    RESUME
════════════════════════════════════════════════ */}
<Section>
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className={sectionHeadingCls}>Resumes</h2>
      <p className="text-xs text-muted mt-0.5">Manage your application resumes. Set a default resume for 1-click job applications.</p>
    </div>

    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        ref={resumeInputRef}
        className="hidden"
        onChange={handleResumeUpload}
      />

      <button
        type="button"
        disabled={uploadLoading}
        onClick={() => resumeInputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition cursor-pointer disabled:opacity-50"
      >
        <IconPlus size={16} />
        {uploadLoading ? "Uploading..." : "Upload New Resume"}
      </button>
    </div>
  </div>

  {resumes && resumes.length > 0 ? (
    <div className="space-y-3">
      {resumes.map((res) => {
        const fileUrl = resolveImageUrl(res.resumeUrl, "uploads");

        return (
          <div
            key={res.id}
            className={`rounded-2xl border p-4 transition-all duration-200 ${
              res.isDefault
                ? "border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/5"
                : "border-white/10 bg-surface-elevated hover:border-white/20"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                  <IconFileCv size={24} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h3 className="font-semibold text-heading truncate max-w-[200px] sm:max-w-xs">{res.resumeName || res.fileName || "Resume.pdf"}</h3>
                    {res.isDefault && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        ✓ Default Resume
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Uploaded {res.createdAt ? new Date(res.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap pt-2 sm:pt-0 border-t border-white/5 sm:border-0 w-full sm:w-auto justify-end">
                {!res.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefaultResume(res.id)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    Make Default
                  </button>
                )}

                {fileUrl && (
                  <>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                      title="View Resume"
                    >
                      <IconEye size={16} />
                    </a>

                    <a
                      href={fileUrl}
                      download
                      className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition"
                      title="Download Resume"
                    >
                      <IconDownload size={16} />
                    </a>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteResume(res.id)}
                  className="rounded-lg border border-rose-500/30 p-2 text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Delete Resume"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="rounded-2xl border-2 border-dashed border-border py-10 text-center">
      <IconFileCv size={42} className="mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
      <h3 className="font-semibold text-heading">No Resumes Uploaded</h3>
      <p className="mt-1 text-sm text-muted">Upload your resume to apply for open positions with 1 click.</p>
      <button
        type="button"
        onClick={() => resumeInputRef.current?.click()}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition cursor-pointer"
      >
        <IconPlus size={16} /> Upload Resume
      </button>
    </div>
  )}
</Section>

    </div>
  );
}

export default Profile;