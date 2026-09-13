import { Divider } from "@mantine/core";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Profile from "./Profile";
import RecommendTalent from "./RecommendTalent";
import { getTalentById, getMyTalentProfile } from "../../api/talentApi";
import { getAssetUrl, resolveImageUrl } from "../../utils/assetUtils";

const getFullImageUrl = (rawPath, fallback) => resolveImageUrl(rawPath, "uploads", fallback);

const mapBackendToProfile = (raw) => {
  if (!raw) return null;
  return {
    id: raw.id,
    userId: raw.userId,
    name: raw.name || raw.fullName || "Candidate",
    email: raw.email || "",
    role: raw.headline || raw.professionalTitle || raw.title || raw.role || "Software Specialist",
    company: raw.currentCompany || raw.company || "Independent",
    location: raw.location || (raw.city ? `${raw.city}, ${raw.country || ''}` : "Not Specified"),
    availability: raw.availability ? raw.availability.replace(/_/g, " ") : "OPEN TO WORK",
    experienceLevel: raw.experienceLevel ? raw.experienceLevel.replace(/_/g, " ") : "MID LEVEL",
    about: raw.about || raw.bio || null,
    profileImage: getFullImageUrl(raw.profileImage, "/profile.png"),
    bannerImage: getFullImageUrl(raw.bannerImage, "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"),
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    experiences: Array.isArray(raw.experiences) ? raw.experiences : (raw.experience ? raw.experience : []),
    educations: Array.isArray(raw.educations) ? raw.educations : (raw.education ? raw.education : []),
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    resumes: Array.isArray(raw.resumes) ? raw.resumes : [],
    resumeUrl: getFullImageUrl(raw.resumeUrl, null),
    resumeName: raw.resumeName,
  };
};

function TalentProfilePage() {
  const { id } = useParams();
  const location = useLocation();
  const stateTalent = location.state?.talent;

  const [profileData, setProfileData] = useState(() => {
    if (stateTalent) {
      return mapBackendToProfile(stateTalent);
    }
    return null;
  });

  const [loading, setLoading] = useState(!stateTalent);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const targetId = id || "1"; // Default to talent ID 1 if viewing /talent-profile directly
        const res = await getTalentById(targetId);
        const raw = res?.data || res;
        if (raw && isMounted) {
          setProfileData(mapBackendToProfile(raw));
        }
      } catch (err) {
        try {
          const res = await getMyTalentProfile();
          const raw = res?.data || res;
          if (raw && isMounted) {
            setProfileData(mapBackendToProfile(raw));
          }
        } catch (myErr) {
          // Handled silently
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [id]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background font-inter">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/4 h-[500px] w-[500px] rounded-full"
        style={{
          background: "rgba(99,102,241,0.07)",
          filter: "blur(180px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 right-0 h-[400px] w-[400px] rounded-full"
        style={{
          background: "rgba(6,182,212,0.05)",
          filter: "blur(160px)",
        }}
      />

      {/* Dot Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #94A3B8 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Page Content */}
      <div className="relative z-10">
        {/* Top Navigation */}
        <div className="section-container py-5">
          <Link
            to="/find-talent"
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-3
              py-2
              text-sm
              font-semibold
              text-body
              transition-all
              duration-300
              hover:bg-white/[0.05]
              hover:text-heading
            "
          >
            <IconArrowNarrowLeft
              stroke={1.8}
              size={20}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            Back to Talent Directory
          </Link>
        </div>

        <Divider color="rgba(148,163,184,0.08)" />

        {/* Talent Profile */}
        <div className="section-container py-8 sm:py-10 lg:py-12">
          {loading ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs text-muted font-satoshi">Loading candidate profile from backend...</p>
            </div>
          ) : profileData ? (
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Left - Main Profile */}
              <div className="w-full lg:w-2/3">
                <Profile {...profileData} />
              </div>

              {/* Right - Recommended Talent */}
              <div className="w-full lg:w-1/3 shrink-0">
                <RecommendTalent currentId={profileData.id} />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center p-8 rounded-2xl border border-white/10 bg-surface">
              <p className="text-base font-bold text-heading font-satoshi">Profile Not Found</p>
              <p className="text-xs text-muted mt-2">Could not retrieve candidate data from server.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default TalentProfilePage;