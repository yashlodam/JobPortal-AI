package com.jobportal.resumebuilder.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Language proficiency levels.
 */
public enum ProficiencyLevel {
    NATIVE,
    FLUENT,
    INTERMEDIATE,
    BASIC;

    @JsonCreator
    public static ProficiencyLevel fromString(String value) {
        if (value == null || value.isBlank()) {
            return INTERMEDIATE;
        }
        String clean = value.trim();
        for (ProficiencyLevel level : ProficiencyLevel.values()) {
            if (level.name().equalsIgnoreCase(clean)) {
                return level;
            }
        }
        return INTERMEDIATE;
    }
}
