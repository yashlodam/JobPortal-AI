package com.jobportal.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum WorkingMode {

    REMOTE,
    HYBRID,
    ONSITE,
    ON_SITE;

    @JsonCreator
    public static WorkingMode fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String normalized = value.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        if ("ON_SITE".equals(normalized) || "ONSITE".equals(normalized)) {
            return ONSITE;
        }
        for (WorkingMode mode : WorkingMode.values()) {
            if (mode.name().equalsIgnoreCase(normalized)) {
                return mode;
            }
        }
        return ONSITE;
    }

    @JsonValue
    public String toValue() {
        if (this == ON_SITE || this == ONSITE) {
            return "ONSITE";
        }
        return this.name();
    }
}