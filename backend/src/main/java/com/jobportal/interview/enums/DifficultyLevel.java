package com.jobportal.interview.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Difficulty level for interview questions.
 */
public enum DifficultyLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED,
    EXPERT;

    @JsonCreator
    public static DifficultyLevel fromString(String value) {
        if (value == null || value.isBlank()) {
            return INTERMEDIATE;
        }
        String clean = value.trim();
        for (DifficultyLevel diff : DifficultyLevel.values()) {
            if (diff.name().equalsIgnoreCase(clean)) {
                return diff;
            }
        }
        return INTERMEDIATE;
    }
}
