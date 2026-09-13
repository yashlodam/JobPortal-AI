package com.jobportal.resumebuilder.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Visual template design choices for rendered resumes.
 */
public enum ResumeTemplate {
    MODERN,
    CLASSIC,
    MINIMALIST,
    EXECUTIVE,
    CREATIVE;

    @JsonCreator
    public static ResumeTemplate fromString(String value) {
        if (value == null || value.isBlank()) {
            return MODERN;
        }
        String clean = value.trim();
        for (ResumeTemplate template : ResumeTemplate.values()) {
            if (template.name().equalsIgnoreCase(clean)) {
                return template;
            }
        }
        return MODERN;
    }
}
