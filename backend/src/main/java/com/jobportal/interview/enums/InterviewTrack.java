package com.jobportal.interview.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Tracks supported by the AI Mock Interview system.
 */
public enum InterviewTrack {
    TECHNICAL,
    HR,
    BEHAVIORAL,
    SYSTEM_DESIGN,
    CODING,
    RESUME_BASED,
    JOB_DESCRIPTION_BASED;

    @JsonCreator
    public static InterviewTrack fromString(String value) {
        if (value == null || value.isBlank()) {
            return TECHNICAL;
        }
        String clean = value.trim();
        for (InterviewTrack track : InterviewTrack.values()) {
            if (track.name().equalsIgnoreCase(clean)) {
                return track;
            }
        }
        return TECHNICAL;
    }
}
