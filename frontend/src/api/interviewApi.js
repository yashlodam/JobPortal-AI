/**
 * src/api/interviewApi.js
 *
 * API functions matching Spring Boot InterviewController:
 * Base URL: /api/interviews
 */

import { api } from "../config/Api";

/**
 * Starts a new AI Mock Interview session.
 * POST /api/interviews/start
 */
export const startInterviewApi = async (requestData) => {
  const res = await api.post("/interviews/start", requestData, { timeout: 90000 });
  return res.data;
};

/**
 * Generates or retrieves the next question for an active interview session.
 * POST /api/interviews/{sessionId}/next-question
 */
export const getNextQuestionApi = async (sessionId) => {
  const res = await api.post(`/interviews/${sessionId}/next-question`, null, { timeout: 90000 });
  return res.data;
};

/**
 * Submits a candidate's answer and evaluates it using AI.
 * POST /api/interviews/{sessionId}/submit
 */
export const submitAnswerApi = async (sessionId, requestData) => {
  const res = await api.post(`/interviews/${sessionId}/submit`, requestData, { timeout: 90000 });
  return res.data;
};

/**
 * Retrieves session details and current progress.
 * GET /api/interviews/{sessionId}
 */
export const getSessionDetailsApi = async (sessionId) => {
  const res = await api.get(`/interviews/${sessionId}`);
  return res.data;
};

/**
 * Retrieves paginated interview history for the authenticated user.
 * GET /api/interviews/history
 */
export const getUserHistoryApi = async (page = 0, size = 10) => {
  const res = await api.get(`/interviews/history?page=${page}&size=${size}`);
  return res.data;
};

/**
 * Returns the complete AI evaluation report for an interview session.
 * GET /api/interviews/{sessionId}/report
 */
export const getInterviewReportApi = async (sessionId) => {
  const res = await api.get(`/interviews/${sessionId}/report`, { timeout: 90000 });
  return res.data;
};

/**
 * Deletes an interview session and its records.
 * DELETE /api/interviews/{sessionId}
 */
export const deleteSessionApi = async (sessionId) => {
  const res = await api.delete(`/interviews/${sessionId}`);
  return res.data;
};
