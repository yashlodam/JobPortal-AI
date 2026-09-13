package com.jobportal.interview.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Format of the interview session.
 */
public enum InterviewType {
    TEXT,
    AUDIO,
    MOCK_TEST;

    @JsonCreator
    public static InterviewType fromString(String value) {
        if (value == null || value.isBlank()) {
            return TEXT;
        }
        String clean = value.trim();
        for (InterviewType type : InterviewType.values()) {
            if (type.name().equalsIgnoreCase(clean)) {
                return type;
            }
        }
        // Fallback to TEXT if client passes an unrecognised type (e.g. "TECHNICAL")
        return TEXT;
    }
}
