package com.jobportal.entity;

import java.time.LocalDateTime;

import com.jobportal.domain.NotificationPriority;
import com.jobportal.domain.NotificationType;

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
 * Persisted in-app notification.
 *
 * <h3>Design decisions</h3>
 * <ul>
 *   <li>One row per recipient — bulk events create one row per target user.</li>
 *   <li>{@code referenceId} + {@code referenceType} form a soft FK to the
 *       triggering domain object so the frontend can deep-link to it.</li>
 *   <li>{@code archived} = soft-dismiss without deletion (inbox-zero pattern).</li>
 *   <li>{@code expiresAt} allows time-limited notifications (e.g. interview reminders).</li>
 *   <li>{@code priority} drives visual rank and badge colour in the UI.</li>
 * </ul>
 *
 * <h3>Indexes</h3>
 * <ul>
 *   <li>All queries are scoped by {@code recipient_id} — every index starts with that column.</li>
 *   <li>Compound index on {@code (recipient_id, is_read, archived)} covers the main feed query.</li>
 *   <li>Separate index on {@code expires_at} supports the scheduler's cleanup query.</li>
 * </ul>
 */
@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notif_recipient",    columnList = "recipient_id"),
        @Index(name = "idx_notif_read",         columnList = "recipient_id, is_read"),
        @Index(name = "idx_notif_archived",     columnList = "recipient_id, archived"),
        @Index(name = "idx_notif_type",         columnList = "recipient_id, type"),
        @Index(name = "idx_notif_created",      columnList = "recipient_id, created_at"),
        @Index(name = "idx_notif_expires",      columnList = "expires_at")
    }
)
public class Notification extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who receives this notification. Never null. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    /** Notification category — used for icons, routing, and filtering. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    /** Urgency level — drives visual rank in the UI. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationPriority priority = NotificationPriority.MEDIUM;

    /** Short heading shown in the notification bell (max 150 chars). */
    @Column(nullable = false, length = 150)
    private String title;

    /** Full detail message shown when the notification is expanded (max 500 chars). */
    @Column(nullable = false, length = 500)
    private String message;

    /**
     * Optional deep-link URL the frontend navigates to when the user clicks
     * the notification (e.g. {@code /jobs/42} or {@code /applications/7}).
     */
    @Column(name = "action_url", length = 500)
    private String actionUrl;

    /** Optional thumbnail or preview image URL. */
    @Column(length = 500)
    private String image;

    /** Icon name or URL (e.g. Heroicons name, Material icon name, or CDN URL). */
    @Column(length = 100)
    private String icon;

    /**
     * Optional ID of the triggering domain object.
     * Combined with {@code referenceType} it forms a soft FK
     * so the frontend can link to the resource without a rigid DB FK.
     */
    @Column(name = "reference_id")
    private Long referenceId;

    /**
     * Discriminator string for {@code referenceId}.
     * Examples: {@code "JOB"}, {@code "APPLICATION"}, {@code "COMPANY"}.
     */
    @Column(name = "reference_type", length = 30)
    private String referenceType;

    /** {@code false} until the user explicitly reads or dismisses the notification. */
    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    /**
     * {@code true} when the user archives the notification.
     * Archived notifications are hidden from the main feed but not deleted.
     * This supports the inbox-zero pattern (LinkedIn, GitHub style).
     */
    @Column(nullable = false)
    private boolean archived = false;

    /**
     * Optional expiry timestamp. Notifications past this time are
     * automatically archived by {@link com.jobportal.scheduler.NotificationScheduler}.
     * Null means the notification never expires.
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /** Required by JPA. */
    public Notification() {}

    // ── Full convenience constructor ─────────────────────────────────────────

    public Notification(User recipient,
                        NotificationType type,
                        NotificationPriority priority,
                        String title,
                        String message,
                        String actionUrl,
                        Long referenceId,
                        String referenceType) {
        this.recipient     = recipient;
        this.type          = type;
        this.priority      = priority != null ? priority : NotificationPriority.MEDIUM;
        this.title         = title;
        this.message       = message;
        this.actionUrl     = actionUrl;
        this.referenceId   = referenceId;
        this.referenceType = referenceType;
    }

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public NotificationPriority getPriority() { return priority; }
    public void setPriority(NotificationPriority priority) { this.priority = priority; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
