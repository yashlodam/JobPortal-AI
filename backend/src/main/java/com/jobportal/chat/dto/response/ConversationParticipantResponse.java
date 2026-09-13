package com.jobportal.chat.dto.response;

import java.time.LocalDateTime;

/**
 * Represents one participant inside a ConversationResponse.
 * Includes online/presence status and unread count for that participant.
 */
public class ConversationParticipantResponse {

    private Long id;
    private SenderResponse user;
    private LocalDateTime joinedAt;
    private LocalDateTime lastReadAt;
    private boolean online;
    private LocalDateTime lastSeenAt;
    private long unreadCount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SenderResponse getUser() { return user; }
    public void setUser(SenderResponse user) { this.user = user; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getLastReadAt() { return lastReadAt; }
    public void setLastReadAt(LocalDateTime lastReadAt) { this.lastReadAt = lastReadAt; }

    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }

    public LocalDateTime getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(LocalDateTime lastSeenAt) { this.lastSeenAt = lastSeenAt; }

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
}
