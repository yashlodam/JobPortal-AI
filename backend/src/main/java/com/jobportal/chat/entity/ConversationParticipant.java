package com.jobportal.chat.entity;

import java.time.LocalDateTime;

import com.jobportal.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Join entity between a Conversation and a participating User.
 * Stores per-participant metadata: lastReadAt for unread counts, online status.
 * Unique constraint on (conversation_id, user_id) prevents duplicate rows.
 */
@Entity
@Table(
    name = "conversation_participants",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_conv_participant",
            columnNames = {"conversation_id", "user_id"}
        )
    },
    indexes = {
        @Index(name = "idx_cp_user", columnList = "user_id"),
        @Index(name = "idx_cp_conv", columnList = "conversation_id")
    }
)
public class ConversationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    /**
     * Timestamp of the last message this participant read.
     * Null means never read.
     * Unread count = messages sent after this timestamp not sent by this user.
     */
    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    /** Online/offline state updated by WebSocket connect/disconnect events. */
    @Column(name = "is_online", nullable = false)
    private boolean online = false;

    /** Last time this participant was seen online (set on disconnect). */
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    public ConversationParticipant() {}

    public ConversationParticipant(Conversation conversation, User user) {
        this.conversation = conversation;
        this.user = user;
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getLastReadAt() { return lastReadAt; }
    public void setLastReadAt(LocalDateTime lastReadAt) { this.lastReadAt = lastReadAt; }

    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }

    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }
}
