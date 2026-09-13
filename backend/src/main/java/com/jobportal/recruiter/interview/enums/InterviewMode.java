package com.jobportal.recruiter.interview.enums;

/**
 * Interview mode / format for a scheduled interview.
 */
public enum InterviewMode {

    /** Video call (Google Meet, Zoom, Teams, etc.) */
    VIDEO_CALL,

    /** Phone call / telephonic round */
    PHONE,

    /** In-person on-site interview */
    IN_PERSON,

    /** Pair programming or live coding session */
    PAIR_PROGRAMMING,

    /** Written technical assessment */
    WRITTEN_TEST
}
