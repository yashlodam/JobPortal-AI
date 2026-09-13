package com.jobportal.chat.dto.response;

import java.time.LocalDateTime;

/**
 * Pushed via WebSocket to /topic/conversations/{id} when a participant marks messages as read.
 * The sender uses this to update message status to 'Read' in the UI.
 */
public class ReadReceiptResponse {

    private Long conversationId;
    private Long userId;
    private String userName;
    private LocalDateTime readAt;

    public ReadReceiptResponse() {}

    public ReadReceiptResponse(Long conversationId, Long userId, String userName, LocalDateTime readAt) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.userName = userName;
        this.readAt = readAt;
    }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
}
