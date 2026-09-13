package com.jobportal.resumebuilder.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Desired tone for AI content improvement and rewrites.
 */
public enum AiTone {
    PROFESSIONAL,
    CONCISE,
    IMPACTFUL,
    ATS_OPTIMIZED;

    @JsonCreator
    public static AiTone fromString(String value) {
        if (value == null || value.isBlank()) {
            return PROFESSIONAL;
        }
        String clean = value.trim();
        for (AiTone tone : AiTone.values()) {
            if (tone.name().equalsIgnoreCase(clean)) {
                return tone;
            }
        }
        return PROFESSIONAL;
    }
}
