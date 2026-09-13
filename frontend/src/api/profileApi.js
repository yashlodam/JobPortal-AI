import { api } from "../config/Api";

// =======================
// PROFILE
// =======================

export const fetchMyProfile = async () => {
  const res = await api.get("/profile/me");
  return res.data;
};

export const fetchProfileByEmail = async (email) => {
  const res = await api.get(`/profile/${email}`);
  return res.data;
};

// =======================
// HEADER / LINKS / ABOUT
// =======================

export const updateHeader = async (data) => {
  const res = await api.put("/profile/me/header", data);
  return res.data;
};

export const updateLinks = async (data) => {
  const res = await api.put("/profile/me/links", data);
  return res.data;
};

export const updateAbout = async (data) => {
  const res = await api.put("/profile/me/about", data);
  return res.data;
};

// =======================
// SKILLS
// =======================

export const updateSkills = async (data) => {
  const res = await api.put("/profile/me/skills", data);
  return res.data;
};

export const addSkill = async (skill) => {
  const res = await api.post("/profile/me/skills", null, {
    params: { skill },
  });
  return res.data;
};

export const deleteSkill = async (skill) => {
  const res = await api.delete("/profile/me/skills", {
    params: { skill },
  });
  return res.data;
};

// =======================
// EXPERIENCE
// =======================

export const addExperience = async (data) => {
  const res = await api.post("/profile/me/experiences", data);
  return res.data;
};

export const updateExperience = async (experienceId, data) => {
  const res = await api.put(
    `/profile/me/experiences/${experienceId}`,
    data
  );
  return res.data;
};

export const fetchExperiences = async () => {
  const res = await api.get("/profile/me/experiences");
  return res.data;
};

export const deleteExperience = async (experienceId) => {
  const res = await api.delete(
    `/profile/me/experiences/${experienceId}`
  );
  return res.data;
};

// =======================
// EDUCATION
// =======================

export const addEducation = async (data) => {
  const res = await api.post("/profile/me/educations", data);
  return res.data;
};

export const updateEducation = async (educationId, data) => {
  const res = await api.put(
    `/profile/me/educations/${educationId}`,
    data
  );
  return res.data;
};

export const fetchEducations = async () => {
  const res = await api.get("/profile/me/educations");
  return res.data;
};

export const deleteEducation = async (educationId) => {
  const res = await api.delete(
    `/profile/me/educations/${educationId}`
  );
  return res.data;
};

// =======================
// CERTIFICATIONS
// =======================

export const addCertification = async (data) => {
  const res = await api.post(
    "/profile/me/certifications",
    data
  );
  return res.data;
};

export const updateCertification = async (
  certificationId,
  data
) => {
  const res = await api.put(
    `/profile/me/certifications/${certificationId}`,
    data
  );
  return res.data;
};

export const fetchCertifications = async () => {
  const res = await api.get(
    "/profile/me/certifications"
  );
  return res.data;
};

export const deleteCertification = async (
  certificationId
) => {
  const res = await api.delete(
    `/profile/me/certifications/${certificationId}`
  );
  return res.data;
};

// =======================
// LANGUAGES
// =======================

export const addLanguage = async (language) => {
  const res = await api.post(
    "/profile/me/languages",
    null,
    {
      params: { language },
    }
  );
  return res.data;
};

export const deleteLanguage = async (language) => {
  const res = await api.delete(
    "/profile/me/languages",
    {
      params: { language },
    }
  );
  return res.data;
};

export const fetchLanguages = async () => {
  const res = await api.get("/profile/me/languages");
  return res.data;
};

// =======================
// IMAGES
// =======================

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.put(
    "/profile/me/profile-image",
    formData
  );

  return res.data;
};

export const uploadBannerImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.put(
    "/profile/me/banner-image",
    formData
  );

  return res.data;
};
