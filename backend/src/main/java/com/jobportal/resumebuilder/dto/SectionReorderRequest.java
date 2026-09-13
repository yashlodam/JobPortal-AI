package com.jobportal.resumebuilder.dto;

import java.util.List;

import com.jobportal.resumebuilder.enums.SectionType;

import jakarta.validation.constraints.NotNull;

/**
 * Request payload for reordering section items.
 */
public class SectionReorderRequest {

    @NotNull(message = "Section type is required")
    private SectionType sectionType;

    @NotNull(message = "Ordered IDs list is required")
    private List<Long> orderedIds;

    public SectionReorderRequest() {}

    public SectionType getSectionType() { return sectionType; }
    public void setSectionType(SectionType sectionType) { this.sectionType = sectionType; }

    public List<Long> getOrderedIds() { return orderedIds; }
    public void setOrderedIds(List<Long> orderedIds) { this.orderedIds = orderedIds; }
}
