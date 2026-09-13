/**
 * src/State/resumeThunk.js
 *
 * Redux async thunks for candidate resume operations.
 * Calls resumeApi endpoints under /api/resumes.
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  uploadResumeApi,
  getMyResumesApi,
  getResumeByIdApi,
  updateResumeApi,
  deleteResumeApi,
  setDefaultResumeApi,
} from "../api/resumeApi";

const getErrorPayload = (error) =>
  error.response?.data?.message ||
  error.response?.data?.errorMessage ||
  error.message ||
  "Resume operation failed.";

/** POST /api/resumes — upload new resume */
export const uploadResumeThunk = createAsyncThunk(
  "resume/uploadResume",
  async ({ file, resumeName, isDefault }, { rejectWithValue }) => {
    try {
      const response = await uploadResumeApi({ file, resumeName, isDefault });
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** GET /api/resumes/me — get all resumes for current user */
export const fetchMyResumesThunk = createAsyncThunk(
  "resume/fetchMyResumes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyResumesApi();
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** GET /api/resumes/{id} — get resume details */
export const fetchResumeByIdThunk = createAsyncThunk(
  "resume/fetchResumeById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await getResumeByIdApi(id);
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** PUT /api/resumes/{id} — update resume metadata */
export const updateResumeThunk = createAsyncThunk(
  "resume/updateResume",
  async ({ id, resumeName, isDefault }, { rejectWithValue }) => {
    try {
      const response = await updateResumeApi(id, { resumeName, isDefault });
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** DELETE /api/resumes/{id} — delete resume */
export const deleteResumeThunk = createAsyncThunk(
  "resume/deleteResume",
  async (id, { rejectWithValue }) => {
    try {
      await deleteResumeApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);

/** PUT /api/resumes/{id}/default — set resume as default */
export const setDefaultResumeThunk = createAsyncThunk(
  "resume/setDefaultResume",
  async (id, { rejectWithValue }) => {
    try {
      const response = await setDefaultResumeApi(id);
      return response.data ?? response;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  }
);
