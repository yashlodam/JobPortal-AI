/**
 * src/State/recruiterInterviewSlice.js
 *
 * Redux state & thunks for Recruiter Interview Management.
 *
 * State shape:
 *   interviews[]       — full list of scheduled interviews (filtered by active tab)
 *   stats              — { totalScheduled, upcoming, todaysCount, completed, cancelled, noShow }
 *   loading            — boolean (list/stats fetch)
 *   actionLoading      — boolean (schedule/update/cancel operations)
 *   error              — string | null
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getRecruiterInterviewsApi,
  getInterviewStatsApi,
  scheduleInterviewApi,
  updateInterviewApi,
  updateInterviewStatusApi,
  submitInterviewFeedbackApi,
  cancelInterviewApi,
  getInterviewsByApplicationApi,
} from "../api/recruiterInterviewApi";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchInterviews = createAsyncThunk(
  "recruiterInterview/fetchInterviews",
  async (filter = "all", { rejectWithValue }) => {
    try {
      const { data } = await getRecruiterInterviewsApi(filter);
      return data;
    } catch (err) {
      return rejectWithValue(err.userMessage ?? err.response?.data?.message ?? "Failed to load interviews.");
    }
  }
);

export const fetchInterviewStats = createAsyncThunk(
  "recruiterInterview/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getInterviewStatsApi();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? "Failed to load stats.");
    }
  }
);

export const scheduleInterviewThunk = createAsyncThunk(
  "recruiterInterview/schedule",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await scheduleInterviewApi(payload);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.userMessage ?? err.response?.data?.message ?? err.response?.data ?? "Failed to schedule interview."
      );
    }
  }
);

export const updateInterviewThunk = createAsyncThunk(
  "recruiterInterview/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateInterviewApi(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? "Failed to update interview.");
    }
  }
);

export const updateInterviewStatusThunk = createAsyncThunk(
  "recruiterInterview/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await updateInterviewStatusApi(id, status);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? "Failed to update status.");
    }
  }
);

export const submitFeedbackThunk = createAsyncThunk(
  "recruiterInterview/feedback",
  async ({ id, feedback, candidateRating }, { rejectWithValue }) => {
    try {
      const { data } = await submitInterviewFeedbackApi(id, { feedback, candidateRating });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? "Failed to submit feedback.");
    }
  }
);

export const cancelInterviewThunk = createAsyncThunk(
  "recruiterInterview/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await cancelInterviewApi(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.userMessage ?? err.response?.data?.message ?? "Failed to cancel interview.");
    }
  }
);

export const fetchInterviewsByApplicationThunk = createAsyncThunk(
  "recruiterInterview/byApplication",
  async (applicationId, { rejectWithValue }) => {
    try {
      const { data } = await getInterviewsByApplicationApi(applicationId);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? "Failed to load interviews.");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  interviews: [],
  stats: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const recruiterInterviewSlice = createSlice({
  name: "recruiterInterview",
  initialState,
  reducers: {
    clearInterviewError: (state) => { state.error = null; },
    clearInterviews:     (state) => { state.interviews = []; state.stats = null; },

    // Optimistic updates for smoother UX
    updateInterviewInList: (state, action) => {
      const updated = action.payload;
      const idx = state.interviews.findIndex((i) => i.id === updated.id);
      if (idx !== -1) state.interviews[idx] = updated;
    },
    removeInterviewFromList: (state, action) => {
      state.interviews = state.interviews.filter((i) => i.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // ── fetch list ─────────────────────────────────────────────────────────────
    builder
      .addCase(fetchInterviews.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchInterviews.fulfilled, (s, a) => {
        s.loading = false;
        s.interviews = a.payload ?? [];
      })
      .addCase(fetchInterviews.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

    // ── stats ──────────────────────────────────────────────────────────────────
      .addCase(fetchInterviewStats.fulfilled, (s, a) => { s.stats = a.payload; })

    // ── schedule ───────────────────────────────────────────────────────────────
      .addCase(scheduleInterviewThunk.pending,   (s) => { s.actionLoading = true; })
      .addCase(scheduleInterviewThunk.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.interviews.unshift(a.payload);
      })
      .addCase(scheduleInterviewThunk.rejected,  (s, a) => {
        s.actionLoading = false; s.error = a.payload;
      })

    // ── update / status / feedback ─────────────────────────────────────────────
      .addCase(updateInterviewThunk.fulfilled,       (s, a) => {
        const idx = s.interviews.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) s.interviews[idx] = a.payload;
      })
      .addCase(updateInterviewStatusThunk.fulfilled, (s, a) => {
        const idx = s.interviews.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) s.interviews[idx] = a.payload;
      })
      .addCase(submitFeedbackThunk.fulfilled, (s, a) => {
        const idx = s.interviews.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) s.interviews[idx] = a.payload;
      })

    // ── cancel ─────────────────────────────────────────────────────────────────
      .addCase(cancelInterviewThunk.pending,   (s) => { s.actionLoading = true; })
      .addCase(cancelInterviewThunk.fulfilled, (s, a) => {
        s.actionLoading = false;
        const idx = s.interviews.findIndex((i) => i.id === a.payload.id);
        if (idx !== -1) s.interviews[idx] = a.payload;
      })
      .addCase(cancelInterviewThunk.rejected,  (s, a) => {
        s.actionLoading = false; s.error = a.payload;
      });
  },
});

export const {
  clearInterviewError,
  clearInterviews,
  updateInterviewInList,
  removeInterviewFromList,
} = recruiterInterviewSlice.actions;

export default recruiterInterviewSlice.reducer;
