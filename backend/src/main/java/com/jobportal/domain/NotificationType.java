package com.jobportal.domain;

/**
 * Exhaustive catalog of notification event categories.
 *
 * <p>Each constant maps to a front-end icon, routing rule, and default priority.
 * Groupings are documented in-line. Backward-compatible constants
 * ({@link #APPLICATION_RECEIVED}, {@link #APPLICATION_STATUS_UPDATED}) are
 * retained so existing DB rows and legacy callers are unaffected.</p>
 */
public enum NotificationType {

    // ── Jobs ──────────────────────────────────────────────────────────────────
    /** A recruiter posted a new featured job visible to candidates. */
    FEATURED_JOB,
    /** A recruiter posted a standard new job. */
    NEW_JOB,
    /** AI matched the user's profile to an open job. */
    JOB_MATCH,
    /** A job the user applied to has expired / closed. */
    JOB_EXPIRED,
    /** A previously closed job has been reopened. */
    JOB_REOPENED,

    // ── Applications ─────────────────────────────────────────────────────────
    /** Candidate successfully submitted an application. */
    APPLICATION_SUBMITTED,
    /** Recruiter received a new application (alias kept for backward compat). */
    APPLICATION_RECEIVED,
    /** Application moved to shortlist. */
    APPLICATION_SHORTLISTED,
    /** Application was rejected. */
    APPLICATION_REJECTED,
    /** Candidate withdrew their own application. */
    APPLICATION_WITHDRAWN,
    /** Generic status-change fallback (backward compat). */
    APPLICATION_STATUS_UPDATED,

    // ── Interview ─────────────────────────────────────────────────────────────
    /** An interview was scheduled. */
    INTERVIEW_SCHEDULED,
    /** Reminder sent before an upcoming interview. */
    INTERVIEW_REMINDER,
    /** Interview completed. */
    INTERVIEW_COMPLETED,

    // ── Offers ────────────────────────────────────────────────────────────────
    /** Recruiter sent an offer letter. */
    OFFER_RECEIVED,
    /** Candidate accepted the offer. */
    OFFER_ACCEPTED,
    /** Candidate rejected the offer. */
    OFFER_REJECTED,

    // ── Company ───────────────────────────────────────────────────────────────
    /** Company profile was updated. */
    COMPANY_UPDATE,
    /** Company was verified by an admin. */
    COMPANY_VERIFIED,

    // ── Profile & AI ─────────────────────────────────────────────────────────
    /** User's profile has been fully completed. */
    PROFILE_COMPLETED,
    /** User's profile is still incomplete. */
    PROFILE_INCOMPLETE,
    /** AI resume analysis finished. */
    RESUME_ANALYZED,
    /** AI generated personalized job recommendations. */
    AI_JOB_RECOMMENDATION,

    // ── Messaging ────────────────────────────────────────────────────────────
    /** A new recruiter or support message arrived. */
    MESSAGE_RECEIVED,

    // ── System / Account / Security ──────────────────────────────────────────
    /** Platform-wide announcement or maintenance notice. */
    SYSTEM,
    /** Account-related event (email verified, password changed, etc.). */
    ACCOUNT,
    /** Security event (new-device login, suspicious activity, account locked). */
    SECURITY,

    // ── Recruiter Verification ────────────────────────────────────────────────
    /** Recruiter submitted their verification information — awaiting admin review. */
    VERIFICATION_SUBMITTED,
    /** Admin approved the recruiter account — full access granted. */
    RECRUITER_APPROVED,
    /** Admin rejected the recruiter account — rejection reason provided. */
    RECRUITER_REJECTED,
    /** Admin suspended the recruiter account — access immediately revoked. */
    RECRUITER_SUSPENDED
}
