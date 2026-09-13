/**
 * src/State/profileSlice.js
 *
 * Redux slice for the entire Profile feature.
 *
 * State shape:
 *  loading        — true while any profile request is in-flight
 *  error          — last error message string (or null)
 *  success        — true after any mutating operation succeeds (reset by clearProfileSuccess)
 *  profile        — full profile object (GET /profile/me)
 *  header         — header section (name, title, location…)
 *  about          — about/bio string or object
 *  links          — social links object
 *  skills         — array of skill objects
 *  experiences    — array of experience objects
 *  educations     — array of education objects
 *  certifications — array of certification objects
 *  languages      — array of language objects
 *  profileImage   — URL of the profile avatar after upload
 *  bannerImage    — URL of the banner image after upload
 *
 * IMPORTANT: All backend responses are wrapped as ApiResponse<T>:
 *   { success, message, data: <actual payload> }
 *   Every fulfilled handler must read action.payload.data (not action.payload).
 *
 * Selectors are co-located at the bottom of this file.
 */

import { createSlice } from "@reduxjs/toolkit";

// ── Thunk imports ─────────────────────────────────────────────────────────────
import {
  fetchMyProfileThunk,
  fetchProfileByEmailThunk,
  uploadProfileImageThunk,
  uploadBannerImageThunk,
  updateHeaderThunk,
  updateLinksThunk,
  updateAboutThunk,
  updateSkillsThunk,
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
} from "./profileThunk";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — shared reducer logic to avoid repetition inside extraReducers.
// ─────────────────────────────────────────────────────────────────────────────

/** Mark a request as in-flight and clear any stale error. */
const startLoading = (state) => {
  state.loading = true;
  state.error = null;
};

/** Mark a request as complete and flag success. */
const setSuccess = (state) => {
  state.loading = false;
  state.success = true;
};

/** Store the error message and stop the loader. */
const setError = (state, action) => {
  state.loading = false;
  state.error =
    action.payload?.message ||
    action.payload?.errorMessage ||
    "An unexpected error occurred.";
};

/**
 * Unwrap the ApiResponse envelope.
 * Backend always returns: { success, message, data: <T> }
 * This helper extracts <T>, falling back gracefully if the wrapper is absent.
 */
const unwrap = (payload) => payload?.data ?? payload;

