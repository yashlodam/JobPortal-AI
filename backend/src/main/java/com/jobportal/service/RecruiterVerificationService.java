package com.jobportal.service;

import com.jobportal.dto.request.RecruiterVerificationRequest;
import com.jobportal.dto.response.RecruiterVerificationStatusResponse;
import com.jobportal.exception.JobPortalException;

/**
 * Recruiter self-service verification API.
 *
 * <p>Exposes two operations the recruiter can perform themselves:</p>
 * <ol>
 *   <li>{@link #getVerificationStatus} — always accessible regardless of status.</li>
 *   <li>{@link #submitVerification} — allowed for PENDING and REJECTED recruiter only.</li>
 * </ol>
 */
public interface RecruiterVerificationService {

    /**
     * Returns the current verification status for the authenticated recruiter,
     * including timestamps, rejection reason, and a {@code canSubmit} flag.
     *
     * <p>Accessible regardless of current status.</p>
     *
     * @param  email  authenticated recruiter's email
     * @return        verification status response
     * @throws JobPortalException 404 if recruiter not found
     */
    RecruiterVerificationStatusResponse getVerificationStatus(String email)
            throws JobPortalException;

    /**
     * Submits (or resubmits after rejection) the recruiter's verification information.
     *
     * <h3>Business rules</h3>
     * <ul>
     *   <li>PENDING: updates designation/note, sets/refreshes {@code submittedAt}. Status stays PENDING.</li>
     *   <li>REJECTED: resets status to PENDING_VERIFICATION, refreshes {@code submittedAt},
     *       clears {@code reviewedAt} and {@code reviewedByUserId} (keeps {@code rejectionReason}
     *       so the recruiter can still see what was wrong).</li>
     *   <li>APPROVED: throws 400 — no need to submit again.</li>
     *   <li>SUSPENDED: throws 403 — suspended recruiters cannot resubmit.</li>
     * </ul>
     *
     * @param  email    authenticated recruiter's email
     * @param  request  optional designation and note
     * @return          updated verification status response
     * @throws JobPortalException 400 if APPROVED, 403 if SUSPENDED, 404 if not found
     */
    RecruiterVerificationStatusResponse submitVerification(
            String email, RecruiterVerificationRequest request) throws JobPortalException;
}
