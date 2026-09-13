package com.jobportal.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.domain.RecruiterStatus;
import com.jobportal.dto.request.AdminReviewRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.RecruiterAdminSummaryResponse;
import com.jobportal.dto.response.RecruiterVerificationStatusResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.AdminRecruiterService;

import jakarta.validation.Valid;

/**
 * Admin recruiter management REST API.
 *
 * <p><strong>Double-enforced security:</strong>
 * Route-level guard: {@code .requestMatchers("/api/admin/**").hasAuthority("ADMIN")} in SecurityConfig.
 * Method-level guard: {@code @PreAuthorize("hasAuthority('ADMIN')")} on every method.
 * A malicious EMPLOYER/APPLICANT JWT cannot reach any handler even if SecurityConfig is misconfigured.</p>
 *
 * <h3>API Contract</h3>
 * <pre>
 * GET    /api/admin/recruiters                   — list all (optional ?status= filter)
 * GET    /api/admin/recruiters/{id}              — view recruiter detail
 * PATCH  /api/admin/recruiters/{id}/approve      — approve recruiter
 * PATCH  /api/admin/recruiters/{id}/reject       — reject recruiter (reason required)
 * PATCH  /api/admin/recruiters/{id}/suspend      — suspend recruiter (reason required)
 * </pre>
 */
@RestController
@RequestMapping("/api/admin/recruiters")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminRecruiterController {

    private final AdminRecruiterService adminRecruiterService;

    public AdminRecruiterController(AdminRecruiterService adminRecruiterService) {
        this.adminRecruiterService = adminRecruiterService;
    }

    /**
     * List all recruiters, optionally filtered by status.
     *
     * <pre>
     * GET /api/admin/recruiters?status=PENDING_VERIFICATION&page=0&size=20&sort=submittedAt,asc
     * </pre>
     *
     * @param status   optional status filter (PENDING_VERIFICATION, APPROVED, REJECTED, SUSPENDED)
     * @param pageable Spring auto-resolved from request params
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<RecruiterAdminSummaryResponse>>> listRecruiters(
            @RequestParam(required = false) RecruiterStatus status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            Authentication auth) throws JobPortalException {

        Page<RecruiterAdminSummaryResponse> page =
                adminRecruiterService.listRecruiters(status, pageable);

        String message = (status != null)
                ? "Recruiters with status " + status + " retrieved successfully."
                : "All recruiters retrieved successfully.";

        return ResponseEntity.ok(ApiResponse.success(message, page));
    }

    /**
     * View full verification detail for a single recruiter.
     *
     * <pre>
     * GET /api/admin/recruiters/{id}
     * </pre>
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecruiterVerificationStatusResponse>> getRecruiterDetail(
            @PathVariable("id") Long recruiterId,
            Authentication auth) throws JobPortalException {

        RecruiterVerificationStatusResponse detail =
                adminRecruiterService.getRecruiterDetail(recruiterId);

        return ResponseEntity.ok(ApiResponse.success("Recruiter detail retrieved.", detail));
    }

    /**
     * Approve a recruiter.
     *
     * <p>Transitions: PENDING_VERIFICATION → APPROVED. Clears rejection reason.
     * Sends RECRUITER_APPROVED notification to the recruiter.</p>
     *
     * <pre>
     * PATCH /api/admin/recruiters/{id}/approve
     * Content-Type: application/json
     * {}           (reason is optional for approval)
     * </pre>
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<RecruiterAdminSummaryResponse>> approveRecruiter(
            @PathVariable("id") Long recruiterId,
            @Valid @RequestBody(required = false) AdminReviewRequest request,
            Authentication auth) throws JobPortalException {

        String adminEmail = auth.getName();
        RecruiterAdminSummaryResponse result =
                adminRecruiterService.approveRecruiter(recruiterId, adminEmail, request);

        return ResponseEntity.ok(ApiResponse.success(
                "Recruiter approved successfully.", result));
    }

    /**
     * Reject a recruiter.
     *
     * <p>Transitions: PENDING_VERIFICATION → REJECTED. Reason is required.
     * The recruiter can update their info and resubmit.
     * Sends RECRUITER_REJECTED notification with the rejection reason.</p>
     *
     * <pre>
     * PATCH /api/admin/recruiters/{id}/reject
     * Content-Type: application/json
     * { "reason": "Company website is unreachable. Please update your company profile." }
     * </pre>
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<RecruiterAdminSummaryResponse>> rejectRecruiter(
            @PathVariable("id") Long recruiterId,
            @Valid @RequestBody AdminReviewRequest request,
            Authentication auth) throws JobPortalException {

        String adminEmail = auth.getName();
        RecruiterAdminSummaryResponse result =
                adminRecruiterService.rejectRecruiter(recruiterId, adminEmail, request);

        return ResponseEntity.ok(ApiResponse.success(
                "Recruiter rejected. Notification sent with rejection reason.", result));
    }

    /**
     * Suspend a recruiter.
     *
     * <p>Transitions: ANY status → SUSPENDED. Reason is required.
     * All recruiter's OPEN jobs are immediately CLOSED.
     * Sends RECRUITER_SUSPENDED notification to the recruiter.</p>
     *
     * <pre>
     * PATCH /api/admin/recruiters/{id}/suspend
     * Content-Type: application/json
     * { "reason": "Repeated reports of fake job postings." }
     * </pre>
     */
    @PatchMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<RecruiterAdminSummaryResponse>> suspendRecruiter(
            @PathVariable("id") Long recruiterId,
            @Valid @RequestBody AdminReviewRequest request,
            Authentication auth) throws JobPortalException {

        String adminEmail = auth.getName();
        RecruiterAdminSummaryResponse result =
                adminRecruiterService.suspendRecruiter(recruiterId, adminEmail, request);

        return ResponseEntity.ok(ApiResponse.success(
                "Recruiter suspended. All open jobs closed. Notification sent.", result));
    }
}
