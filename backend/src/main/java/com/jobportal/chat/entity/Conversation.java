package com.jobportal.chat.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.jobportal.chat.domain.ConversationStatus;
import com.jobportal.entity.Auditable;
import com.jobportal.entity.JobApplication;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * A chat conversation between two or more users.
 *
 * Design: participants managed via ConversationParticipant (not ManyToMany)
 * so per-participant metadata (lastReadAt) can be stored.
 * jobApplication is a nullable soft-link for context.
 * lastMessageAt is denormalised for efficient conversation-list sorting.
 * Duplicate conversations prevented at service layer via participant-pair query.
 */
@Entity
@Table(
    name = "conversations",
    indexes = {
        @Index(name = "idx_conv_last_msg", columnList = "last_message_at"),
        @Index(name = "idx_conv_app",      columnList = "job_application_id")
    }
)
public class Conversation extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Optional display title. If null, UI derives from participant names. */
    @Column(length = 200)
    private String title;

    /**
     * Optional link to the job application that started this conversation.
     * ON DELETE SET NULL: deleting a JobApplication does not delete the conversation.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id")
    private JobApplication jobApplication;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConversationStatus status = ConversationStatus.ACTIVE;

    /**
     * Denormalised timestamp of the last message.
     * Updated on every send for efficient conversation-list sorting.
     */
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ConversationParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Message> messages = new ArrayList<>();

    public Conversation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public JobApplication getJobApplication() { return jobApplication; }
    public void setJobApplication(JobApplication jobApplication) { this.jobApplication = jobApplication; }

    public ConversationStatus getStatus() { return status; }
    public void setStatus(ConversationStatus status) { this.status = status; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public List<ConversationParticipant> getParticipants() { return participants; }
    public void setParticipants(List<ConversationParticipant> participants) { this.participants = participants; }

    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
}
