package com.jobportal.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Payload sent by the client over STOMP to /app/chat.send.
 *
 * Security note:
 *   senderId is NOT included. The authenticated WebSocket principal
 *   (set by JwtChannelInterceptor from the JWT token) determines the sender.
 *   Any senderId in the body would be silently ignored.
 */
public class SendMessageRequest {

    @NotNull(message = "conversationId is required")
    private Long conversationId;

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 5000, message = "Message content cannot exceed 5000 characters")
    private String content;

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getContent() { return content; }
    public void setContent(String content) {
        this.content = content != null ? content.trim() : null;
    }
}
