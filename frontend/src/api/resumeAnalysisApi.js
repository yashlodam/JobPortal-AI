/**
 * src/api/resumeAnalysisApi.js
 *
 * API functions matching Spring Boot ResumeAnalysisController:
 * Base URL: /api/resume-analysis
 */

import { api } from "../config/Api";

/**
 * Analyze Resume with AI Neural Engine.
 * POST /api/resume-analysis/{resumeId}?forceReanalyze=false
 */
export const analyzeResumeApi = async (resumeId, forceReanalyze = false) => {
  const res = await api.post(`/resume-analysis/${resumeId}?forceReanalyze=${forceReanalyze}`, null, {
    timeout: 120000,
  });
  return res.data;
};

/**
 * Get Latest Resume Analysis by Resume ID.
 * GET /api/resume-analysis/{resumeId}
 */
export const getLatestAnalysisApi = async (resumeId) => {
  const res = await api.get(`/resume-analysis/${resumeId}`);
  return res.data;
};

/**
 * Delete Resume Analysis by Resume ID.
 * DELETE /api/resume-analysis/{resumeId}
 */
export const deleteAnalysisApi = async (resumeId) => {
  const res = await api.delete(`/resume-analysis/${resumeId}`);
  return res.data;
};
