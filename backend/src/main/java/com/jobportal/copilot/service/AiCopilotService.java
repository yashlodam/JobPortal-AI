package com.jobportal.copilot.service;

import com.jobportal.copilot.dto.CopilotChatRequest;
import com.jobportal.copilot.dto.CopilotChatResponse;

public interface AiCopilotService {

    /**
     * Process conversational query for applicant/guest using Spring AI LLM.
     *
     * @param request chat message, history, and active page context
     * @param userEmail authenticated user email, or null if guest
     * @return structured chat response with reply text, follow-up chips, and optional job cards
     */
    CopilotChatResponse chat(CopilotChatRequest request, String userEmail);
}
