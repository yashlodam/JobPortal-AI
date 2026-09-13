package com.jobportal.recommendation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.response.ApiResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.recommendation.dto.RecommendedJobResponse;
import com.jobportal.recommendation.service.JobRecommendationService;

/**
 * REST controller for the applicant-facing job recommendation feed.
 *
 * <h3>Endpoint</h3>
 * {@code GET /api/recommendations/jobs}
 *
 * <h3>Access Control</h3>
 * Requires an authenticated session (HttpOnly JWT cookie). Applicants only.
 * Recruiters and Admins who call this endpoint will get scored recommendations
 * based on any profile data they have — this is harmless but unlikely in practice.
 *
 * <h3>Query Parameters</h3>
 * <ul>
 *   <li>{@code limit}       — number of results to return (1–30, default 10)</li>
 *   <li>{@code minMatch}    — minimum match percentage filter (0–100, default 0)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/recommendations")
public class JobRecommendationController {

    private final JobRecommendationService recommendationService;

    public JobRecommendationController(JobRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * Returns a personalised list of recommended jobs for the authenticated applicant.
     *
     * <p>Jobs are scored using the deterministic engine (skill match, experience,
     * location, freshness, title affinity, and urgency/featured/easyApply boosts)
     * and sorted by composite score descending.
     *
     * @param limit    number of top recommendations to return (default 20, max 50)
     * @param minMatch minimum match percentage to include (default 0)
     * @param authentication injected by Spring Security from the JWT cookie
     * @return list of scored job recommendations with match metadata
     */
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<RecommendedJobResponse>>> getRecommendedJobs(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0")  int minMatch,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authentication required"));
        }

        String email = authentication.getName();
        List<RecommendedJobResponse> recommendations =
                recommendationService.getRecommendations(email, limit, minMatch);

        String message = recommendations.isEmpty()
                ? "Complete your profile with skills to see personalised recommendations"
                : "Found " + recommendations.size() + " recommended jobs for you";

        return ResponseEntity.ok(ApiResponse.success(message, recommendations));
    }

    /**
     * Returns the real-time AI match score and breakdown for a single job against the authenticated applicant.
     *
     * @param jobId          the job ID to evaluate
     * @param resumeId       optional resume ID selected by the applicant
     * @param authentication injected by Spring Security
     * @return scored job recommendation response with real match score and breakdown
     */
    @GetMapping("/jobs/{jobId}/match")
    public ResponseEntity<ApiResponse<RecommendedJobResponse>> getJobMatch(
            @PathVariable Long jobId,
            @RequestParam(required = false) Long resumeId,
            Authentication authentication) throws JobPortalException {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Authentication required"));
        }

        String email = authentication.getName();
        RecommendedJobResponse matchResponse =
                recommendationService.getJobMatch(jobId, resumeId, email);

        return ResponseEntity.ok(ApiResponse.success("Job match calculated successfully", matchResponse));
    }
}
