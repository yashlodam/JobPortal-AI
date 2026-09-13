package com.jobportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.request.RecruiterVerificationRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.RecruiterVerificationStatusResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.RecruiterVerificationService;

import jakarta.validation.Valid;

/**
 * Recruiter self-service verification API.
 *
 * <p>Both endpoints are available to EMPLOYER accounts regardless of their
 * current {@link com.jobportal.domain.RecruiterStatus}. The service layer
 * applies status-specific business rules (e.g. APPROVED cannot resubmit,
 * SUSPENDED cannot resubmit).</p>
 *
 * <h3>Routes</h3>
 * <pre>
 * GET  /api/recruiter/verification/status   — view current verification status
 * POST /api/recruiter/verification/submit   — submit or resubmit verification
 * </pre>
 */
@RestController
@RequestMapping({"/api/recruiter/verification", "/api/recruiter/verification-status"})
@PreAuthorize("hasAuthority('EMPLOYER')")
public class RecruiterVerificationController {

    private final RecruiterVerificationService verificationService;

    public RecruiterVerificationController(RecruiterVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    /**
     * Returns the recruiter's current verification status.
     *
     * <p>Always accessible regardless of verification status — this is how the
     * recruiter knows they're PENDING, REJECTED, or APPROVED.</p>
     *
     * <pre>
     * GET /api/recruiter/verification
     * GET /api/recruiter/verification/status
     * Authorization: Bearer {JWT}
     * </pre>
     */
    @GetMapping({"", "/status"})
    public ResponseEntity<ApiResponse<RecruiterVerificationStatusResponse>> getVerificationStatus(
            Authentication auth) throws JobPortalException {

        String email = auth.getName();
        RecruiterVerificationStatusResponse response =
                verificationService.getVerificationStatus(email);

        return ResponseEntity.ok(ApiResponse.success(
                "Verification status retrieved successfully.", response));
    }

    /**
     * Submits or resubmits the recruiter's verification information.
     *
     * <p>After a rejection, the recruiter can update their company profile via the
     * company API and then call this endpoint to resubmit. The status is reset to
     * PENDING_VERIFICATION and the admin is notified.</p>
     *
     * <pre>
     * POST /api/recruiter/verification
     * POST /api/recruiter/verification/submit
     * Authorization: Bearer {JWT}
     * Content-Type: application/json
     *
     * {
     *   "designation": "Senior Technical Recruiter",   // optional
     *   "note": "Updated company website as requested" // optional
     * }
     * </pre>
     */
    @PostMapping({"", "/submit"})
    public ResponseEntity<ApiResponse<RecruiterVerificationStatusResponse>> submitVerification(
            @Valid @RequestBody(required = false) RecruiterVerificationRequest request,
            Authentication auth) throws JobPortalException {

        String email = auth.getName();
        RecruiterVerificationStatusResponse response =
                verificationService.submitVerification(email, request);

        return ResponseEntity.ok(ApiResponse.success(
                "Verification submitted successfully. Please wait for admin review.", response));
    }
}
