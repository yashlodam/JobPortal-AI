package com.jobportal.service;

import com.jobportal.domain.RecruiterStatus;
import com.jobportal.entity.Recruiter;
import com.jobportal.exception.JobPortalException;

/**
 * Central authorization gate for recruiter-status-sensitive operations.
 *
 * <p>This service is the <strong>single point of truth</strong> for answering
 * the question: "Is this recruiter allowed to perform this action?"
 * All recruiter-restricted service methods (job creation, application management,
 * candidate search, chat initiation) must call through this service before
 * executing their business logic.</p>
 *
 * <h3>Why a dedicated service?</h3>
 * <ul>
 *   <li>Avoids duplicating status checks across JobService, CompanyService, etc.</li>
 *   <li>Makes the policy change in one place — no scattered if-else status checks.</li>
 *   <li>Allows the auth policy to evolve (e.g. add PROBATION status) without
 *       touching downstream services.</li>
 *   <li>Enables easy mocking in unit tests.</li>
 * </ul>
 *
 * <h3>Usage pattern</h3>
 * <pre>
 * // In JobServiceImpl.createJob():
 * Recruiter recruiter = recruiterAuthorizationService.requireApprovedRecruiter(email);
 * // ... proceed with job creation using recruiter
 * </pre>
 */
public interface RecruiterAuthorizationService {

    /**
     * Returns the {@link Recruiter} for this email ONLY if their status is {@link RecruiterStatus#APPROVED}.
     *
     * <p>Throws {@link JobPortalException} with HTTP 403 for any other status,
     * with a status-specific message explaining what the recruiter needs to do.</p>
     *
     * @param  email  authenticated user's email (JWT subject)
     * @return        the {@link Recruiter} entity, ready for use
     * @throws JobPortalException 403 if PENDING, REJECTED, or SUSPENDED; 404 if not found
     */
    Recruiter requireApprovedRecruiter(String email) throws JobPortalException;

    /**
     * Returns the {@link Recruiter} if status is {@link RecruiterStatus#APPROVED}
     * or {@link RecruiterStatus#PENDING_VERIFICATION}.
     *
     * <p>Used for operations that PENDING recruiters are allowed to perform —
     * specifically company profile management (needed to fill in verification info)
     * and viewing their own profile.</p>
     *
     * @param  email  authenticated user's email (JWT subject)
     * @return        the {@link Recruiter} entity
     * @throws JobPortalException 403 if REJECTED or SUSPENDED; 404 if not found
     */
    Recruiter requireApprovedOrPendingRecruiter(String email) throws JobPortalException;

    /**
     * Loads the {@link Recruiter} for this email without any status enforcement.
     *
     * <p>Use for read operations that show the recruiter their own status,
     * verification history, or profile — regardless of approval state.</p>
     *
     * @param  email  authenticated user's email (JWT subject)
     * @return        the {@link Recruiter} entity
     * @throws JobPortalException 404 if no recruiter found for this email
     */
    Recruiter getRecruiter(String email) throws JobPortalException;

    /**
     * Checks whether this recruiter is allowed to INITIATE a new conversation.
     *
     * <p>Only {@link RecruiterStatus#APPROVED} recruiters may start new conversations.
     * PENDING, REJECTED, and SUSPENDED recruiters are blocked from initiating chat.</p>
     *
     * @param  email  authenticated user's email
     * @throws JobPortalException 403 if not APPROVED
     */
    void requireCanInitiateConversation(String email) throws JobPortalException;
}
