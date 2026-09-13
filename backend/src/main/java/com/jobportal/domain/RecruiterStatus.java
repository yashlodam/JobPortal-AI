package com.jobportal.domain;

/**
 * Lifecycle states of a recruiter account in the verification pipeline.
 *
 * <ul>
 *   <li>{@link #PENDING_VERIFICATION} — newly registered; limited access pending admin review.</li>
 *   <li>{@link #APPROVED}             — admin-approved; full recruiter privileges granted.</li>
 *   <li>{@link #REJECTED}             — admin-rejected; may resubmit verification to re-enter PENDING.</li>
 *   <li>{@link #SUSPENDED}            — admin-suspended; all recruiter privileges immediately revoked.</li>
 * </ul>
 *
 * <p>DB migration note: existing rows with {@code status='ACTIVE'} are migrated to
 * {@code 'APPROVED'} and {@code status='INACTIVE'} to {@code 'SUSPENDED'} by
 * {@link com.jobportal.config.DataInitializer} on first startup after this change.</p>
 */
public enum RecruiterStatus {

    /** Newly registered recruiter — awaiting admin review. Limited access. */
    PENDING_VERIFICATION,

    /** Admin has approved this recruiter — full recruiter privileges. */
    APPROVED,

    /** Admin has rejected this recruiter — may resubmit verification. No recruiter privileges. */
    REJECTED,

    /** Admin has suspended this recruiter — all recruiter privileges immediately revoked. */
    SUSPENDED
}
