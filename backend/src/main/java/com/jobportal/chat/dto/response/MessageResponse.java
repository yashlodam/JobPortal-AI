package com.jobportal.chat.dto.response;

import java.time.LocalDateTime;

import com.jobportal.chat.domain.MessageType;

/**
 * Represents a single chat message returned by REST or pushed via WebSocket.
 * Used for both the REST paginated message list and real-time STOMP delivery.
 */
public class MessageResponse {

    private Long id;
    private Long conversationId;
    private SenderResponse sender;
    private String content;
    private MessageType messageType;
    private LocalDateTime sentAt;
    private LocalDateTime editedAt;
    private boolean deleted;
    private boolean edited;

    /**
     * The display content: if deleted, returns fixed text instead of actual content.
     * Keeps the real content private from the frontend after deletion.
     */
    public String getDisplayContent() {
        return deleted ? "This message was deleted." : content;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public SenderResponse getSender() { return sender; }
    public void setSender(SenderResponse sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public boolean isEdited() { return edited; }
    public void setEdited(boolean edited) { this.edited = edited; }
}
