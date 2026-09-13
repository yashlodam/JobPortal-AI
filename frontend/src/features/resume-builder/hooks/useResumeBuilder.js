/**
 * src/features/resume-builder/hooks/useResumeBuilder.js
 * Custom hook wrapping Redux dispatch and selectors for AI Resume Builder matching Spring Boot endpoints.
 */

import { useSelector, useDispatch } from "react-redux";
import {
  setViewMode,
  setActiveSection,
  setSelectedTemplate,
  setCurrentResume,
  updatePersonalInfo,
  updateSummary,
  updateExperience,
  updateEducation,
  updateProjects,
  updateSkills,
  updateCertifications,
  updateAchievements,
  updateLanguages,
  updateCustomSections,
  clearAISuggestion,
  applyAISuggestion,
  createNewBlankResume,
  fetchResumesThunk,
  createResumeThunk,
  updateResumeThunk,
  deleteResumeThunk,
  duplicateResumeThunk,
  generateAiSummaryThunk,
  improveContentThunk,
  suggestSkillsThunk,
  analyzeBuilderResumeThunk,
} from "../slices/resumeBuilderSlice";

export function useResumeBuilder() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.resumeBuilder);

  return {
    ...state,
    setViewMode: (mode) => dispatch(setViewMode(mode)),
    setActiveSection: (sec) => dispatch(setActiveSection(sec)),
    setSelectedTemplate: (tpl) => dispatch(setSelectedTemplate(tpl)),
    setCurrentResume: (res) => dispatch(setCurrentResume(res)),
    updatePersonalInfo: (data) => dispatch(updatePersonalInfo(data)),
    updateSummary: (text) => dispatch(updateSummary(text)),
    updateExperience: (items) => dispatch(updateExperience(items)),
    updateEducation: (items) => dispatch(updateEducation(items)),
    updateProjects: (items) => dispatch(updateProjects(items)),
    updateSkills: (data) => dispatch(updateSkills(data)),
    updateCertifications: (items) => dispatch(updateCertifications(items)),
    updateAchievements: (items) => dispatch(updateAchievements(items)),
    updateLanguages: (items) => dispatch(updateLanguages(items)),
    updateCustomSections: (items) => dispatch(updateCustomSections(items)),
    clearAISuggestion: () => dispatch(clearAISuggestion()),
    applyAISuggestion: () => dispatch(applyAISuggestion()),
    createNewBlankResume: (params) => dispatch(createNewBlankResume(params)),

    fetchResumes: () => dispatch(fetchResumesThunk()),
    createResume: (data) => dispatch(createResumeThunk(data)),
    updateResume: (params) => dispatch(updateResumeThunk(params)),
    deleteResume: (id) => dispatch(deleteResumeThunk(id)),
    duplicateResume: (id) => dispatch(duplicateResumeThunk(id)),
    generateAiSummary: (resumeId) => dispatch(generateAiSummaryThunk(resumeId)),
    improveContent: (params) => dispatch(improveContentThunk(params)),
    suggestSkills: (resumeId) => dispatch(suggestSkillsThunk(resumeId)),
    analyzeBuilderResume: (resumeId) => dispatch(analyzeBuilderResumeThunk(resumeId)),
  };
}
