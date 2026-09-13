package com.jobportal.chat.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Payload sent by the client over STOMP to /app/chat.typing.
 * NOT stored in the database - purely WebSocket real-time state.
 */
public class TypingIndicatorRequest {

    @NotNull(message = "conversationId is required")
    private Long conversationId;

    /** true = user started typing, false = user stopped typing. */
    private boolean typing;

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public boolean isTyping() { return typing; }
    public void setTyping(boolean typing) { this.typing = typing; }
}
