package com.jobportal.resumeanalysis.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.jobportal.dto.response.ApiResponse;
import com.jobportal.resumeanalysis.dto.ResumeAnalysisResponse;
import com.jobportal.resumeanalysis.service.ResumeAnalysisService;

@RestController
@RequestMapping("/api/resume-analysis")
public class ResumeAnalysisController {

    private final ResumeAnalysisService analysisService;

    public ResumeAnalysisController(ResumeAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    /**
     * Analyze Resume
     * POST /api/resume-analysis/{resumeId}
     */
    @PostMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> analyzeResume(
            @PathVariable Long resumeId,
            @RequestParam(defaultValue = "false") boolean forceReanalyze,
            Authentication authentication) {

        ResumeAnalysisResponse response = analysisService.analyzeResume(
                resumeId,
                authentication.getName(),
                forceReanalyze);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get Latest Analysis
     * GET /api/resume-analysis/{resumeId}
     */
    @GetMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> getLatestAnalysis(
            @PathVariable Long resumeId,
            Authentication authentication) {

        ResumeAnalysisResponse response = analysisService.getLatestAnalysis(
                resumeId,
                authentication.getName());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Delete Analysis
     * DELETE /api/resume-analysis/{resumeId}
     */
    @DeleteMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteAnalysis(
            @PathVariable Long resumeId,
            Authentication authentication) {

        analysisService.deleteAnalysis(
                resumeId,
                authentication.getName());

        return ResponseEntity.ok(
                ApiResponse.message("Resume analysis deleted successfully.")
        );
    }
}