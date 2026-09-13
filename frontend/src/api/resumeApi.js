/**
 * src/api/resumeApi.js
 *
 * API functions for candidate resumes matching Spring Boot ResumeController:
 * Base URL: /api/resumes
 */

import { api } from "../config/Api";

/**
 * Upload a new resume file.
 * POST /api/resumes
 * Params: file (MultipartFile), resumeName (String, optional), isDefault (Boolean, optional)
 */
export const uploadResumeApi = async ({ file, resumeName, isDefault }) => {
  const formData = new FormData();
  formData.append("file", file);
  if (resumeName) formData.append("resumeName", resumeName);
  if (isDefault !== undefined && isDefault !== null) formData.append("isDefault", isDefault);

  const res = await api.post("/resumes", formData, {
    timeout: 60000,
  });
  return res.data;
};

/**
 * Get all resumes belonging to the authenticated user.
 * GET /api/resumes/me
 */
export const getMyResumesApi = async () => {
  const res = await api.get("/resumes/me");
  return res.data;
};

/**
 * Get details of a specific resume by ID.
 * GET /api/resumes/{id}
 */
export const getResumeByIdApi = async (id) => {
  const res = await api.get(`/resumes/${id}`);
  return res.data;
};

/**
 * Update resume metadata (resumeName or isDefault).
 * PUT /api/resumes/{id}
 * Body: { resumeName: String, isDefault: Boolean }
 */
export const updateResumeApi = async (id, requestData) => {
  const res = await api.put(`/resumes/${id}`, requestData);
  return res.data;
};

/**
 * Delete a specific resume.
 * DELETE /api/resumes/{id}
 */
export const deleteResumeApi = async (id) => {
  const res = await api.delete(`/resumes/${id}`);
  return res.data;
};

/**
 * Set a specific resume as default.
 * PUT /api/resumes/{id}/default
 */
export const setDefaultResumeApi = async (id) => {
  const res = await api.put(`/resumes/${id}/default`);
  return res.data;
};
