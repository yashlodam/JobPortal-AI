package com.jobportal.resumebuilder.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.response.ApiResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.resumebuilder.dto.ResumeCreateRequest;
import com.jobportal.resumebuilder.dto.ResumeDocumentResponse;
import com.jobportal.resumebuilder.dto.ResumeUpdateRequest;
import com.jobportal.resumebuilder.dto.SectionReorderRequest;
import com.jobportal.resumebuilder.service.ResumeBuilderService;

import jakarta.validation.Valid;

/**
 * Controller exposing REST APIs for live structured resume building, autosave, duplication, and reordering.
 */
@RestController
@RequestMapping("/api/resume-builder")
public class ResumeBuilderController {

    private final ResumeBuilderService resumeService;
    private final com.jobportal.resumebuilder.service.AiResumeBuilderService aiResumeService;
    private final com.jobportal.resumeanalysis.service.AiResumeAnalyzerService aiAnalyzerService;
    private final com.jobportal.resumebuilder.adapter.ResumeBuilderTextConverter textConverter;
    private final com.jobportal.resumebuilder.repository.ResumeDocumentRepository resumeRepository;

    public ResumeBuilderController(ResumeBuilderService resumeService,
                                  com.jobportal.resumebuilder.service.AiResumeBuilderService aiResumeService,
                                  com.jobportal.resumeanalysis.service.AiResumeAnalyzerService aiAnalyzerService,
                                  com.jobportal.resumebuilder.adapter.ResumeBuilderTextConverter textConverter,
                                  com.jobportal.resumebuilder.repository.ResumeDocumentRepository resumeRepository) {
        this.resumeService = resumeService;
        this.aiResumeService = aiResumeService;
        this.aiAnalyzerService = aiAnalyzerService;
        this.textConverter = textConverter;
        this.resumeRepository = resumeRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResumeDocumentResponse>> createResume(
            @Valid @RequestBody ResumeCreateRequest request,
            Authentication authentication) throws JobPortalException {

        ResumeDocumentResponse response = resumeService.createResume(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeDocumentResponse>>> getUserResumes(
            Authentication authentication) throws JobPortalException {

        List<ResumeDocumentResponse> list = resumeService.getUserResumes(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Resumes fetched successfully", list));
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeDocumentResponse>> getResumeById(
            @PathVariable Long resumeId,
            Authentication authentication) throws JobPortalException {

        ResumeDocumentResponse response = resumeService.getResumeById(resumeId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Resume details fetched successfully", response));
    }

    @PutMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<ResumeDocumentResponse>> updateResume(
            @PathVariable Long resumeId,
            @Valid @RequestBody ResumeUpdateRequest request,
            Authentication authentication) throws JobPortalException {

        ResumeDocumentResponse response = resumeService.updateResume(resumeId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Resume updated successfully", response));
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @PathVariable Long resumeId,
            Authentication authentication) throws JobPortalException {

        resumeService.deleteResume(resumeId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully", null));
    }

    @PostMapping("/{resumeId}/duplicate")
    public ResponseEntity<ApiResponse<ResumeDocumentResponse>> duplicateResume(
            @PathVariable Long resumeId,
            Authentication authentication) throws JobPortalException {

        ResumeDocumentResponse response = resumeService.duplicateResume(resumeId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume duplicated successfully", response));
    }

    @PutMapping("/{resumeId}/reorder")
    public ResponseEntity<ApiResponse<ResumeDocumentResponse>> reorderSection(
            @PathVariable Long resumeId,
            @Valid @RequestBody SectionReorderRequest request,
            Authentication authentication) throws JobPortalException {

        ResumeDocumentResponse response = resumeService.reorderSection(resumeId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Section reordered successfully", response));
    }

    // ── Spring AI Feature Endpoints ───────────────────────────────────────────

    @PostMapping("/{resumeId}/ai/summary")
    public ResponseEntity<ApiResponse<com.jobportal.resumebuilder.dto.AiSummaryResponse>> generateAiSummary(
            @PathVariable Long resumeId,
            Authentication authentication) throws JobPortalException {

        com.jobportal.resumebuilder.dto.AiSummaryResponse response = aiResumeService.generateProfessionalSummary(resumeId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("AI summary generated successfully", response));
    }

    @PostMapping("/{resumeId}/ai/improve")
    public ResponseEntity<ApiResponse<com.jobportal.resumebuilder.dto.AiImprovementResponse>> improveContent(
            @PathVariable Long resumeId,
            @Valid @RequestBody com.jobportal.resumebuilder.dto.AiImprovementRequest request,
            Authentication authentication) throws JobPortalException {

        com.jobportal.resumebuilder.dto.AiImprovementResponse response = aiResumeService.improveContent(resumeId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Content improved successfully", response));
    }

    @PostMapping("/{resumeId}/ai/skills")
    public ResponseEntity<ApiResponse<com.jobportal.resumebuilder.dto.AiSkillSuggestionResponse>> suggestSkills(
            @PathVariable Long resumeId,
            Authentication authentication) throws JobPortalException {

        com.jobportal.resumebuilder.dto.AiSkillSuggestionResponse response = aiResumeService.suggestSkills(resumeId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Skill suggestions generated successfully", response));
    }

    // ── Integration with AI Resume Analyzer ───────────────────────────────────

    @PostMapping("/{resumeId}/analyze")
    public ResponseEntity<ApiResponse<com.jobportal.resumeanalysis.dto.AiAnalysisResult>> analyzeBuilderResume(
            @PathVariable Long resumeId,
            Authentication authentication) throws JobPortalException {

        ResumeDocumentResponse builderDoc = resumeService.getResumeById(resumeId, authentication.getName());
        com.jobportal.resumebuilder.entity.ResumeDocument docEntity = resumeRepository.findById(builderDoc.getId()).orElseThrow();
        String plainText = textConverter.toPlainText(docEntity);

        com.jobportal.resumeanalysis.dto.AiAnalysisResult result = aiAnalyzerService.analyze(plainText);
        return ResponseEntity.ok(ApiResponse.success("Builder resume analyzed successfully", result));
    }
}
