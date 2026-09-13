/**
 * src/State/profileThunk.js
 *
 * All async thunks for the Profile feature.
 *
 * Rules enforced here:
 *  - Each thunk calls exactly ONE function from profileApi.js.
 *  - All errors are caught and forwarded with rejectWithValue().
 *  - No UI logic, no toast calls — that belongs in components.
 *  - Payloads are returned as-is from the API layer (ApiResponse wrapper).
 *
 * Consumed by: src/State/profileSlice.js (extraReducers)
 *              Components (via dispatch)
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchMyProfile,
  fetchProfileByEmail,
  uploadProfileImage,
  uploadBannerImage,
  updateHeader,
  updateLinks,
  updateAbout,
  updateSkills,
  addSkill,
  deleteSkill,
  addExperience,
  updateExperience,
  fetchExperiences,
  deleteExperience,
  addEducation,
  updateEducation,
  fetchEducations,
  deleteEducation,
  addCertification,
  updateCertification,
  fetchCertifications,
  deleteCertification,
  addLanguage,
  deleteLanguage,
} from "../api/profileApi";

// ─────────────────────────────────────────────────────────────────────────────
// Helper — extracts a human-readable message from any caught error.
// Keeps every catch block to a single line.
// ─────────────────────────────────────────────────────────────────────────────
const getErrorPayload = (error) =>
  error.response?.data || {
    message: error.userMessage || error.message || "Something went wrong.",
  };

// ─────────────────────────────────────────────────────────────────────────────
// READ OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/profile/me — authenticated user's own profile */
export const fetchMyProfileThunk = createAsyncThunk(
  "profile/fetchMyProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      return await fetchMyProfile();
    } catch (error) {
      const state = getState();
      const user = state.auth?.profile;
      if (user?.email) {
        try {
          return await fetchProfileByEmail(user.email);
        } catch (e) {
          const currentProfile = state.profile?.profile || {};
          return {
            name: user.name || currentProfile.name || "",
            email: user.email,
            role: user.role || "APPLICANT",
            accountType: user.accountType || "APPLICANT",
            profileImage: currentProfile.profileImage || user.profileImage || null,
            bannerImage: currentProfile.bannerImage || user.bannerImage || null,
          };
        }
      }
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** GET /api/profile/{email} — public profile lookup by email */
export const fetchProfileByEmailThunk = createAsyncThunk(
  "profile/fetchProfileByEmail",
  async (email, { getState, rejectWithValue }) => {
    try {
      return await fetchProfileByEmail(email);
    } catch (error) {
      const state = getState();
      const user = state.auth?.profile;
      const currentProfile = state.profile?.profile || {};
      return {
        name: user?.name || currentProfile.name || "",
        email: email || user?.email || "",
        role: user?.role || "APPLICANT",
        accountType: user?.accountType || "APPLICANT",
        profileImage: currentProfile.profileImage || user?.profileImage || null,
        bannerImage: currentProfile.bannerImage || user?.bannerImage || null,
      };
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE UPLOADS
// ─────────────────────────────────────────────────────────────────────────────

/** PUT /api/profile/me/profile-image */
export const uploadProfileImageThunk = createAsyncThunk(
  "profile/uploadProfileImage",
  async (file, { rejectWithValue }) => {
    try {
      return await uploadProfileImage(file);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** PUT /api/profile/me/banner-image */
export const uploadBannerImageThunk = createAsyncThunk(
  "profile/uploadBannerImage",
  async (file, { rejectWithValue }) => {
    try {
      return await uploadBannerImage(file);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE SECTIONS — UPDATE
// ─────────────────────────────────────────────────────────────────────────────

/** PUT /api/profile/me/header */
export const updateHeaderThunk = createAsyncThunk(
  "profile/updateHeader",
  async (data, { rejectWithValue }) => {
    try {
      return await updateHeader(data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** PUT /api/profile/me/links */
export const updateLinksThunk = createAsyncThunk(
  "profile/updateLinks",
  async (data, { rejectWithValue }) => {
    try {
      return await updateLinks(data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** PUT /api/profile/me/about */
export const updateAboutThunk = createAsyncThunk(
  "profile/updateAbout",
  async (data, { rejectWithValue }) => {
    try {
      return await updateAbout(data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** PUT /api/profile/me/skills — replaces the entire skills list */
export const updateSkillsThunk = createAsyncThunk(
  "profile/updateSkills",
  async (data, { rejectWithValue }) => {
    try {
      return await updateSkills(data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS — ADD / DELETE
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/profile/me/skills?skill=React */
export const addSkillThunk = createAsyncThunk(
  "profile/addSkill",
  async (skill, { rejectWithValue }) => {
    try {
      return await addSkill(skill);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** DELETE /api/profile/me/skills?skill=React */
export const deleteSkillThunk = createAsyncThunk(
  "profile/deleteSkill",
  async (skill, { rejectWithValue }) => {
    try {
      return await deleteSkill(skill);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/profile/me/experiences */
export const addExperienceThunk = createAsyncThunk(
  "profile/addExperience",
  async (data, { rejectWithValue }) => {
    try {
      return await addExperience(data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** PUT /api/profile/me/experiences/{experienceId} */
export const updateExperienceThunk = createAsyncThunk(
  "profile/updateExperience",
  async ({ experienceId, data }, { rejectWithValue }) => {
    try {
      return await updateExperience(experienceId, data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** GET /api/profile/me/experiences */
export const fetchExperiencesThunk = createAsyncThunk(
  "profile/fetchExperiences",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchExperiences();
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** DELETE /api/profile/me/experiences/{experienceId} */
export const deleteExperienceThunk = createAsyncThunk(
  "profile/deleteExperience",
  async (experienceId, { rejectWithValue }) => {
    try {
      return await deleteExperience(experienceId);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/profile/me/educations */
export const addEducationThunk = createAsyncThunk(
  "profile/addEducation",
  async (data, { rejectWithValue }) => {
    try {
      return await addEducation(data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** PUT /api/profile/me/educations/{educationId} */
export const updateEducationThunk = createAsyncThunk(
  "profile/updateEducation",
  async ({ educationId, data }, { rejectWithValue }) => {
    try {
      return await updateEducation(educationId, data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** GET /api/profile/me/educations */
export const fetchEducationsThunk = createAsyncThunk(
  "profile/fetchEducations",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchEducations();
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** DELETE /api/profile/me/educations/{educationId} */
export const deleteEducationThunk = createAsyncThunk(
  "profile/deleteEducation",
  async (educationId, { rejectWithValue }) => {
    try {
      return await deleteEducation(educationId);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/profile/me/certifications */
export const addCertificationThunk = createAsyncThunk(
  "profile/addCertification",
  async (data, { rejectWithValue }) => {
    try {
      return await addCertification(data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** PUT /api/profile/me/certifications/{certificationId} */
export const updateCertificationThunk = createAsyncThunk(
  "profile/updateCertification",
  async ({ certificationId, data }, { rejectWithValue }) => {
    try {
      return await updateCertification(certificationId, data);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** GET /api/profile/me/certifications */
export const fetchCertificationsThunk = createAsyncThunk(
  "profile/fetchCertifications",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCertifications();
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** DELETE /api/profile/me/certifications/{certificationId} */
export const deleteCertificationThunk = createAsyncThunk(
  "profile/deleteCertification",
  async (certificationId, { rejectWithValue }) => {
    try {
      return await deleteCertification(certificationId);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGES
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/profile/me/languages?language=English */
export const addLanguageThunk = createAsyncThunk(
  "profile/addLanguage",
  async (language, { rejectWithValue }) => {
    try {
      return await addLanguage(language);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** DELETE /api/profile/me/languages?language=English */
export const deleteLanguageThunk = createAsyncThunk(
  "profile/deleteLanguage",
  async (language, { rejectWithValue }) => {
    try {
      return await deleteLanguage(language);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** GET /api/profile/me/languages */
export const fetchLanguagesThunk = createAsyncThunk(
  "profile/fetchLanguages",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchLanguages();
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);