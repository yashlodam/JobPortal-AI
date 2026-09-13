package com.jobportal.chat.dto.response;

/**
 * Pushed via WebSocket to /topic/conversations/{id} when a participant types.
 * NOT stored in the database.
 */
public class TypingResponse {

    private Long conversationId;
    private Long userId;
    private String userName;
    private boolean typing;

    public TypingResponse() {}

    public TypingResponse(Long conversationId, Long userId, String userName, boolean typing) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.userName = userName;
        this.typing = typing;
    }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public boolean isTyping() { return typing; }
    public void setTyping(boolean typing) { this.typing = typing; }
}
