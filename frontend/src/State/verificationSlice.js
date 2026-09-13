/**
 * src/State/verificationSlice.js
 *
 * Redux Toolkit Slice for Recruiter Verification and Admin Review System.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getRecruiterVerificationStatusApi,
  submitRecruiterVerificationApi,
  getAdminRecruitersApi,
  getAdminRecruiterDetailsApi,
  approveRecruiterApi,
  rejectRecruiterApi,
  suspendRecruiterApi,
} from "../api/verificationApi";
import { getUserProfile } from "./AuthSlic";

// ─── Recruiter Thunks ──────────────────────────────────────────────────────────

export const fetchVerificationStatus = createAsyncThunk(
  "verification/fetchVerificationStatus",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getRecruiterVerificationStatusApi();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.userMessage ||
        "Failed to fetch verification status"
      );
    }
  }
);

export const submitVerification = createAsyncThunk(
  "verification/submitVerification",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const data = await submitRecruiterVerificationApi(formData);
      // Re-fetch user profile to sync global auth state seamlessly
      dispatch(getUserProfile());
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.userMessage ||
        "Failed to submit verification details"
      );
    }
  }
);

// ─── Admin Thunks ─────────────────────────────────────────────────────────────

export const fetchAdminRecruiters = createAsyncThunk(
  "verification/fetchAdminRecruiters",
  async (params, { rejectWithValue }) => {
    try {
      const data = await getAdminRecruitersApi(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.userMessage ||
        "Failed to fetch recruiters list"
      );
    }
  }
);

export const fetchAdminRecruiterDetails = createAsyncThunk(
  "verification/fetchAdminRecruiterDetails",
  async (id, { rejectWithValue }) => {
    try {
      const data = await getAdminRecruiterDetailsApi(id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.userMessage ||
        "Failed to fetch recruiter details"
      );
    }
  }
);

export const approveRecruiter = createAsyncThunk(
  "verification/approveRecruiter",
  async (payload, { rejectWithValue }) => {
    try {
      const id = typeof payload === "object" ? payload.id || payload.recruiterId || payload.userId : payload;
      const reason = typeof payload === "object" ? payload.reason : undefined;
      const data = await approveRecruiterApi(id, reason);
      return { id, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.userMessage ||
        "Failed to approve recruiter"
      );
    }
  }
);

export const rejectRecruiter = createAsyncThunk(
  "verification/rejectRecruiter",
  async (payload, { rejectWithValue }) => {
    try {
      const id = typeof payload === "object" ? payload.id || payload.recruiterId || payload.userId : payload;
      const reason = typeof payload === "object" ? payload.reason : undefined;
      const data = await rejectRecruiterApi(id, reason);
      return { id, reason, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.userMessage ||
        "Failed to reject recruiter"
      );
    }
  }
);

export const suspendRecruiter = createAsyncThunk(
  "verification/suspendRecruiter",
  async (payload, { rejectWithValue }) => {
    try {
      const id = typeof payload === "object" ? payload.id || payload.recruiterId || payload.userId : payload;
      const reason = typeof payload === "object" ? payload.reason : undefined;
      const data = await suspendRecruiterApi(id, reason);
      return { id, reason, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.userMessage ||
        "Failed to suspend recruiter"
      );
    }
  }
);

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState = {
  // Recruiter Verification Info
  recruiterVerification: null,
  verificationLoading: false,
  verificationSubmitting: false,
  verificationError: null,

  // Admin Review State
  adminRecruiters: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    pageSize: 10,
  },
  selectedRecruiter: null,
  adminLoading: false,
  actionLoading: false,
  adminError: null,
  successMessage: null,
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const verificationSlice = createSlice({
  name: "verification",
  initialState,
  reducers: {
    clearVerificationErrors: (state) => {
      state.verificationError = null;
      state.adminError = null;
      state.successMessage = null;
    },
    setSelectedRecruiter: (state, action) => {
      state.selectedRecruiter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── fetchVerificationStatus
    builder
      .addCase(fetchVerificationStatus.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
      })
      .addCase(fetchVerificationStatus.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.recruiterVerification = action.payload;
      })
      .addCase(fetchVerificationStatus.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload;
      });

    // ── submitVerification
    builder
      .addCase(submitVerification.pending, (state) => {
        state.verificationSubmitting = true;
        state.verificationError = null;
      })
      .addCase(submitVerification.fulfilled, (state, action) => {
        state.verificationSubmitting = false;
        state.recruiterVerification = action.payload;
        state.successMessage = "Verification details submitted successfully.";
      })
      .addCase(submitVerification.rejected, (state, action) => {
        state.verificationSubmitting = false;
        state.verificationError = action.payload;
      });

    // ── fetchAdminRecruiters
    builder
      .addCase(fetchAdminRecruiters.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminRecruiters.fulfilled, (state, action) => {
        state.adminLoading = false;
        if (Array.isArray(action.payload)) {
          state.adminRecruiters = {
            content: action.payload,
            totalElements: action.payload.length,
            totalPages: 1,
            pageNumber: 0,
            pageSize: action.payload.length,
          };
        } else if (action.payload?.content) {
          state.adminRecruiters = action.payload;
        } else {
          state.adminRecruiters = {
            content: action.payload?.data || [],
            totalElements: action.payload?.totalElements || 0,
            totalPages: action.payload?.totalPages || 1,
            pageNumber: action.payload?.pageNumber || 0,
            pageSize: action.payload?.pageSize || 10,
          };
        }
      })
      .addCase(fetchAdminRecruiters.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      });

    // ── fetchAdminRecruiterDetails
    builder
      .addCase(fetchAdminRecruiterDetails.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(fetchAdminRecruiterDetails.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedRecruiter = action.payload;
      })
      .addCase(fetchAdminRecruiterDetails.rejected, (state, action) => {
        state.actionLoading = false;
        state.adminError = action.payload;
      });

    // ── approveRecruiter
    builder
      .addCase(approveRecruiter.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(approveRecruiter.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Recruiter approved successfully.";
        const { id } = action.payload;
        state.adminRecruiters.content = state.adminRecruiters.content.map((r) =>
          (r.recruiterId === id || r.id === id || r.userId === id || r._id === id)
            ? { ...r, verificationStatus: "APPROVED", status: "APPROVED", isActive: true, is_active: true }
            : r
        );
        if (state.selectedRecruiter && (state.selectedRecruiter.recruiterId === id || state.selectedRecruiter.id === id || state.selectedRecruiter.userId === id)) {
          state.selectedRecruiter.verificationStatus = "APPROVED";
          state.selectedRecruiter.status = "APPROVED";
          state.selectedRecruiter.isActive = true;
          state.selectedRecruiter.is_active = true;
        }
      })
      .addCase(approveRecruiter.rejected, (state, action) => {
        state.actionLoading = false;
        state.adminError = action.payload;
      });

    // ── rejectRecruiter
    builder
      .addCase(rejectRecruiter.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(rejectRecruiter.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Recruiter verification rejected.";
        const { id, reason } = action.payload;
        state.adminRecruiters.content = state.adminRecruiters.content.map((r) =>
          (r.recruiterId === id || r.id === id || r.userId === id || r._id === id)
            ? { ...r, verificationStatus: "REJECTED", status: "REJECTED", rejectionReason: reason, isActive: false, is_active: false }
            : r
        );
        if (state.selectedRecruiter && (state.selectedRecruiter.recruiterId === id || state.selectedRecruiter.id === id || state.selectedRecruiter.userId === id)) {
          state.selectedRecruiter.verificationStatus = "REJECTED";
          state.selectedRecruiter.status = "REJECTED";
          state.selectedRecruiter.rejectionReason = reason;
          state.selectedRecruiter.isActive = false;
          state.selectedRecruiter.is_active = false;
        }
      })
      .addCase(rejectRecruiter.rejected, (state, action) => {
        state.actionLoading = false;
        state.adminError = action.payload;
      });

    // ── suspendRecruiter
    builder
      .addCase(suspendRecruiter.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(suspendRecruiter.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = "Recruiter account suspended.";
        const { id, reason } = action.payload;
        state.adminRecruiters.content = state.adminRecruiters.content.map((r) =>
          (r.id === id || r.userId === id || r._id === id)
            ? { ...r, verificationStatus: "SUSPENDED", status: "SUSPENDED", suspensionReason: reason }
            : r
        );
        if (state.selectedRecruiter && (state.selectedRecruiter.id === id || state.selectedRecruiter.userId === id)) {
          state.selectedRecruiter.verificationStatus = "SUSPENDED";
          state.selectedRecruiter.status = "SUSPENDED";
          state.selectedRecruiter.suspensionReason = reason;
        }
      })
      .addCase(suspendRecruiter.rejected, (state, action) => {
        state.actionLoading = false;
        state.adminError = action.payload;
      });
  },
});

export const { clearVerificationErrors, setSelectedRecruiter } = verificationSlice.actions;
export default verificationSlice.reducer;
