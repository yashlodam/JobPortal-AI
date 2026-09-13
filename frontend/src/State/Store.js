/**
 * src/State/Store.js
 *
 * Redux store — single source of truth for the application.
 *
 * Slices registered:
 *  auth    → src/State/AuthSlic.js    (authentication, JWT, user identity)
 *  profile → src/State/profileSlice.js (all profile sections + images)
 *
 * Exports:
 *  store          — configured Redux store (consumed by <Provider> in main.jsx)
 *  useAppDispatch — typed dispatch hook  (use in all components)
 *  useAppSelector — typed selector hook  (use in all components)
 */

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import authReducer    from "./AuthSlic";
import profileReducer from "./profileSlice";
import jobSlice from "./JobSlice";
import companySlice from "./CompanySlice";
import applicationReducer from "./applicationSlice";
import resumeReducer from "./resumeSlice";
import savedJobReducer from "./savedJobSlice";
import notificationReducer from "../features/notifications/slices/notificationSlice";
import { notificationApi } from "../features/notifications/api/notificationApi";
import analysisReducer from "../features/resume-analyzer/slices/analysisSlice";
import interviewReducer from "../features/mock-interview/slices/interviewSlice";
import resumeBuilderReducer from "../features/resume-builder/slices/resumeBuilderSlice";
import verificationReducer from "./verificationSlice";
import recommendationReducer from "./recommendationSlice";
import recruiterInterviewReducer from "./recruiterInterviewSlice";

// ─── Root Reducer ─────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  auth:        authReducer,
  profile:     profileReducer,
  resume:      resumeReducer,
  savedJob:    savedJobReducer,
  job:         jobSlice,
  company:     companySlice,
  application: applicationReducer,
  notification: notificationReducer,
  analysis:    analysisReducer,
  interview:   interviewReducer,
  resumeBuilder: resumeBuilderReducer,
  verification: verificationReducer,
  recommendations: recommendationReducer,
  recruiterInterview: recruiterInterviewReducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
});

// ─── Store ────────────────────────────────────────────────────────────────────
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationApi.middleware),
});

// ─── Typed Hooks ──────────────────────────────────────────────────────────────
// Always use these instead of raw useDispatch / useSelector so the entire
// codebase stays consistent and avoids any future type-drift.
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;