// ─────────────────────────────────────────────────────────────────────────────
// Initial State (Restored from localStorage for instant frame-0 rendering)
// ─────────────────────────────────────────────────────────────────────────────
const storedFullProfile = (() => {
  try {
    const p = localStorage.getItem("jobportal_full_profile");
    return p ? JSON.parse(p) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  loading: false,
  error: null,
  success: false,

  // Core profile object returned by GET /profile/me
  profile: storedFullProfile,

  // Granular section caches (populated by dedicated section fetches)
  header: storedFullProfile?.header ?? null,
  about: storedFullProfile?.about ?? null,
  links: storedFullProfile?.links ?? null,
  skills: storedFullProfile?.skills ?? [],
  experiences: storedFullProfile?.experiences ?? [],
  educations: storedFullProfile?.educations ?? [],
  certifications: storedFullProfile?.certifications ?? [],
  languages: storedFullProfile?.languages ?? [],
  resume: null,
  // Image URLs returned after successful upload
  profileImage: storedFullProfile?.profileImage ?? null,
  bannerImage: storedFullProfile?.bannerImage ?? null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const profileSlice = createSlice({
  name: "profile",
  initialState,

  // ── Synchronous reducers ──────────────────────────────────────────────────
  reducers: {
    /** Call this after showing a success toast so the flag resets. */
    clearProfileSuccess: (state) => {
      state.success = false;
    },
    /** Call this after showing an error toast so the error resets. */
    clearProfileError: (state) => {
      state.error = null;
    },
    /** Hard-reset the entire profile slice (e.g. on logout). */
    resetProfile: () => {
      try {
        localStorage.removeItem("jobportal_full_profile");
      } catch {}
      return {
        loading: false,
        error: null,
        success: false,
        profile: null,
        header: null,
        about: null,
        links: null,
        skills: [],
        experiences: [],
        educations: [],
        certifications: [],
        languages: [],
        resume: null,
        profileImage: null,
        bannerImage: null,
      };
    },
  },

  // ── Async reducers ────────────────────────────────────────────────────────
  extraReducers: (builder) => {
    builder

      // ══════════════════════════════════════════════════════════════════════
      // GET /profile/me — fetch own full profile
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(fetchMyProfileThunk.pending, startLoading)
      .addCase(fetchMyProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        const data = unwrap(action.payload);
        if (data) {
          state.profile = data;
          // Hydrate granular section caches
          state.header         = data?.header         ?? state.header;
          state.about          = data?.about          ?? state.about;
          state.links          = data?.links          ?? state.links;
          state.skills         = data?.skills         ?? state.skills;
          state.experiences    = data?.experiences    ?? state.experiences;
          state.educations     = data?.educations     ?? state.educations;
          state.certifications = data?.certifications ?? state.certifications;
          state.languages      = data?.languages      ?? state.languages;
          state.profileImage   = data?.profileImage   ?? state.profileImage;
          state.bannerImage    = data?.bannerImage    ?? state.bannerImage;
          // Hydrate resume cache from root-level fields on ProfileResponse
          if (data?.resumeUrl || data?.resumeName) {
            state.resume = { resumeUrl: data.resumeUrl ?? null, resumeName: data.resumeName ?? null };
          }
          try {
            localStorage.setItem("jobportal_full_profile", JSON.stringify(state.profile));
          } catch {}
        }
      })
      .addCase(fetchMyProfileThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // GET /profile/{email} — public profile lookup
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(fetchProfileByEmailThunk.pending, startLoading)
      .addCase(fetchProfileByEmailThunk.fulfilled, (state, action) => {
        state.loading = false;
        const data = unwrap(action.payload);
        if (data) {
          state.profile        = data;
          state.header         = data?.header         ?? state.header;
          state.about          = data?.about          ?? state.about;
          state.links          = data?.links          ?? state.links;
          state.skills         = data?.skills         ?? state.skills;
          state.experiences    = data?.experiences    ?? state.experiences;
          state.educations     = data?.educations     ?? state.educations;
          state.certifications = data?.certifications ?? state.certifications;
          state.languages      = data?.languages      ?? state.languages;
          state.profileImage   = data?.profileImage   ?? state.profileImage;
          state.bannerImage    = data?.bannerImage    ?? state.bannerImage;
          // Hydrate resume cache from root-level fields on ProfileResponse
          if (data?.resumeUrl || data?.resumeName) {
            state.resume = { resumeUrl: data.resumeUrl ?? null, resumeName: data.resumeName ?? null };
          }
          try {
            localStorage.setItem("jobportal_full_profile", JSON.stringify(state.profile));
          } catch {}
        }
      })
      .addCase(fetchProfileByEmailThunk.rejected, setError)




      .addCase(uploadProfileImageThunk.pending, startLoading)
      .addCase(uploadProfileImageThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        const img = typeof data === "string" ? data : (data?.profileImage ?? data?.url ?? data?.avatarUrl ?? state.profileImage);
        state.profileImage = img;
        if (state.profile) {
          state.profile.profileImage = img;
        } else {
          state.profile = { profileImage: img };
        }
        try {
          localStorage.setItem("jobportal_full_profile", JSON.stringify(state.profile));
        } catch {}
      })
      .addCase(uploadProfileImageThunk.rejected, setError)
      // ══════════════════════════════════════════════════════════════════════
      // PUT /profile/me/banner-image
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(uploadBannerImageThunk.pending, startLoading)
      .addCase(uploadBannerImageThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        const banner = typeof data === "string" ? data : (data?.bannerImage ?? data?.url ?? data?.bannerUrl ?? state.bannerImage);
        state.bannerImage = banner;
        if (state.profile) {
          state.profile.bannerImage = banner;
        } else {
          state.profile = { bannerImage: banner };
        }
        try {
          localStorage.setItem("jobportal_full_profile", JSON.stringify(state.profile));
        } catch {}
      })
      .addCase(uploadBannerImageThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // PUT /profile/me/header
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(updateHeaderThunk.pending, startLoading)
      .addCase(updateHeaderThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        state.header = data?.header ?? data;
        if (state.profile) {
          state.profile.header = state.header;
          if (data?.name) state.profile.name = data.name;
          if (data?.headline) state.profile.headline = data.headline;
          if (data?.company || data?.currentCompany) state.profile.company = data.company ?? data.currentCompany;
          if (data?.location) state.profile.location = data.location;
          if (data?.availability) state.profile.availability = data.availability;
          if (data?.experienceLevel) state.profile.experienceLevel = data.experienceLevel;
        }
      })
      .addCase(updateHeaderThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // PUT /profile/me/links
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(updateLinksThunk.pending, startLoading)
      .addCase(updateLinksThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        state.links = data?.links ?? data;
        if (state.profile) {
          state.profile.links = state.links;
          if (data?.linkedinUrl) state.profile.linkedinUrl = data.linkedinUrl;
          if (data?.githubUrl) state.profile.githubUrl = data.githubUrl;
          if (data?.portfolioUrl) state.profile.portfolioUrl = data.portfolioUrl;
        }
      })
      .addCase(updateLinksThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // PUT /profile/me/about
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(updateAboutThunk.pending, startLoading)
      .addCase(updateAboutThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        state.about = data?.about ?? data;
        if (state.profile) {
          state.profile.about = state.about;
        }
      })
      .addCase(updateAboutThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // PUT /profile/me/skills — full replacement
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(updateSkillsThunk.pending, startLoading)
      .addCase(updateSkillsThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        state.skills = data?.skills ?? data;
        if (state.profile) state.profile.skills = state.skills;
      })
      .addCase(updateSkillsThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // POST /profile/me/skills — add single skill
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(addSkillThunk.pending, startLoading)
      .addCase(addSkillThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        // Backend returns updated ProfileResponse — take skills array from it
        if (data?.skills) {
          state.skills = data.skills;
        }
        if (state.profile) {
          state.profile.skills = state.skills;
        }
      })
      .addCase(addSkillThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // DELETE /profile/me/skills
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(deleteSkillThunk.pending, startLoading)
      .addCase(deleteSkillThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        if (data?.skills) {
          // Use updated list from backend when available
          state.skills = data.skills;
        } else {
          // Optimistic fallback — remove by the skill string passed to the thunk
          const removedSkill = action.meta.arg;
          state.skills = state.skills.filter((skill) => {
            const current = typeof skill === "object" ? skill.skill ?? skill.name : skill;
            return current !== removedSkill;
          });
        }
        if (state.profile) state.profile.skills = state.skills;
      })
      .addCase(deleteSkillThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // POST /profile/me/experiences
      // Response: ApiResponse<ExperienceResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(addExperienceThunk.pending, startLoading)
      .addCase(addExperienceThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        if (Array.isArray(data)) {
          state.experiences = data;
        } else if (data) {
          state.experiences.push(data);
        }
        if (state.profile) state.profile.experiences = state.experiences;
      })
      .addCase(addExperienceThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // PUT /profile/me/experiences/{experienceId}
      // Response: ApiResponse<ExperienceResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(updateExperienceThunk.pending, startLoading)
      .addCase(updateExperienceThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const updated = unwrap(action.payload);
        const idx = state.experiences.findIndex((e) => e.id === updated?.id);
        if (idx !== -1 && updated) {
          state.experiences[idx] = updated;
        }
        if (state.profile) state.profile.experiences = state.experiences;
      })
      .addCase(updateExperienceThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // GET /profile/me/experiences
      // Response: ApiResponse<List<ExperienceResponse>>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(fetchExperiencesThunk.pending, startLoading)
      .addCase(fetchExperiencesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const list = unwrap(action.payload) ?? [];
        state.experiences = list;
        if (state.profile) {
          state.profile.experiences = list;
          state.profile.experience = list;
        }
      })
      .addCase(fetchExperiencesThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // DELETE /profile/me/experiences/{experienceId}
      // Response: ApiResponse<Void>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(deleteExperienceThunk.pending, startLoading)
      .addCase(deleteExperienceThunk.fulfilled, (state, action) => {
        setSuccess(state);
        // action.meta.arg is the experienceId passed to the thunk
        state.experiences = state.experiences.filter(
          (e) => e.id !== action.meta.arg
        );
        if (state.profile) state.profile.experiences = state.experiences;
      })
      .addCase(deleteExperienceThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // POST /profile/me/educations
      // Response: ApiResponse<EducationResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(addEducationThunk.pending, startLoading)
      .addCase(addEducationThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        if (Array.isArray(data)) {
          state.educations = data;
        } else if (data) {
          state.educations.push(data);
        }
        if (state.profile) state.profile.educations = state.educations;
      })
      .addCase(addEducationThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // PUT /profile/me/educations/{educationId}
      // Response: ApiResponse<EducationResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(updateEducationThunk.pending, startLoading)
      .addCase(updateEducationThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const updated = unwrap(action.payload);
        const idx = state.educations.findIndex((e) => e.id === updated?.id);
        if (idx !== -1 && updated) {
          state.educations[idx] = updated;
        }
        if (state.profile) state.profile.educations = state.educations;
      })
      .addCase(updateEducationThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // GET /profile/me/educations
      // Response: ApiResponse<List<EducationResponse>>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(fetchEducationsThunk.pending, startLoading)
      .addCase(fetchEducationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const list = unwrap(action.payload) ?? [];
        state.educations = list;
        if (state.profile) {
          state.profile.educations = list;
          state.profile.education = list;
        }
      })
      .addCase(fetchEducationsThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // DELETE /profile/me/educations/{educationId}
      // Response: ApiResponse<Void>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(deleteEducationThunk.pending, startLoading)
      .addCase(deleteEducationThunk.fulfilled, (state, action) => {
        setSuccess(state);
        state.educations = state.educations.filter(
          (e) => e.id !== action.meta.arg
        );
        if (state.profile) state.profile.educations = state.educations;
      })
      .addCase(deleteEducationThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // POST /profile/me/certifications
      // Response: ApiResponse<CertificationResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(addCertificationThunk.pending, startLoading)
      .addCase(addCertificationThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        if (Array.isArray(data)) {
          state.certifications = data;
        } else if (data) {
          state.certifications.push(data);
        }
        if (state.profile) state.profile.certifications = state.certifications;
      })
      .addCase(addCertificationThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // PUT /profile/me/certifications/{certificationId}
      // Response: ApiResponse<CertificationResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(updateCertificationThunk.pending, startLoading)
      .addCase(updateCertificationThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const updated = unwrap(action.payload);
        const idx = state.certifications.findIndex((c) => c.id === updated?.id);
        if (idx !== -1 && updated) {
          state.certifications[idx] = updated;
        }
        if (state.profile) state.profile.certifications = state.certifications;
      })
      .addCase(updateCertificationThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // GET /profile/me/certifications
      // Response: ApiResponse<List<CertificationResponse>>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(fetchCertificationsThunk.pending, startLoading)
      .addCase(fetchCertificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const list = unwrap(action.payload) ?? [];
        state.certifications = list;
        if (state.profile) {
          state.profile.certifications = list;
        }
      })
      .addCase(fetchCertificationsThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // DELETE /profile/me/certifications/{certificationId}
      // Response: ApiResponse<Void>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(deleteCertificationThunk.pending, startLoading)
      .addCase(deleteCertificationThunk.fulfilled, (state, action) => {
        setSuccess(state);
        state.certifications = state.certifications.filter(
          (c) => c.id !== action.meta.arg
        );
        if (state.profile) state.profile.certifications = state.certifications;
      })
      .addCase(deleteCertificationThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // POST /profile/me/languages?language=English
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(addLanguageThunk.pending, startLoading)
      .addCase(addLanguageThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        // Backend returns updated ProfileResponse — take languages from it
        if (data?.languages) {
          state.languages = data.languages;
        }
        if (state.profile) state.profile.languages = state.languages;
      })
      .addCase(addLanguageThunk.rejected, setError)

      // ══════════════════════════════════════════════════════════════════════
      // DELETE /profile/me/languages?language=English
      // Response: ApiResponse<ProfileResponse>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(deleteLanguageThunk.pending, startLoading)
      .addCase(deleteLanguageThunk.fulfilled, (state, action) => {
        setSuccess(state);
        const data = unwrap(action.payload);
        if (data?.languages) {
          // Use updated list from backend when available
          state.languages = data.languages;
        } else {
          // Optimistic fallback
          const removedLanguage = action.meta.arg;
          state.languages = state.languages.filter((language) => {
            const current = typeof language === "object"
              ? language.language ?? language.name ?? language.id
              : language;
            return current !== removedLanguage;
          });
        }
        if (state.profile) state.profile.languages = state.languages;
      })
      .addCase(deleteLanguageThunk.rejected, setError)
      // ══════════════════════════════════════════════════════════════════════
      // GET /profile/me/languages
      // Response: ApiResponse<List<String>>
      // ══════════════════════════════════════════════════════════════════════
      .addCase(fetchLanguagesThunk.pending, startLoading)
      .addCase(fetchLanguagesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const list = unwrap(action.payload) ?? [];
        state.languages = list;
        if (state.profile) state.profile.languages = list;
      })
      .addCase(fetchLanguagesThunk.rejected, setError);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────
export const { clearProfileSuccess, clearProfileError, resetProfile } =
  profileSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// Selectors
// Co-locating selectors with the slice avoids import chasing across files.
// Components import what they need directly from this file.
// ─────────────────────────────────────────────────────────────────────────────

/** True while any profile request is in-flight */
export const selectProfileLoading = (state) => state.profile.loading;

/** Last error message string, or null */
export const selectProfileError = (state) => state.profile.error;

/** True immediately after any successful mutation */
export const selectProfileSuccess = (state) => state.profile.success;

/** Full profile object */
export const selectProfile = (state) => state.profile.profile;

/** Header section */
export const selectProfileHeader = (state) => state.profile.header;

/** About / bio section */
export const selectProfileAbout = (state) => state.profile.about;

/** Social / professional links */
export const selectProfileLinks = (state) => state.profile.links;

/** Array of skills */
export const selectProfileSkills = (state) => state.profile.skills;

/** Array of experience entries */
export const selectProfileExperiences = (state) => state.profile.experiences;

/** Array of education entries */
export const selectProfileEducations = (state) => state.profile.educations;

/** Array of certifications */
export const selectProfileCertifications = (state) =>
  state.profile.certifications;

/** Array of languages */
export const selectProfileLanguages = (state) => state.profile.languages;

/** Profile avatar image URL */
export const selectProfileImage = (state) => state.profile.profileImage;

/** Banner image URL */
export const selectBannerImage = (state) => state.profile.bannerImage;

export default profileSlice.reducer;
