/**
 * src/State/applicationThunk.js
 *
 * Redux Thunks for Job Applications API:
 * - POST   /api/applications/jobs/{jobId}       -> Apply to job
 * - DELETE /api/applications/{applicationId}     -> Withdraw application
 * - GET    /api/applications/me                  -> Get my applications (Applicant)
 * - GET    /api/applications/jobs/{jobId}       -> Get job applications (Recruiter)
 * - PUT    /api/applications/{applicationId}/status -> Update status (Recruiter)
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../config/Api";

// ─── 1. Apply to Job (Applicant) ─────────────────────────────────────────────
export const applyToJobThunk = createAsyncThunk(
  "applications/applyToJob",
  async ({ jobId, applicationData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/applications/jobs/${jobId}`, applicationData);
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("applyToJobThunk error:", error?.message || String(error));
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        "Failed to submit application"
      );
    }
  }
);

// ─── 2. Withdraw Application (Applicant) ──────────────────────────────────────
export const withdrawApplicationThunk = createAsyncThunk(
  "applications/withdrawApplication",
  async (applicationId, { rejectWithValue }) => {
    try {
      await api.delete(`/applications/${applicationId}`);
      return applicationId;
    } catch (error) {
      console.error("withdrawApplicationThunk error:", error?.message || String(error));
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        "Failed to withdraw application"
      );
    }
  }
);

// ─── 3. Fetch My Applications (Applicant) ────────────────────────────────────
export const fetchMyApplicationsThunk = createAsyncThunk(
  "applications/fetchMyApplications",
  async ({ page = 0, size = 10, sort = "createdAt,desc" } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/applications/me`, {
        params: { page, size, sort },
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("fetchMyApplicationsThunk error:", error?.message || String(error));
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        "Failed to fetch my applications"
      );
    }
  }
);

// ─── 4. Fetch Job Applications for Recruiter ─────────────────────────────────
export const fetchJobApplicationsThunk = createAsyncThunk(
  "applications/fetchJobApplications",
  async ({ jobId, page = 0, size = 10, sort = "createdAt,desc" }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/recruiter/jobs/${jobId}/applications`, {
        params: { page, size, sort },
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("fetchJobApplicationsThunk error:", error?.message || String(error));
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        "Failed to fetch applications for this job"
      );
    }
  }
);

// ─── 4b. Fetch All Applications Across All Jobs (Recruiter) ───────────────────
export const fetchAllRecruiterApplicationsThunk = createAsyncThunk(
  "applications/fetchAllRecruiterApplications",
  async ({ page = 0, size = 50, sort = "createdAt,desc" } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/recruiter/applications`, {
        params: { page, size, sort },
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("fetchAllRecruiterApplicationsThunk error:", error?.message || String(error));
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        "Failed to fetch recruiter applications"
      );
    }
  }
);

// ─── 5. Update Application Status (Recruiter) ────────────────────────────────
export const updateApplicationStatusThunk = createAsyncThunk(
  "applications/updateApplicationStatus",
  async ({ applicationId, status, notes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/recruiter/applications/${applicationId}/status`, {
        status,
        notes,
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("updateApplicationStatusThunk error:", error?.message || String(error));
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.errorMessage ||
        "Failed to update application status"
      );
    }
  }
);

// ─── 6. Fetch Recruiter Dashboard Stats ──────────────────────────────────────
export const fetchRecruiterDashboardStatsThunk = createAsyncThunk(
  "applications/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/recruiter/dashboard-stats");
      return response.data?.data ?? response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard stats"
      );
    }
  }
);
