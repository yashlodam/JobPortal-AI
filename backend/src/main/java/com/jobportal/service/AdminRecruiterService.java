package com.jobportal.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jobportal.domain.RecruiterStatus;
import com.jobportal.dto.request.AdminReviewRequest;
import com.jobportal.dto.response.RecruiterAdminSummaryResponse;
import com.jobportal.dto.response.RecruiterVerificationStatusResponse;
import com.jobportal.exception.JobPortalException;

/**
 * Admin recruiter management service.
 *
 * <p>All methods in this interface require the caller to have
 * {@code AccountType.ADMIN} — enforced at both route level
 * ({@code hasAuthority('ADMIN')}) and method level
 * ({@code @PreAuthorize("hasAuthority('ADMIN')")}).</p>
 *
 * <h3>Operations</h3>
 * <ul>
 *   <li>List recruiters by status (paginated)</li>
 *   <li>View a single recruiter's full detail</li>
 *   <li>Approve, reject, or suspend a recruiter</li>
 *   <li>View admin dashboard statistics</li>
 * </ul>
 */
public interface AdminRecruiterService {

    /**
     * Returns a paginated list of recruiters filtered by status.
     * If {@code status} is null, returns all recruiters.
     *
     * @param status   optional status filter
     * @param pageable pagination and sorting
     */
    Page<RecruiterAdminSummaryResponse> listRecruiters(RecruiterStatus status, Pageable pageable)
            throws JobPortalException;

    /**
     * Returns detailed verification information for a single recruiter.
     *
     * @param recruiterId target recruiter ID
     */
    RecruiterVerificationStatusResponse getRecruiterDetail(Long recruiterId)
            throws JobPortalException;

    /**
     * Approves a recruiter — transitions PENDING → APPROVED.
     * Publishes a {@link com.jobportal.event.RecruiterVerificationEvent} that triggers
     * a {@code RECRUITER_APPROVED} notification to the recruiter.
     *
     * @param recruiterId  target recruiter ID
     * @param adminEmail   authenticated admin's email (for audit trail)
     * @param request      optional approval note (reason field used as congratulatory note)
     * @throws JobPortalException 400 if already APPROVED; 404 if not found
     */
    RecruiterAdminSummaryResponse approveRecruiter(Long recruiterId,
                                                    String adminEmail,
                                                    AdminReviewRequest request)
            throws JobPortalException;

    /**
     * Rejects a recruiter — transitions PENDING → REJECTED.
     * The rejection reason is required so the recruiter knows what to fix.
     * Publishes a {@link com.jobportal.event.RecruiterVerificationEvent} that triggers
     * a {@code RECRUITER_REJECTED} notification with the reason.
     *
     * @param recruiterId  target recruiter ID
     * @param adminEmail   authenticated admin's email (for audit trail)
     * @param request      must include a non-blank rejection reason
     * @throws JobPortalException 400 if reason blank or status invalid; 404 if not found
     */
    RecruiterAdminSummaryResponse rejectRecruiter(Long recruiterId,
                                                   String adminEmail,
                                                   AdminReviewRequest request)
            throws JobPortalException;

    /**
     * Suspends a recruiter — transitions any status → SUSPENDED.
     * All active jobs posted by this recruiter are set to CLOSED.
     * Publishes a {@link com.jobportal.event.RecruiterVerificationEvent} that triggers
     * a {@code RECRUITER_SUSPENDED} notification.
     *
     * @param recruiterId  target recruiter ID
     * @param adminEmail   authenticated admin's email (for audit trail)
     * @param request      must include a non-blank suspension reason
     * @throws JobPortalException 400 if reason blank; 404 if not found
     */
    RecruiterAdminSummaryResponse suspendRecruiter(Long recruiterId,
                                                    String adminEmail,
                                                    AdminReviewRequest request)
            throws JobPortalException;
}
