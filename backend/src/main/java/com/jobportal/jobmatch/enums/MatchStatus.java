package com.jobportal.jobmatch.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Lifecycle status of the AI Job Match Analysis for a candidate's application.
 */
public enum MatchStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED;

    @JsonCreator
    public static MatchStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return PENDING;
        }
        String clean = value.trim();
        for (MatchStatus status : MatchStatus.values()) {
            if (status.name().equalsIgnoreCase(clean)) {
                return status;
            }
        }
        return PENDING;
    }
}
