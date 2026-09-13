package com.jobportal.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.dto.request.ResumeUpdateRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.ResumeResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.ResumeService;

import jakarta.validation.Valid;

/**
 * Controller for managing candidate resumes.
 * Supports multi-resume uploads, listing, metadata updates, and default resume selection.
 */
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    /**
     * Upload a new resume file with optional resume name and default flag.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "resumeName", required = false) String resumeName,
            @RequestParam(value = "isDefault", required = false) Boolean isDefault,
            Authentication authentication) throws Exception {
        ResumeResponse response = resumeService.uploadResume(file, resumeName, isDefault, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume uploaded successfully", response));
    }

    /**
     * Get all resumes belonging to the authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> getMyResumes(
            Authentication authentication) throws JobPortalException {
        List<ResumeResponse> resumes = resumeService.getMyResumes(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(resumes));
    }

    /**
     * Get details of a specific resume by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> getResumeById(
            @PathVariable Long id,
            Authentication authentication) throws JobPortalException {
        ResumeResponse response = resumeService.getResumeById(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update resume metadata (e.g. name or default status).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> updateResume(
            @PathVariable Long id,
            @Valid @RequestBody ResumeUpdateRequest request,
            Authentication authentication) throws JobPortalException {
        ResumeResponse response = resumeService.updateResume(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Resume updated successfully", response));
    }

    /**
     * Delete a specific resume.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @PathVariable Long id,
            Authentication authentication) throws JobPortalException {
        resumeService.deleteResume(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Resume deleted successfully"));
    }

    /**
     * Set a specific resume as the candidate's default resume.
     */
    @PutMapping("/{id}/default")
    public ResponseEntity<ApiResponse<ResumeResponse>> setDefaultResume(
            @PathVariable Long id,
            Authentication authentication) throws JobPortalException {
        ResumeResponse response = resumeService.setDefaultResume(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Default resume updated successfully", response));
    }
}
