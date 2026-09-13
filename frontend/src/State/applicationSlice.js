/**
 * src/State/applicationSlice.js
 *
 * Redux Slice for Job Applications:
 * Manages applicant application history, recruiter job applications, pagination, and status updates.
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  applyToJobThunk,
  withdrawApplicationThunk,
  fetchMyApplicationsThunk,
  fetchJobApplicationsThunk,
  fetchAllRecruiterApplicationsThunk,
  updateApplicationStatusThunk,
  fetchRecruiterDashboardStatsThunk,
} from "./applicationThunk";

const initialState = {
  // Applicant state
  myApplications: [],
  myApplicationsPage: {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10,
  },

  // Recruiter state
  jobApplications: [],
  jobApplicationsPage: {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10,
  },
  dashboardStats: null,

  // Active selected application detail
  selectedApplication: null,

  // Loading & error flags
  loading: false,
  applyLoading: false,
  updateStatusLoading: false,
  error: null,
  successMessage: null,
};

const applicationSlice = createSlice({
  name: "application",
  initialState,

  reducers: {
    setSelectedApplication: (state, action) => {
      state.selectedApplication = action.payload;
    },
    clearApplicationError: (state) => {
      state.error = null;
    },
    clearApplicationSuccess: (state) => {
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ─── Apply to Job ──────────────────────────────────────────────────────
      .addCase(applyToJobThunk.pending, (state) => {
        state.applyLoading = true;
        state.error = null;
      })
      .addCase(applyToJobThunk.fulfilled, (state, action) => {
        state.applyLoading = false;
        state.myApplications.unshift(action.payload);
        state.successMessage = "Application submitted successfully!";
      })
      .addCase(applyToJobThunk.rejected, (state, action) => {
        state.applyLoading = false;
        state.error = action.payload;
      })

      // ─── Withdraw Application ──────────────────────────────────────────────
      .addCase(withdrawApplicationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(withdrawApplicationThunk.fulfilled, (state, action) => {
        state.loading = false;
        const withdrawnId = action.payload;
        state.myApplications = state.myApplications.filter(
          (app) => app.id !== withdrawnId && app.applicationId !== withdrawnId
        );
        state.successMessage = "Application withdrawn successfully";
      })
      .addCase(withdrawApplicationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─── Fetch My Applications ──────────────────────────────────────────────
      .addCase(fetchMyApplicationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyApplicationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const pageData = action.payload;
        if (pageData?.content) {
          state.myApplicationsPage = pageData;
          state.myApplications = pageData.content;
        } else if (Array.isArray(pageData)) {
          state.myApplications = pageData;
        }
      })
      .addCase(fetchMyApplicationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─── Fetch Job Applications (Recruiter) ────────────────────────────────
      .addCase(fetchJobApplicationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobApplicationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload;
        const pageData = res?.data ?? res;
        if (pageData?.content) {
          state.jobApplicationsPage = pageData;
          state.jobApplications = pageData.content;
        } else if (Array.isArray(pageData)) {
          state.jobApplications = pageData;
        } else {
          state.jobApplications = [];
        }
      })
      .addCase(fetchJobApplicationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─── Fetch All Recruiter Applications (Across all jobs) ─────────────────
      .addCase(fetchAllRecruiterApplicationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecruiterApplicationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const res = action.payload;
        const pageData = res?.data ?? res;
        if (pageData?.content) {
          state.jobApplicationsPage = pageData;
          state.jobApplications = pageData.content;
        } else if (Array.isArray(pageData)) {
          state.jobApplications = pageData;
        } else {
          state.jobApplications = [];
        }
      })
      .addCase(fetchAllRecruiterApplicationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─── Update Application Status (Recruiter) ──────────────────────────────
      .addCase(updateApplicationStatusThunk.pending, (state) => {
        state.updateStatusLoading = true;
        state.error = null;
      })
      .addCase(updateApplicationStatusThunk.fulfilled, (state, action) => {
        state.updateStatusLoading = false;
        const updated = action.payload;
        const index = state.jobApplications.findIndex(
          (app) => app.id === updated.id || app.applicationId === updated.applicationId
        );
        if (index !== -1) {
          state.jobApplications[index] = updated;
        }
        if (state.selectedApplication?.id === updated.id) {
          state.selectedApplication = updated;
        }
        state.successMessage = "Application status updated successfully";
      })
      .addCase(updateApplicationStatusThunk.rejected, (state, action) => {
        state.updateStatusLoading = false;
        state.error = action.payload;
      })

      // ─── Fetch Recruiter Dashboard Stats ────────────────────────────────────
      .addCase(fetchRecruiterDashboardStatsThunk.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      });
  },
});

export const {
  setSelectedApplication,
  clearApplicationError,
  clearApplicationSuccess,
} = applicationSlice.actions;

export default applicationSlice.reducer;
