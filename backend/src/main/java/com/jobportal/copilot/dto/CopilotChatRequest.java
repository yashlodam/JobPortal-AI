package com.jobportal.copilot.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;

public class CopilotChatRequest {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    private List<ChatMessageDto> history = new ArrayList<>();

    private String activePage;

    public CopilotChatRequest() {}

    public CopilotChatRequest(String message, List<ChatMessageDto> history, String activePage) {
        this.message = message;
        this.history = history != null ? history : new ArrayList<>();
        this.activePage = activePage;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<ChatMessageDto> getHistory() { return history; }
    public void setHistory(List<ChatMessageDto> history) { this.history = history; }

    public String getActivePage() { return activePage; }
    public void setActivePage(String activePage) { this.activePage = activePage; }
}
