package com.jobportal.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.SavedJobResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.SavedJobService;

/**
 * Saved Job controller — save, unsave, list saved jobs.
 * All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/saved-jobs")
public class SavedJobController {

    private final SavedJobService savedJobService;

    public SavedJobController(SavedJobService savedJobService) {
        this.savedJobService = savedJobService;
    }

    /**
     * Save a job. Returns 409 if already saved.
     */
    @PostMapping("/{jobId}")
    public ResponseEntity<ApiResponse<SavedJobResponse>> saveJob(
            @PathVariable Long jobId,
            Authentication authentication) throws JobPortalException {
        SavedJobResponse response = savedJobService.saveJob(jobId, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job saved successfully", response));
    }

    /**
     * Unsave a job.
     */
    @DeleteMapping("/{jobId}")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(
            @PathVariable Long jobId,
            Authentication authentication) throws JobPortalException {
        savedJobService.unsaveJob(jobId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Job removed from saved list"));
    }

    /**
     * Get all saved jobs for the authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<SavedJobResponse>>> getMySavedJobs(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                savedJobService.getMySavedJobs(authentication.getName(), pageable)));
    }

    /**
     * Check if a specific job is saved by the authenticated user.
     */
    @GetMapping("/{jobId}/check")
    public ResponseEntity<ApiResponse<Boolean>> isJobSaved(
            @PathVariable Long jobId,
            Authentication authentication) throws JobPortalException {
        boolean saved = savedJobService.isJobSaved(jobId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(saved));
    }
}
