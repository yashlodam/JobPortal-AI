package com.jobportal.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ExperienceLevel {
    INTERNSHIP,
    ENTRY_LEVEL,
    MID_LEVEL,
    SENIOR_LEVEL,
    LEAD,
    MANAGER,
    EXECUTIVE;

    @JsonCreator
    public static ExperienceLevel fromString(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }
        String clean = value.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        for (ExperienceLevel el : values()) {
            if (el.name().equalsIgnoreCase(clean)) {
                return el;
            }
        }
        return null;
    }
}

