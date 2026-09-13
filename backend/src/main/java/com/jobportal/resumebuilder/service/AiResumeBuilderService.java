package com.jobportal.resumebuilder.service;

import com.jobportal.exception.JobPortalException;
import com.jobportal.resumebuilder.dto.AiImprovementRequest;
import com.jobportal.resumebuilder.dto.AiImprovementResponse;
import com.jobportal.resumebuilder.dto.AiSkillSuggestionResponse;
import com.jobportal.resumebuilder.dto.AiSummaryResponse;

/**
 * Service interface for AI features inside Resume Builder powered by Spring AI & ChatClient.
 */
public interface AiResumeBuilderService {

    AiSummaryResponse generateProfessionalSummary(Long resumeId, String email) throws JobPortalException;

    AiImprovementResponse improveContent(Long resumeId, AiImprovementRequest request, String email) throws JobPortalException;

    AiSkillSuggestionResponse suggestSkills(Long resumeId, String email) throws JobPortalException;
}
