/**
 * src/State/recommendationSlice.js
 *
 * Redux state and thunks for the Applicant Job Recommendation feature.
 *
 * Thunks:
 *   fetchRecommendations  — loads personalised jobs from GET /api/recommendations/jobs
 *
 * State shape:
 *   recommendations[]     — array of scored RecommendedJobResponse objects
 *   loading               — boolean
 *   error                 — string | null
 *   lastFetched           — ISO timestamp of last successful fetch (used to avoid refetching)
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../config/Api";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchRecommendations = createAsyncThunk(
  "recommendations/fetchRecommendations",
  async ({ limit = 20, minMatch = 0 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/recommendations/jobs", {
        params: { limit, minMatch },
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch recommendations.",
        }
      );
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  recommendations: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.recommendations = [];
      state.error = null;
      state.lastFetched = null;
    },
    clearRecommendationError: (state) => {
      state.error = null;
    },
    /** Optimistically toggle the saved field for a single job in the list */
    toggleSavedOptimistic: (state, action) => {
      const jobId = action.payload;
      const job = state.recommendations.find((r) => r.id === jobId);
      if (job) job.saved = !job.saved;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload?.data ?? [];
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to load recommendations.";
      });
  },
});

export const { clearRecommendations, clearRecommendationError, toggleSavedOptimistic } =
  recommendationSlice.actions;

export default recommendationSlice.reducer;
