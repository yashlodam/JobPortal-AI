package com.jobportal.domain;

/**
 * Lifecycle states of a job application.
 * Ordered from earliest to latest stage.
 */
public enum ApplicationStatus {

    /** Application received — awaiting recruiter review. */
    APPLIED,

    /** Recruiter is reviewing the resume/profile. */
    REVIEWING,

    /** Applicant has been shortlisted for interviews. */
    SHORTLISTED,

    /** Interview process is ongoing. */
    INTERVIEWING,

    /** Offer has been extended to the applicant. */
    OFFERED,

    /** Applicant accepted the offer. */
    ACCEPTED,

    /** Application was rejected by the recruiter. */
    REJECTED,

    /** Applicant withdrew their own application. */
    WITHDRAWN
}
