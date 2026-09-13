package com.jobportal.resumebuilder.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Skill proficiency level for structured skills.
 */
public enum SkillLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED,
    EXPERT;

    @JsonCreator
    public static SkillLevel fromString(String value) {
        if (value == null || value.isBlank()) {
            return INTERMEDIATE;
        }
        String clean = value.trim();
        for (SkillLevel level : SkillLevel.values()) {
            if (level.name().equalsIgnoreCase(clean)) {
                return level;
            }
        }
        return INTERMEDIATE;
    }
}
