package com.jobportal.chat.entity;

import java.time.LocalDateTime;

import com.jobportal.chat.domain.MessageType;
import com.jobportal.entity.Auditable;
import com.jobportal.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * A single message within a Conversation.
 *
 * Design:
 *   sender is set server-side from the JWT principal, never from request body.
 *   deletedAt is a soft-delete: deleted messages show "This message was deleted."
 *   sentAt is set explicitly (not via JPA auditing) for precision.
 *   content max 5000 chars enforced on DTO, not entity.
 */
@Entity
@Table(
    name = "messages",
    indexes = {
        @Index(name = "idx_msg_conv_sent", columnList = "conversation_id, sent_at"),
        @Index(name = "idx_msg_sender",    columnList = "sender_id")
    }
)
public class Message extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    /** Authenticated sender. Set by service from JWT. Never from request body. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, length = 5000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false, length = 30)
    private MessageType messageType = MessageType.TEXT;

    /** Precise timestamp of send. Used for ordering and unread-count comparison. */
    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    /** Non-null when message has been edited. */
    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    /** Non-null when message is soft-deleted. Display: "This message was deleted." */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public Message() {}

    public boolean isDeleted() { return deletedAt != null; }
    public boolean isEdited()  { return editedAt  != null; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}
