/**
 * src/features/mock-interview/hooks/useMockInterview.js
 * Custom hook encapsulating Redux dispatchers and selectors for the AI Mock Interview module.
 */

import { useSelector, useDispatch } from "react-redux";
import {
  setActiveTab,
  updateSetupConfig,
  saveAnswer,
  nextQuestion,
  prevQuestion,
  jumpToQuestion,
  startAIInterviewThunk,
  fetchNextQuestionThunk,
  submitAndEvaluateThunk,
  fetchHistoryThunk,
  fetchReportThunk,
  deleteSessionThunk,
  resetSession,
  clearError,
} from "../slices/interviewSlice";

export function useMockInterview() {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.interview);

  return {
    ...state,
    setTab: (tab) => dispatch(setActiveTab(tab)),
    setConfig: (config) => dispatch(updateSetupConfig(config)),
    recordAnswer: (questionId, text) => dispatch(saveAnswer({ questionId, text })),
    goNext: () => dispatch(nextQuestion()),
    goPrev: () => dispatch(prevQuestion()),
    jumpTo: (idx) => dispatch(jumpToQuestion(idx)),
    startInterview: (setupConfig) => dispatch(startAIInterviewThunk(setupConfig)),
    getNextQuestion: (sessionId) => dispatch(fetchNextQuestionThunk(sessionId)),
    evaluateInterview: () => dispatch(submitAndEvaluateThunk()),
    loadHistory: () => dispatch(fetchHistoryThunk()),
    loadReport: (sessionId) => dispatch(fetchReportThunk(sessionId)),
    removeSession: (sessionId) => dispatch(deleteSessionThunk(sessionId)),
    clearInterviewState: () => dispatch(resetSession()),
    dismissError: () => dispatch(clearError()),
  };
}
