/**
 * src/State/resumeSlice.js
 *
 * Redux slice for candidate resumes matching Spring Boot ResumeController.
 */

import { createSlice } from "@reduxjs/toolkit";
import {
  uploadResumeThunk,
  fetchMyResumesThunk,
  fetchResumeByIdThunk,
  updateResumeThunk,
  deleteResumeThunk,
  setDefaultResumeThunk,
} from "./resumeThunk";

const initialState = {
  resumes: [],
  defaultResume: null,
  selectedResume: null,
  loading: false,
  uploadLoading: false,
  error: null,
  success: false,
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    clearResumeError: (state) => {
      state.error = null;
    },
    clearResumeSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch My Resumes ──
      .addCase(fetchMyResumesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyResumesThunk.fulfilled, (state, action) => {
        state.loading = false;
        const list = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
        state.resumes = list;
        state.defaultResume = list.find((r) => r.isDefault) || list[0] || null;
      })
      .addCase(fetchMyResumesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Upload Resume ──
      .addCase(uploadResumeThunk.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
      })
      .addCase(uploadResumeThunk.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.success = true;
        const newResume = action.payload;
        if (newResume) {
          state.resumes.unshift(newResume);
          if (newResume.isDefault || state.resumes.length === 1) {
            state.resumes = state.resumes.map((r) => ({
              ...r,
              isDefault: r.id === newResume.id,
            }));
            state.defaultResume = newResume;
          }
        }
      })
      .addCase(uploadResumeThunk.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
      })

      // ── Get Resume By Id ──
      .addCase(fetchResumeByIdThunk.fulfilled, (state, action) => {
        state.selectedResume = action.payload;
      })

      // ── Update Resume Metadata ──
      .addCase(updateResumeThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          state.resumes = state.resumes.map((r) =>
            r.id === updated.id ? updated : r
          );
          if (updated.isDefault) {
            state.resumes = state.resumes.map((r) => ({
              ...r,
              isDefault: r.id === updated.id,
            }));
            state.defaultResume = updated;
          }
        }
      })

      // ── Delete Resume ──
      .addCase(deleteResumeThunk.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.resumes = state.resumes.filter((r) => r.id !== deletedId);
        if (state.defaultResume?.id === deletedId) {
          state.defaultResume = state.resumes.find((r) => r.isDefault) || state.resumes[0] || null;
        }
      })

      // ── Set Default Resume ──
      .addCase(setDefaultResumeThunk.fulfilled, (state, action) => {
        const defaultRes = action.payload;
        if (defaultRes) {
          state.resumes = state.resumes.map((r) => ({
            ...r,
            isDefault: r.id === defaultRes.id,
          }));
          state.defaultResume = defaultRes;
        }
      });
  },
});

export const { clearResumeError, clearResumeSuccess } = resumeSlice.actions;
export default resumeSlice.reducer;
