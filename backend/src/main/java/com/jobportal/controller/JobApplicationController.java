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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.request.JobApplicationRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.JobApplicationResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.JobApplicationService;

import jakarta.validation.Valid;

/**
 * Applicant Job Application controller — applicant-facing endpoints only.
 *
 * <p>Handles applying to jobs, withdrawing applications, and viewing own submissions.</p>
 *
 * <p>Recruiter-side operations (viewing applicants for a job, updating status)
 * have been moved to {@link RecruiterController} at {@code /api/recruiter}.</p>
 *
 * <p>All endpoints require authentication.</p>
 */
@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    /**
     * Apply to a job. Only APPLICANT account type is allowed.
     * If no resumeId is provided, the applicant's default resume is used.
     */
    @PostMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> applyToJob(
            @PathVariable Long jobId,
            @Valid @RequestBody JobApplicationRequest request,
            Authentication authentication) throws JobPortalException {
        JobApplicationResponse response = jobApplicationService.applyToJob(
                jobId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application submitted successfully", response));
    }

    /**
     * Withdraw an application. Only the applicant who submitted it can withdraw.
     * Decrements the job's total applicant count atomically.
     */
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<ApiResponse<Void>> withdrawApplication(
            @PathVariable Long applicationId,
            Authentication authentication) throws JobPortalException {
        jobApplicationService.withdrawApplication(applicationId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Application withdrawn successfully"));
    }

    /**
     * Get all applications submitted by the authenticated applicant.
     * Paginated by creation date. Returns company name, job title, status, and resume info.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<JobApplicationResponse>>> getMyApplications(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                jobApplicationService.getMyApplications(authentication.getName(), pageable)));
    }
}
