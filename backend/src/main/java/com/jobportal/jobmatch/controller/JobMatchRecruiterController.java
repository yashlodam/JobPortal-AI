package com.jobportal.jobmatch.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.response.ApiResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.jobmatch.dto.CandidateMatchSummaryDTO;
import com.jobportal.jobmatch.dto.JobMatchResponse;
import com.jobportal.jobmatch.service.JobMatchService;

/**
 * Controller exposing Recruiter endpoints for viewing AI Job Match scores and sorted candidate pipelines.
 */
@RestController
@RequestMapping("/api/recruiter")
public class JobMatchRecruiterController {

    private final JobMatchService jobMatchService;

    public JobMatchRecruiterController(JobMatchService jobMatchService) {
        this.jobMatchService = jobMatchService;
    }

    /**
     * Get detailed match score breakdown for a specific candidate's application.
     */
    @GetMapping("/applications/{applicationId}/match")
    public ResponseEntity<ApiResponse<JobMatchResponse>> getMatchAnalysis(
            @PathVariable Long applicationId,
            Authentication authentication) throws JobPortalException {

        JobMatchResponse response = jobMatchService.getMatchAnalysis(applicationId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Job match analysis fetched successfully", response));
    }

    /**
     * Trigger immediate recalculation of match analysis for an application.
     */
    @PostMapping("/applications/{applicationId}/match/recalculate")
    public ResponseEntity<ApiResponse<JobMatchResponse>> recalculateMatch(
            @PathVariable Long applicationId,
            Authentication authentication) throws JobPortalException {

        JobMatchResponse response = jobMatchService.recalculateMatch(applicationId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Job match analysis recalculated successfully", response));
    }

    /**
     * Get paged candidate list for a job including match percentages (supports sorting by matchPercentage desc).
     */
    @GetMapping("/jobs/{jobId}/candidates-with-match")
    public ResponseEntity<ApiResponse<Page<CandidateMatchSummaryDTO>>> getCandidatesWithMatch(
            @PathVariable Long jobId,
            @PageableDefault(size = 10, sort = "app.createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) throws JobPortalException {

        Page<CandidateMatchSummaryDTO> page = jobMatchService.getCandidateMatchesForJob(jobId, authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Candidates fetched successfully", page));
    }

    /**
     * Get paged candidate list across ALL jobs posted by the recruiter with match percentages.
     */
    @GetMapping("/candidates-with-match")
    public ResponseEntity<ApiResponse<Page<CandidateMatchSummaryDTO>>> getAllCandidatesWithMatch(
            @PageableDefault(size = 20, sort = "app.createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) throws JobPortalException {

        Page<CandidateMatchSummaryDTO> page = jobMatchService.getAllCandidateMatchesForRecruiter(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success("All candidate matches fetched successfully", page));
    }
}
