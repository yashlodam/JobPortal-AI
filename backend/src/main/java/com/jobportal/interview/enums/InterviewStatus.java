package com.jobportal.interview.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Status of an interview session.
 */
public enum InterviewStatus {
    IN_PROGRESS,
    COMPLETED,
    CANCELLED;

    @JsonCreator
    public static InterviewStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return IN_PROGRESS;
        }
        String clean = value.trim();
        for (InterviewStatus status : InterviewStatus.values()) {
            if (status.name().equalsIgnoreCase(clean)) {
                return status;
            }
        }
        return IN_PROGRESS;
    }
}
