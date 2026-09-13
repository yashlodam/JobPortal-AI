/**
 * src/features/resume-analyzer/hooks/useResumeAnalyzer.js
 * Custom hook providing access to analysis state and action dispatchers.
 */

import { useSelector, useDispatch } from "react-redux";
import {
  uploadResumeOnlyThunk,
  triggerAnalysisThunk,
  fetchLatestAnalysisThunk,
  reAnalyzeResumeThunk,
  deleteResumeThunk,
  setActiveDashboardTab,
  resetAnalysisState,
  deleteResume,
  clearError,
} from "../slices/analysisSlice";

export function useResumeAnalyzer() {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.analysis);

  return {
    ...state,
    uploadResumeOnly: (file) => dispatch(uploadResumeOnlyThunk(file)),
    triggerAnalysis: () => dispatch(triggerAnalysisThunk()),
    fetchLatestAnalysis: (resumeId) => dispatch(fetchLatestAnalysisThunk(resumeId)),
    reAnalyze: () => dispatch(reAnalyzeResumeThunk()),
    setTab: (tab) => dispatch(setActiveDashboardTab(tab)),
    resetState: () => dispatch(resetAnalysisState()),
    removeResume: () => dispatch(deleteResumeThunk()),
    dismissError: () => dispatch(clearError()),
  };
}
