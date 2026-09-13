import { Divider } from "@mantine/core";
import {
  IconBriefcase,
  IconCertificate,
  IconExternalLink,
  IconMapPin,
  IconMessage,
  IconSchool,
  IconDownload,
  IconFileText,
  IconMail,
  IconClock,
  IconAward,
} from "@tabler/icons-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrGetConversationApi, resolveCandidateUserId } from "../../api/chatApi";
import { useToast } from "../../components/ui/ToastNotification";
import { resolveImageUrl } from "../../utils/assetUtils";

function Profile(profile) {
  const navigate = useNavigate();
  const toast = useToast();
  const [messaging, setMessaging] = useState(false);

  const handleMessage = async () => {
    setMessaging(true);
    try {
      const candidateUserId = await resolveCandidateUserId(profile);
      if (!candidateUserId) {
        toast.error("Could not find candidate user account to start conversation.");
        return;
      }
      const conv = await createOrGetConversationApi(candidateUserId);
      const convId = conv?.id;
      if (convId) {
        toast.success(`Opening conversation with ${profile.name || "candidate"}…`);
        navigate(`/recruiter/messages?convId=${convId}`);
      } else {
        navigate("/recruiter/messages");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to start conversation. Please try again.");
    } finally {
      setMessaging(false);
    }
  };

  const experiences = profile.experiences || profile.experience || [];
  const educations = profile.educations || profile.education || [];
  const certifications = profile.certifications || [];
  const skills = profile.skills || [];

  return (
    <div className="w-full">

      {/* Banner + Profile Image */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 sm:h-64 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950">
          {profile.bannerImage ? (
            <img
              src={resolveImageUrl(profile.bannerImage, "uploads")}
              alt="Profile banner"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full opacity-40 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
          )}
        </div>

        {/* Profile Image */}
        <div className="absolute -bottom-16 sm:-bottom-20 left-6 sm:left-8">
          <div
            className="
              h-32 w-32
              sm:h-44 sm:w-44
              overflow-hidden
              rounded-full
              border-[4px] sm:border-[5px]
              border-background
              bg-surface
              shadow-[0_12px_40px_rgba(0,0,0,0.4)]
            "
          >
            <img
              src={resolveImageUrl(profile.profileImage, "uploads", "/profile.png")}
              alt={profile.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
              }}
            />
          </div>
        </div>
      </div>

      {/* Space for Profile Image */}
      <div className="h-20 sm:h-24" />

      {/* Profile Information */}
      <div className="px-2 sm:px-4">
        {/* Name + Badges + Buttons */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-satoshi text-2xl font-black tracking-tight text-heading sm:text-3xl">
              {profile.name}
            </h1>
            <p className="mt-1 text-sm font-semibold text-indigo-400">
              {profile.email}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition"
              >
                <IconDownload size={16} />
                <span>{profile.resumeName || "Resume"}</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleMessage}
              disabled={messaging}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-5
                text-xs
                font-bold
                text-white
                shadow-button
                transition-all
                duration-300
                hover:bg-primary-hover
                cursor-pointer
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              <IconMessage size={16} />
              {messaging ? "Opening Chat…" : "Message Candidate"}
            </button>
          </div>
        </div>

        {/* Role + Company */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-body sm:text-base font-satoshi">
          <IconBriefcase size={18} className="shrink-0 text-muted" />
          <span className="font-bold text-heading">{profile.role}</span>
          <span className="text-muted">•</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.company}</span>
        </div>

        {/* Location & Availability Badges */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-muted font-medium">
            <IconMapPin size={16} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
            <span>{profile.location}</span>
          </div>

          {profile.availability && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {profile.availability}
            </span>
          )}

          {profile.experienceLevel && (
            <span className="inline-flex items-center rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-300">
              {profile.experienceLevel}
            </span>
          )}
        </div>
      </div>

      <Divider size="xs" my="xl" color="var(--color-border, rgba(148, 163, 184, 0.15))" />

      {/* About Section */}
      <section>
        <h2 className="font-satoshi text-xl font-bold tracking-tight text-heading sm:text-2xl">
          About
        </h2>
        {profile.about ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-body sm:text-[15px]">
            {profile.about}
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted italic">No summary description provided yet.</p>
        )}
      </section>

      <Divider size="xs" my="xl" color="var(--color-border, rgba(148, 163, 184, 0.15))" />

      {/* Skills Section */}
      <section>
        <h2 className="font-satoshi text-xl font-bold tracking-tight text-heading sm:text-2xl">
          Skills & Expertise
        </h2>
        {skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2.5">
            {skills.map((skill) => (
              <span
                key={typeof skill === "string" ? skill : skill.name || skill.id}
                className="
                  inline-flex
                  items-center
                  rounded-lg
                  border
                  border-indigo-200 dark:border-primary/20
                  bg-indigo-50 dark:bg-primary/10
                  px-3.5
                  py-1.5
                  text-xs sm:text-sm
                  font-semibold
                  text-indigo-700 dark:text-indigo-300
                "
              >
                {typeof skill === "string" ? skill : skill.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted italic">No skills added yet.</p>
        )}
      </section>

      <Divider size="xs" my="xl" color="var(--color-border, rgba(148, 163, 184, 0.15))" />

      {/* Experience Section */}
      <section>
        <h2 className="font-satoshi text-xl font-bold tracking-tight text-heading sm:text-2xl mb-4">
          Work Experience
        </h2>
        {experiences.length > 0 ? (
          <div className="space-y-6">
            {experiences.map((item, index) => (
              <div key={item.id || index} className="flex gap-4 p-4 rounded-xl border border-border bg-surface">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated p-2">
                  <IconBriefcase size={20} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-satoshi text-base font-bold text-heading">
                        {item.role || item.jobTitle || item.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.company || item.companyName}
                      </p>
                    </div>
                    <span className="text-xs text-muted">
                      {item.startDate || item.startYear} — {item.endDate || item.endYear || "Present"}
                    </span>
                  </div>
                  {item.location && (
                    <p className="mt-1 text-xs text-muted">{item.location}</p>
                  )}
                  {item.description && (
                    <p className="mt-2 text-xs leading-5 text-body">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted italic">No work experience listed yet.</p>
        )}
      </section>

      <Divider size="xs" my="xl" color="var(--color-border, rgba(148, 163, 184, 0.15))" />

      {/* Education Section */}
      <section>
        <h2 className="font-satoshi text-xl font-bold tracking-tight text-heading sm:text-2xl mb-4">
          Education
        </h2>
        {educations.length > 0 ? (
          <div className="space-y-6">
            {educations.map((item, index) => (
              <div key={item.id || index} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-indigo-400">
                  <IconSchool size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-satoshi text-base font-bold text-heading">
                        {item.degree || item.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.institution || item.college || item.school}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      {item.startYear} — {item.endYear || "Present"}
                    </span>
                  </div>
                  {item.location && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted">
                      <IconMapPin size={14} />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted italic">No education listed yet.</p>
        )}
      </section>

      <Divider size="xs" my="xl" color="var(--color-border, rgba(148, 163, 184, 0.15))" />

      {/* Certifications Section */}
      <section>
        <h2 className="font-satoshi text-xl font-bold tracking-tight text-heading sm:text-2xl mb-4">
          Certifications
        </h2>
        {certifications.length > 0 ? (
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <div key={cert.id || index} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-surface">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-200 dark:border-primary/20 bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-indigo-400">
                  <IconCertificate size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-satoshi text-base font-bold text-heading">
                        {cert.name || cert.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {cert.issuer || cert.organization}
                      </p>
                    </div>
                    {cert.issueDate && (
                      <span className="shrink-0 text-xs text-muted">{cert.issueDate}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted italic">No certifications listed yet.</p>
        )}
      </section>

    </div>
  );
}

export default Profile;