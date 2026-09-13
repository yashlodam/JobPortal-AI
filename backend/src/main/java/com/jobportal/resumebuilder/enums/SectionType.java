package com.jobportal.resumebuilder.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Section categories within a structured resume.
 */
public enum SectionType {
    PERSONAL_INFO,
    SUMMARY,
    EDUCATION,
    EXPERIENCE,
    PROJECTS,
    SKILLS,
    CERTIFICATIONS,
    ACHIEVEMENTS,
    LANGUAGES;

    @JsonCreator
    public static SectionType fromString(String value) {
        if (value == null || value.isBlank()) {
            return PERSONAL_INFO;
        }
        String clean = value.trim();
        for (SectionType type : SectionType.values()) {
            if (type.name().equalsIgnoreCase(clean)) {
                return type;
            }
        }
        return PERSONAL_INFO;
    }
}
