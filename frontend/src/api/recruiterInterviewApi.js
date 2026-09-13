/**
 * src/api/recruiterInterviewApi.js
 *
 * API client for Recruiter Interview Management.
 * All endpoints require authentication (JWT cookie).
 *
 * Backend base: /api/recruiter/interviews
 * Candidate:    /api/candidate/interviews
 */

import { api } from "../config/Api";

const BASE = "/recruiter/interviews";

// ── Recruiter APIs ────────────────────────────────────────────────────────────

/**
 * GET /api/recruiter/interviews?filter=all|upcoming|completed|cancelled|today
 */
export const getRecruiterInterviewsApi = (filter = "all") =>
  api.get(BASE, { params: { filter } });

/**
 * GET /api/recruiter/interviews/stats
 */
export const getInterviewStatsApi = () =>
  api.get(`${BASE}/stats`);

/**
 * GET /api/recruiter/interviews/{id}
 */
export const getInterviewByIdApi = (id) =>
  api.get(`${BASE}/${id}`);

/**
 * POST /api/recruiter/interviews
 * Body: ScheduleInterviewRequest
 * {
 *   applicationId: Long,
 *   interviewerName: String,
 *   interviewRound: "SCREENING"|"TECHNICAL"|"HR"|"SYSTEM_DESIGN"|"FINAL"|"REFERENCE_CHECK",
 *   interviewMode: "VIDEO_CALL"|"PHONE"|"IN_PERSON"|"PAIR_PROGRAMMING"|"WRITTEN_TEST",
 *   meetingPlatform: String,
 *   meetingLink: String,
 *   scheduledAt: "2026-08-20T14:00:00",
 *   endsAt: "2026-08-20T15:00:00",
 *   durationMinutes: Number,
 *   internalNotes: String
 * }
 */
export const scheduleInterviewApi = (data) =>
  api.post(BASE, data);

/**
 * PUT /api/recruiter/interviews/{id}
 * Body: UpdateInterviewRequest (same fields, all optional)
 */
export const updateInterviewApi = (id, data) =>
  api.put(`${BASE}/${id}`, data);

/**
 * PATCH /api/recruiter/interviews/{id}/status
 * Body: { status: "IN_PROGRESS"|"COMPLETED"|"CANCELLED"|"NO_SHOW" }
 */
export const updateInterviewStatusApi = (id, status) =>
  api.patch(`${BASE}/${id}/status`, { status });

/**
 * POST /api/recruiter/interviews/{id}/feedback
 * Body: { feedback: String, candidateRating: 1-5 }
 */
export const submitInterviewFeedbackApi = (id, data) =>
  api.post(`${BASE}/${id}/feedback`, data);

/**
 * DELETE /api/recruiter/interviews/{id}
 * Cancels the interview (status → CANCELLED).
 */
export const cancelInterviewApi = (id) =>
  api.delete(`${BASE}/${id}`);

/**
 * GET /api/recruiter/interviews/by-application/{applicationId}
 */
export const getInterviewsByApplicationApi = (applicationId) =>
  api.get(`${BASE}/by-application/${applicationId}`);

// ── Candidate APIs ────────────────────────────────────────────────────────────

/**
 * GET /api/candidate/interviews
 * Returns the candidate's own scheduled interviews.
 */
export const getCandidateInterviewsApi = () =>
  api.get("/candidate/interviews");
