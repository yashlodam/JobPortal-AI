import React, { useState } from "react";
import {
  IconHeart,
  IconMapPin,
  IconMessage,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { createOrGetConversationApi, resolveCandidateUserId } from "../../api/chatApi";
import { useToast } from "../../components/ui/ToastNotification";
import { getAssetUrl } from "../../utils/assetUtils";

const getFullImageUrl = (rawPath) => {
  if (!rawPath) return null;
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) return rawPath;
  const cleanPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
  if (cleanPath.startsWith("uploads/")) return getAssetUrl(cleanPath);
  return getAssetUrl(`uploads/${cleanPath}`);
};

function AvailabilityBadge({ type }) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 font-satoshi">
      {type ? String(type).replace(/_/g, " ") : "OPEN TO WORK"}
    </span>
  );
}

function ExperienceBadge({ level }) {
  return (
    <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 font-satoshi">
      {level ? String(level).replace(/_/g, " ") : "MID LEVEL"}
    </span>
  );
}

function TalentCard({ talent: customTalent }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [messaging, setMessaging] = useState(false);

  if (!customTalent) return null;

  const talent = {
    id: customTalent.id,
    userId: customTalent.userId || customTalent.user?.id || customTalent.id,
    name: customTalent.name || customTalent.fullName || "Candidate",
    role: customTalent.headline || customTalent.role || customTalent.title || customTalent.professionalTitle || "Software Specialist",
    company: customTalent.currentCompany || customTalent.company || "Independent",
    location: customTalent.location || (customTalent.city ? `${customTalent.city}, ${customTalent.country || ''}` : "Remote"),
    availability: customTalent.availability ? customTalent.availability.replace(/_/g, " ") : "OPEN TO WORK",
    experienceLevel: customTalent.experienceLevel ? customTalent.experienceLevel.replace(/_/g, " ") : "MID LEVEL",
    profileImage: getFullImageUrl(customTalent.profileImage || customTalent.avatar),
    skills: Array.isArray(customTalent.skills) ? customTalent.skills : [],
    about: customTalent.about || customTalent.bio || "",
    raw: customTalent,
  };

  const handleMessage = async (e) => {
    e.stopPropagation();
    setMessaging(true);
    try {
      const candidateUserId = await resolveCandidateUserId(customTalent);
      if (!candidateUserId) {
        toast.error("Could not find candidate user account to start conversation.");
        return;
      }
      const conv = await createOrGetConversationApi(candidateUserId);
      const convId = conv?.id;
      if (convId) {
        toast.success(`Opening conversation with ${talent.name}…`);
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

  const initials = talent.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      className="
        group
        w-full
        rounded-2xl
        border
        border-border
        bg-surface
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-indigo-500/40
        hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)]
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Profile */}
        <div className="flex min-w-0 items-center gap-3.5">
          {/* Avatar */}
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-indigo-500/20 bg-surface-elevated">
            {talent.profileImage ? (
              <img
                src={talent.profileImage}
                alt={talent.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 font-black text-white text-base">
                {initials}
              </div>
            )}
          </div>

          {/* Name & Role */}
          <div className="min-w-0">
            <h3 className="truncate font-satoshi text-base font-bold text-heading">
              {talent.name}
            </h3>
            <p className="truncate font-satoshi text-xs font-semibold text-indigo-600 dark:text-indigo-300 mt-0.5">
              {talent.role}
            </p>
            {talent.company && (
              <p className="truncate font-satoshi text-[11px] text-muted mt-0.5">
                {talent.company}
              </p>
            )}
          </div>
        </div>

        {/* Favorite Icon */}
        <button
          type="button"
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-border
            bg-surface-elevated
            text-muted
            transition-all
            hover:border-rose-500/30
            hover:bg-rose-500/10
            hover:text-rose-500
            cursor-pointer
          "
        >
          <IconHeart size={16} />
        </button>
      </div>

      {/* About */}
      {talent.about && (
        <p className="mt-3 line-clamp-2 font-satoshi text-xs text-body font-normal leading-relaxed">
          {talent.about}
        </p>
      )}

      {/* Skills */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {talent.skills.slice(0, 4).map((skill, index) => (
          <span
            key={index}
            className="
              rounded-lg
              border
              border-indigo-500/20
              bg-indigo-500/10
              px-2.5
              py-1
              font-satoshi
              text-[11px]
              font-semibold
              text-indigo-600
              dark:text-indigo-300
            "
          >
            {typeof skill === "string" ? skill : skill.name}
          </span>
        ))}
        {talent.skills.length > 4 && (
          <span className="rounded-lg bg-surface-elevated px-2 py-1 font-satoshi text-[11px] font-semibold text-muted">
            +{talent.skills.length - 4}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AvailabilityBadge type={talent.availability} />
        <ExperienceBadge level={talent.experienceLevel} />
      </div>

      {/* Location */}
      <div className="mt-3.5 flex items-center gap-1.5 font-satoshi text-xs text-muted">
        <IconMapPin size={15} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
        <span className="truncate">{talent.location}</span>
      </div>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-border" />

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 font-satoshi">
        <button
          type="button"
          onClick={() => navigate(`/talent-profile/${talent.id}`, { state: { talent: customTalent } })}
          className="
            flex
            h-9
            items-center
            justify-center
            rounded-xl
            border
            border-indigo-500/30
            bg-transparent
            text-xs
            font-bold
            text-indigo-600
            dark:text-indigo-300
            transition-all
            hover:bg-indigo-500/10
            cursor-pointer
          "
        >
          View Profile
        </button>

        <button
          type="button"
          onClick={handleMessage}
          disabled={messaging}
          className="
            flex
            h-9
            items-center
            justify-center
            gap-1.5
            rounded-xl
            bg-indigo-600
            text-xs
            font-bold
            !text-white
            shadow-md
            transition-all
            hover:bg-indigo-500
            cursor-pointer
            disabled:opacity-60
          "
        >
          <IconMessage size={15} />
          {messaging ? "Opening…" : "Message"}
        </button>
      </div>
    </div>
  );
}

export default TalentCard;