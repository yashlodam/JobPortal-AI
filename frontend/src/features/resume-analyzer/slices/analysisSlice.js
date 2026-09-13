/**
 * src/features/resume-analyzer/slices/analysisSlice.js
 * Redux Toolkit slice managing AI Resume Analyzer state.
 * Implements strict two-step flow & clean resume deletion thunks.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { resumeAnalyzerService } from "../services/resumeAnalyzerService";

// Step 1: Upload Resume File & Auto-Analyze for immediate live data rendering
export const uploadResumeOnlyThunk = createAsyncThunk(
  "analysis/uploadResumeOnlyThunk",
  async (file, { dispatch, rejectWithValue }) => {
    let resumeInfo = null;
    try {
      dispatch(setUploadProgress(10));
      resumeInfo = await resumeAnalyzerService.uploadResume(file, (progress) => {
        dispatch(setUploadProgress(Math.min(progress, 70)));
      });

      // Save uploaded resume info immediately so state is preserved even if analysis is delayed
      dispatch(setCurrentResume(resumeInfo));

      // Auto-trigger AI Analysis so real-time response data renders immediately without page refresh
      dispatch(setUploadProgress(85));
      const analysisResult = await resumeAnalyzerService.analyzeResume(resumeInfo, true);
      dispatch(setUploadProgress(100));

      return { resumeInfo, analysisResult };
    } catch (error) {
      return rejectWithValue(
        error.userMessage || error.response?.data?.message || error.message || "Failed to upload or analyze resume file"
      );
    }
  }
);

// Step 2: Trigger AI Analysis ONLY when user clicks the "Analyze Resume" button
export const triggerAnalysisThunk = createAsyncThunk(
  "analysis/triggerAnalysisThunk",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { currentResume, analysis } = getState().analysis;
      let resumeInfo = currentResume;
      if (!resumeInfo?.id) {
        const myResumes = await resumeAnalyzerService.getMyResumes();
        if (myResumes && myResumes.length > 0) {
          const defaultResume = myResumes.find((r) => r.isDefault) || myResumes[0];
          resumeInfo = {
            id: defaultResume.id,
            name: defaultResume.resumeName,
            uploadedAt: defaultResume.uploadedAt,
          };
        }
      }
      if (!resumeInfo?.id && analysis?.resumeId) {
        resumeInfo = { id: analysis.resumeId };
      }
      if (!resumeInfo?.id) {
        throw new Error("No uploaded resume found. Please upload a resume file first.");
      }
      const result = await resumeAnalyzerService.analyzeResume(resumeInfo, true);
      return result;
    } catch (error) {
      return rejectWithValue(
        error.userMessage || error.response?.data?.message || error.message || "Failed to analyze resume"
      );
    }
  }
);

export const reAnalyzeResumeThunk = triggerAnalysisThunk;

// Fetch Latest Analysis from Backend API
export const fetchLatestAnalysisThunk = createAsyncThunk(
  "analysis/fetchLatestAnalysisThunk",
  async (targetResumeId, { rejectWithValue }) => {
    try {
      let resumeId = targetResumeId;
      if (!resumeId) {
        const myResumes = await resumeAnalyzerService.getMyResumes();
        if (myResumes && myResumes.length > 0) {
          const defaultResume = myResumes.find((r) => r.isDefault) || myResumes[0];
          resumeId = defaultResume.id;
        }
      }
      if (!resumeId) {
        return null;
      }
      const result = await resumeAnalyzerService.getLatestAnalysis(resumeId);
      return result;
    } catch (error) {
      return rejectWithValue(
        error.userMessage || error.response?.data?.message || error.message || "Failed to fetch analysis"
      );
    }
  }
);

// Delete Resume & Analysis Thunk
export const deleteResumeThunk = createAsyncThunk(
  "analysis/deleteResumeThunk",
  async (_, { getState, dispatch }) => {
    try {
      const { currentResume, analysis } = getState().analysis;
      const resumeId = currentResume?.id || analysis?.resumeId || analysis?.id;
      if (resumeId) {
        await resumeAnalyzerService.deleteAnalysis(resumeId);
      }
    } catch (err) {
      console.warn("[analysisSlice] Delete analysis error:", err);
    } finally {
      dispatch(deleteResume());
    }
  }
);

const initialState = {
  status: "idle", // 'idle' | 'uploading' | 'uploaded' | 'analyzing' | 'success' | 'error'
  uploadProgress: 0,
  currentResume: null,
  analysis: null,
  activeDashboardTab: "overview",
  error: null,
};

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setCurrentResume: (state, action) => {
      state.currentResume = action.payload;
    },
    setActiveDashboardTab: (state, action) => {
      state.activeDashboardTab = action.payload;
    },
    resetAnalysisState: (state) => {
      state.status = "idle";
      state.currentResume = null;
      state.analysis = null;
      state.uploadProgress = 0;
      state.error = null;
    },
    deleteResume: (state) => {
      state.currentResume = null;
      state.analysis = null;
      state.status = "idle";
      state.uploadProgress = 0;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Upload File Only
      .addCase(uploadResumeOnlyThunk.pending, (state) => {
        state.status = "uploading";
        state.analysis = null;
        state.error = null;
      })
      .addCase(uploadResumeOnlyThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.currentResume = action.payload?.resumeInfo || action.payload;
        state.analysis = action.payload?.analysisResult || null;
        state.uploadProgress = 100;
      })
      .addCase(uploadResumeOnlyThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })

      // 2. Trigger AI Analysis on Button Click
      .addCase(triggerAnalysisThunk.pending, (state) => {
        state.status = "analyzing";
        state.analysis = null;
        state.error = null;
      })
      .addCase(triggerAnalysisThunk.fulfilled, (state, action) => {
        state.status = "success";
        state.analysis = action.payload;
        if (action.payload) {
          state.currentResume = {
            id: action.payload.resumeId || action.payload.id || state.currentResume?.id,
            name: action.payload.resumeName || state.currentResume?.name,
            size: action.payload.fileSize || state.currentResume?.size || "",
            uploadedAt: action.payload.analyzedAt || state.currentResume?.uploadedAt,
          };
        }
      })
      .addCase(triggerAnalysisThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })

      // Fetch Latest Analysis
      .addCase(fetchLatestAnalysisThunk.pending, (state) => {
        state.status = "analyzing";
        state.error = null;
      })
      .addCase(fetchLatestAnalysisThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.status = "success";
          state.analysis = action.payload;
          if (!state.currentResume) {
            state.currentResume = {
              id: action.payload.resumeId || action.payload.id,
              name: action.payload.resumeName,
              size: action.payload.fileSize || "",
              uploadedAt: action.payload.analyzedAt,
            };
          }
        } else {
          state.status = "idle";
        }
      })
      .addCase(fetchLatestAnalysisThunk.rejected, (state) => {
        state.status = "idle";
      });
  },
});

export const {
  setUploadProgress,
  setCurrentResume,
  setActiveDashboardTab,
  resetAnalysisState,
  deleteResume,
  clearError,
} = analysisSlice.actions;

export default analysisSlice.reducer;
