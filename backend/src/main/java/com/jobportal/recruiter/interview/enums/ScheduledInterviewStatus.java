package com.jobportal.recruiter.interview.enums;

/**
 * Status of a recruiter-scheduled candidate interview.
 */
public enum ScheduledInterviewStatus {

    /** Interview scheduled but not yet started. */
    SCHEDULED,

    /** Interview is currently in progress. */
    IN_PROGRESS,

    /** Interview completed successfully. */
    COMPLETED,

    /** Interview was cancelled by the recruiter or candidate. */
    CANCELLED,

    /** Candidate did not show up for the interview. */
    NO_SHOW,

    /** Rescheduled (original slot was changed). */
    RESCHEDULED
}
