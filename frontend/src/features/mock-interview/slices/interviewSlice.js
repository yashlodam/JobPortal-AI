/**
 * src/features/mock-interview/slices/interviewSlice.js
 * Redux Toolkit slice managing AI Mock Interview state using strictly real Spring Boot REST API.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { interviewService } from "../services/interviewService";

// Async Thunks
export const startAIInterviewThunk = createAsyncThunk(
  "interview/startAIInterviewThunk",
  async (setupConfig, { rejectWithValue }) => {
    try {
      const { session, initialQuestions } = await interviewService.startInterview(setupConfig);
      return { setupConfig, session, questions: initialQuestions };
    } catch (error) {
      return rejectWithValue(
        error.userMessage || error.response?.data?.message || error.message || "Failed to start interview session"
      );
    }
  }
);

export const fetchNextQuestionThunk = createAsyncThunk(
  "interview/fetchNextQuestionThunk",
  async (sessionId, { rejectWithValue }) => {
    try {
      const question = await interviewService.getNextQuestion(sessionId);
      return question;
    } catch (error) {
      return rejectWithValue(
        error.userMessage || error.response?.data?.message || error.message || "Failed to fetch next question"
      );
    }
  }
);

export const submitAndEvaluateThunk = createAsyncThunk(
  "interview/submitAndEvaluateThunk",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { sessionId, currentInterview, answers, questions } = getState().interview;
      const targetSessionId = sessionId || currentInterview?.id;

      // Submit all recorded answers
      for (let idx = 0; idx < questions.length; idx++) {
        const q = questions[idx];
        const qId = q?.id ?? q?.questionId ?? idx;
        const rawText = answers[qId] || answers[String(qId)] || answers[q?.orderNumber] || answers[idx] || "";
        const text = typeof rawText === "string" ? rawText.trim() : "";
        await interviewService.submitAnswer(targetSessionId, qId, text);
      }

      // Fetch final complete report from backend
      const report = await interviewService.getReport(targetSessionId);
      return report;
    } catch (error) {
      return rejectWithValue(
        error.userMessage || error.response?.data?.message || error.message || "Failed to evaluate interview session"
      );
    }
  }
);

export const fetchHistoryThunk = createAsyncThunk(
  "interview/fetchHistoryThunk",
  async (_, { rejectWithValue }) => {
    try {
      const history = await interviewService.getHistory();
      return history;
    } catch (error) {
      return rejectWithValue(
        error.userMessage || error.response?.data?.message || error.message || "Failed to fetch interview history"
      );
    }
  }
);

export const fetchReportThunk = createAsyncThunk(
  "interview/fetchReportThunk",
  async (sessionId, { rejectWithValue }) => {
    try {
      const report = await interviewService.getReport(sessionId);
      return report;
    } catch (error) {
      return rejectWithValue(
        error.userMessage || error.response?.data?.message || error.message || "Failed to fetch interview report"
      );
    }
  }
);

export const deleteSessionThunk = createAsyncThunk(
  "interview/deleteSessionThunk",
  async (sessionId, { dispatch }) => {
    try {
      await interviewService.deleteSession(sessionId);
    } catch (err) {
      console.warn("[interviewSlice] Delete session error:", err);
    } finally {
      dispatch(fetchHistoryThunk());
    }
  }
);

const initialState = {
  sessionId: null,
  currentInterview: {
    trackId: "java-fullstack",
    trackTitle: "Java Full Stack Developer",
    difficulty: "INTERMEDIATE",
    interviewType: "TECHNICAL",
    questionCount: 3,
    durationMinutes: 20,
  },
  questions: [],
  answers: {}, // questionId -> text
  currentQuestionIndex: 0,
  score: null,
  loading: "idle", // 'idle' | 'generating' | 'evaluating' | 'success' | 'error'
  error: null,
  evaluation: null,
  history: [],
  activeTab: "landing", // 'landing' | 'setup' | 'live' | 'evaluation' | 'history' | 'report'
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    updateSetupConfig: (state, action) => {
      state.currentInterview = { ...state.currentInterview, ...action.payload };
    },
    saveAnswer: (state, action) => {
      const { questionId, text } = action.payload;
      state.answers[questionId] = text;
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    prevQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    jumpToQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    setEvaluationReport: (state, action) => {
      state.evaluation = action.payload;
      state.score = action.payload?.overallScore;
    },
    resetSession: (state) => {
      state.sessionId = null;
      state.questions = [];
      state.answers = {};
      state.currentQuestionIndex = 0;
      state.evaluation = null;
      state.score = null;
      state.loading = "idle";
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start AI Interview
      .addCase(startAIInterviewThunk.pending, (state) => {
        state.loading = "generating";
        state.error = null;
      })
      .addCase(startAIInterviewThunk.fulfilled, (state, action) => {
        state.loading = "idle";
        state.sessionId = action.payload.session?.id || action.payload.session?.sessionId;
        state.currentInterview = {
          ...state.currentInterview,
          ...action.payload.setupConfig,
          id: state.sessionId,
        };
        state.questions = action.payload.questions || [];
        state.currentQuestionIndex = 0;
        state.answers = {};
        state.activeTab = "live";
      })
      .addCase(startAIInterviewThunk.rejected, (state, action) => {
        state.loading = "error";
        state.error = action.payload;
      })

      // Fetch Next Question
      .addCase(fetchNextQuestionThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const newQ = action.payload;
          const newId = newQ.id ?? newQ.questionId ?? `q-${Date.now()}`;
          if (!state.questions.some((q) => (q.id ?? q.questionId) === newId)) {
            state.questions.push({ ...newQ, id: newId });
          }
        }
      })

      // Submit & Evaluate
      .addCase(submitAndEvaluateThunk.pending, (state) => {
        state.loading = "evaluating";
        state.error = null;
      })
      .addCase(submitAndEvaluateThunk.fulfilled, (state, action) => {
        state.loading = "idle";
        state.evaluation = action.payload;
        state.score = action.payload?.overallScore;
        state.activeTab = "evaluation";
      })
      .addCase(submitAndEvaluateThunk.rejected, (state, action) => {
        state.loading = "error";
        state.error = action.payload;
      })

      // Fetch History
      .addCase(fetchHistoryThunk.fulfilled, (state, action) => {
        state.history = action.payload || [];
      })

      // Fetch Report
      .addCase(fetchReportThunk.fulfilled, (state, action) => {
        state.evaluation = action.payload;
        state.score = action.payload?.overallScore;
      });
  },
});

export const {
  setActiveTab,
  updateSetupConfig,
  saveAnswer,
  nextQuestion,
  prevQuestion,
  jumpToQuestion,
  setEvaluationReport,
  resetSession,
  clearError,
} = interviewSlice.actions;

export default interviewSlice.reducer;
