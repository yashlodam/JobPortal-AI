/**
 * src/State/savedJobSlice.js
 *
 * Redux slice for Saved Jobs feature.
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  saveJobThunk,
  unsaveJobThunk,
  fetchMySavedJobsThunk,
  checkIsJobSavedThunk,
} from "./savedJobThunk";

const initialState = {
  savedJobs: [],
  savedJobIds: [], // Number array of saved job IDs for O(1) card lookups
  isCurrentJobSaved: false,
  loading: false,
  error: null,
  success: false,
};

const savedJobSlice = createSlice({
  name: "savedJob",
  initialState,
  reducers: {
    clearSavedJobError: (state) => {
      state.error = null;
    },
    clearSavedJobSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch My Saved Jobs ──
      .addCase(fetchMySavedJobsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySavedJobsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        // Unwrap ApiResponse if present: payload.data contains Page<SavedJobResponse>
        const dataObj = payload?.data !== undefined ? payload.data : payload;
        const list = Array.isArray(dataObj?.content)
          ? dataObj.content
          : Array.isArray(dataObj)
          ? dataObj
          : Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload)
          ? payload
          : [];

        state.savedJobs = list;
        state.savedJobIds = list
          .map((item) => Number(item.jobId || item.job?.id || item.id))
          .filter((id) => !isNaN(id) && id > 0);
      })
      .addCase(fetchMySavedJobsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Save Job ──
      .addCase(saveJobThunk.fulfilled, (state, action) => {
        state.success = true;
        const { jobId, savedData } = action.payload;
        const numId = Number(jobId);

        if (numId && !state.savedJobIds.includes(numId)) {
          state.savedJobIds.push(numId);
        }

        if (savedData) {
          const exists = state.savedJobs.some(
            (item) => Number(item.jobId || item.job?.id || item.id) === numId
          );
          if (!exists) {
            state.savedJobs.unshift(savedData);
          }
        }
        state.isCurrentJobSaved = true;
      })

      // ── Unsave Job ──
      .addCase(unsaveJobThunk.fulfilled, (state, action) => {
        const jobId = Number(action.payload);
        state.savedJobs = state.savedJobs.filter(
          (item) => Number(item.jobId || item.job?.id || item.id) !== jobId
        );
        state.savedJobIds = state.savedJobIds.filter((id) => Number(id) !== jobId);
        state.isCurrentJobSaved = false;
      })

      // ── Check Is Job Saved ──
      .addCase(checkIsJobSavedThunk.fulfilled, (state, action) => {
        const { jobId, isSaved } = action.payload;
        state.isCurrentJobSaved = isSaved;
        const numId = Number(jobId);
        if (isSaved && !state.savedJobIds.includes(numId)) {
          state.savedJobIds.push(numId);
        } else if (!isSaved) {
          state.savedJobIds = state.savedJobIds.filter((id) => Number(id) !== numId);
        }
      });
  },
});

export const { clearSavedJobError, clearSavedJobSuccess } = savedJobSlice.actions;
export default savedJobSlice.reducer;
