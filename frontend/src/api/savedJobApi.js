/**
 * src/api/savedJobApi.js
 *
 * API module for Spring Boot SavedJobController under /api/saved-jobs.
 */

import { api } from "../config/Api";

/**
 * Save a job.
 * POST /api/saved-jobs/{jobId}
 */
export const saveJobApi = async (jobId) => {
  const res = await api.post(`/saved-jobs/${jobId}`);
  return res.data;
};

/**
 * Unsave a job.
 * DELETE /api/saved-jobs/{jobId}
 */
export const unsaveJobApi = async (jobId) => {
  const res = await api.delete(`/saved-jobs/${jobId}`);
  return res.data;
};

/**
 * Get all saved jobs for current user (paginated).
 * GET /api/saved-jobs/me?page=0&size=10&sort=createdAt
 */
export const getMySavedJobsApi = async ({ page = 0, size = 10, sort = "createdAt,desc" } = {}) => {
  const res = await api.get("/saved-jobs/me", {
    params: { page, size, sort },
  });
  return res.data;
};

/**
 * Check if a specific job is saved by current user.
 * GET /api/saved-jobs/{jobId}/check
 */
export const isJobSavedApi = async (jobId) => {
  const res = await api.get(`/saved-jobs/${jobId}/check`);
  return res.data;
};
