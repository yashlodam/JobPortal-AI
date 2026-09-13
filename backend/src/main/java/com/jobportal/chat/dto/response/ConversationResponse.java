package com.jobportal.chat.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.jobportal.chat.domain.ConversationStatus;

/**
 * Represents a conversation in the conversation list or detail view.
 *
 * lastMessage: preview of the last message for the conversation list.
 * myUnreadCount: unread count for the currently authenticated user.
 * participants: all participants with their presence/online state.
 * otherParticipant: convenience field pointing to the OTHER user (for 1-to-1 UI).
 */
public class ConversationResponse {

    private Long id;
    private String title;
    private ConversationStatus status;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;

    /** All participants in this conversation. */
    private List<ConversationParticipantResponse> participants;

    /** The other participant in a 1-to-1 conversation (convenience). */
    private ConversationParticipantResponse otherParticipant;

    /** Preview of the most recent message (for conversation list). */
    private MessageResponse lastMessage;

    /** Unread count for the currently authenticated user. */
    private long myUnreadCount;

    /** Optional context: the job application this conversation is about. */
    private Long jobApplicationId;
    private String jobTitle;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public ConversationStatus getStatus() { return status; }
    public void setStatus(ConversationStatus status) { this.status = status; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<ConversationParticipantResponse> getParticipants() { return participants; }
    public void setParticipants(List<ConversationParticipantResponse> participants) { this.participants = participants; }

    public ConversationParticipantResponse getOtherParticipant() { return otherParticipant; }
    public void setOtherParticipant(ConversationParticipantResponse otherParticipant) { this.otherParticipant = otherParticipant; }

    public MessageResponse getLastMessage() { return lastMessage; }
    public void setLastMessage(MessageResponse lastMessage) { this.lastMessage = lastMessage; }

    public long getMyUnreadCount() { return myUnreadCount; }
    public void setMyUnreadCount(long myUnreadCount) { this.myUnreadCount = myUnreadCount; }

    public Long getJobApplicationId() { return jobApplicationId; }
    public void setJobApplicationId(Long jobApplicationId) { this.jobApplicationId = jobApplicationId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
}
