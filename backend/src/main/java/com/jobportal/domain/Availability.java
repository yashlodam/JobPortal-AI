package com.jobportal.domain;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Availability {
    OPEN_TO_WORK,
    EMPLOYED,
    NOT_LOOKING;

    @JsonCreator
    public static Availability fromString(String value) {
        if (value == null || value.trim().isBlank()) {
            return null;
        }
        String clean = value.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        if (clean.contains("OPPORTUNIT") || clean.contains("WORK")) {
            return OPEN_TO_WORK;
        }
        if (clean.contains("EMPLOYED") || clean.contains("WORKING")) {
            return EMPLOYED;
        }
        if (clean.contains("NOT") || clean.contains("LOOKING")) {
            return NOT_LOOKING;
        }
        for (Availability a : values()) {
            if (a.name().equalsIgnoreCase(clean)) {
                return a;
            }
        }
        return OPEN_TO_WORK;
    }
}

