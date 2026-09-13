package com.jobportal.copilot.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.copilot.dto.CopilotChatRequest;
import com.jobportal.copilot.dto.CopilotChatResponse;
import com.jobportal.copilot.service.AiCopilotService;
import com.jobportal.dto.response.ApiResponse;

import jakarta.validation.Valid;

/**
 * Controller for AI Career Copilot Chatbot.
 * Open to both unauthenticated visitors (home page guests) and authenticated candidates.
 */
@RestController
@RequestMapping("/api/ai/copilot")
public class AiCopilotController {

    private final AiCopilotService copilotService;

    public AiCopilotController(AiCopilotService copilotService) {
        this.copilotService = copilotService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<CopilotChatResponse>> chat(
            @Valid @RequestBody CopilotChatRequest request,
            Authentication authentication) {
        String email = (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName()))
                ? authentication.getName()
                : null;

        CopilotChatResponse response = copilotService.chat(request, email);
        return ResponseEntity.ok(ApiResponse.success("AI Copilot response generated", response));
    }
}
