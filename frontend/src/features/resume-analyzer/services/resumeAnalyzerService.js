/**
 * src/features/resume-analyzer/services/resumeAnalyzerService.js
 * Production Service Layer executing real Spring Boot backend API calls (/api/resumes & /api/resume-analysis).
 */

import { uploadResumeApi, deleteResumeApi, getMyResumesApi } from "../../../api/resumeApi";
import { analyzeResumeApi, getLatestAnalysisApi, deleteAnalysisApi } from "../../../api/resumeAnalysisApi";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ["pdf", "docx"];

export const resumeAnalyzerService = {
  /**
   * Validate file size and extension
   */
  validateFile(file) {
    if (!file) {
      throw new Error("Please select a valid resume file.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error("Invalid file format. Please upload a PDF or DOCX file.");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error("File size exceeds 10MB limit. Please upload a smaller file.");
    }

    return true;
  },

  /**
   * Upload resume to backend API (/api/resumes)
   */
  async uploadResume(file, onProgress) {
    this.validateFile(file);

    if (onProgress) onProgress(30);

    const resData = await uploadResumeApi({ file, resumeName: file.name, isDefault: true });

    if (onProgress) onProgress(100);

    // Extract DTO from backend ApiResponse wrapper
    const uploadedInfo = resData?.data || resData;

    return {
      id: uploadedInfo.id,
      name: uploadedInfo.resumeName || file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.name.endsWith(".pdf") ? "PDF" : "DOCX",
      uploadedAt: uploadedInfo.uploadedAt || new Date().toISOString(),
    };
  },

  /**
   * Analyze Resume via POST /api/resume-analysis/{resumeId}
   */
  async analyzeResume(resumeInfo, forceReanalyze = false) {
    const resumeId = resumeInfo?.id;
    if (!resumeId) {
      throw new Error("Invalid resume ID for analysis.");
    }

    const response = await analyzeResumeApi(resumeId, forceReanalyze);
    const data = response?.data || response;

    if (!data) {
      throw new Error("Empty response received from analysis server.");
    }

    return {
      ...data,
      resumeName: data.resumeName || resumeInfo?.name,
      fileSize: resumeInfo?.size,
    };
  },

  /**
   * Re-analyze Resume with forceReanalyze=true
   */
  async reAnalyzeResume(resumeInfo) {
    return this.analyzeResume(resumeInfo, true);
  },

  /**
   * Fetch user resumes from GET /api/resumes/me
   */
  async getMyResumes() {
    try {
      const response = await getMyResumesApi();
      const list = response?.data || response || [];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      return [];
    }
  },

  /**
   * Fetch Latest Analysis via GET /api/resume-analysis/{resumeId}
   */
  async getLatestAnalysis(resumeId) {
    if (!resumeId) return null;
    try {
      const response = await getLatestAnalysisApi(resumeId);
      return response?.data || response;
    } catch (err) {
      return null;
    }
  },

  /**
   * Delete Analysis via DELETE /api/resume-analysis/{resumeId} & DELETE /api/resumes/{resumeId}
   * Uses Promise.allSettled to quietly handle backend record missing/500 errors.
   */
  async deleteAnalysis(resumeId) {
    if (!resumeId) return null;
    try {
      await Promise.allSettled([
        deleteResumeApi(resumeId).catch(() => null),
        deleteAnalysisApi(resumeId).catch(() => null),
      ]);
    } catch (err) {
      // Quietly ignore backend delete failures
    }
    return null;
  },
};
