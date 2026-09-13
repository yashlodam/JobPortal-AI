package com.jobportal.resumebuilder.dto;

import com.jobportal.resumebuilder.enums.AiTone;
import com.jobportal.resumebuilder.enums.SectionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for AI content improvement / bullet rewriting.
 */
public class AiImprovementRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 2000, message = "Content cannot exceed 2000 characters")
    private String content;

    private SectionType sectionType = SectionType.EXPERIENCE;
    private AiTone tone = AiTone.IMPACTFUL;

    public AiImprovementRequest() {}

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public SectionType getSectionType() { return sectionType; }
    public void setSectionType(SectionType sectionType) { this.sectionType = sectionType; }

    public AiTone getTone() { return tone; }
    public void setTone(AiTone tone) { this.tone = tone; }
}
