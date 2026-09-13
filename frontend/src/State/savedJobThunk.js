/**
 * src/State/savedJobThunk.js
 *
 * Redux async thunks for Saved Jobs operations matching Spring Boot SavedJobController.
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  saveJobApi,
  unsaveJobApi,
  getMySavedJobsApi,
  isJobSavedApi,
} from "../api/savedJobApi";

const getErrorPayload = (error) =>
  error.response?.data?.message ||
  error.response?.data?.errorMessage ||
  error.userMessage ||
  error.message ||
  "Saved job operation failed.";

/** POST /api/saved-jobs/{jobId} */
export const saveJobThunk = createAsyncThunk(
  "savedJob/saveJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await saveJobApi(jobId);
      const savedData = response?.data !== undefined ? response.data : response;
      return { jobId: Number(jobId), savedData };
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** DELETE /api/saved-jobs/{jobId} */
export const unsaveJobThunk = createAsyncThunk(
  "savedJob/unsaveJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await unsaveJobApi(jobId);
      return Number(jobId);
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** GET /api/saved-jobs/me */
export const fetchMySavedJobsThunk = createAsyncThunk(
  "savedJob/fetchMySavedJobs",
  async ({ page = 0, size = 50, sort = "createdAt,desc" } = {}, { rejectWithValue }) => {
    try {
      const response = await getMySavedJobsApi({ page, size, sort });
      return response;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** GET /api/saved-jobs/{jobId}/check */
export const checkIsJobSavedThunk = createAsyncThunk(
  "savedJob/checkIsJobSaved",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await isJobSavedApi(jobId);
      const isSaved = response?.data !== undefined ? response.data : response;
      return { jobId: Number(jobId), isSaved: Boolean(isSaved) };
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);
