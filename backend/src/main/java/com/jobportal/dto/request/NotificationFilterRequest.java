package com.jobportal.dto.request;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.jobportal.domain.NotificationPriority;
import com.jobportal.domain.NotificationType;

/**
 * Filter/search criteria for the notification feed.
 *
 * <p>Bound from HTTP query parameters via {@code @ModelAttribute} in the controller.
 * All fields are optional — absent fields produce no predicate in the
 * {@link com.jobportal.repository.specification.NotificationSpecification}.</p>
 *
 * <p>Example request:
 * <pre>
 *   GET /api/notifications/search?keyword=interview&amp;type=INTERVIEW_SCHEDULED&amp;read=false&amp;page=0&amp;size=10
 * </pre>
 * </p>
 */
public class NotificationFilterRequest {

    /** Full-text keyword matched against title and message (case-insensitive LIKE). */
    private String keyword;

    /** Filter to a specific notification category. */
    private NotificationType type;

    /** Filter to a specific priority level. */
    private NotificationPriority priority;

    /** {@code true} = only read, {@code false} = only unread, {@code null} = both. */
    private Boolean read;

    /**
     * {@code true} = only archived, {@code false} = only active (default behaviour),
     * {@code null} = only active (Specification defaults to false).
     */
    private Boolean archived;

    /** Inclusive start of the createdAt date range. */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime fromDate;

    /** Inclusive end of the createdAt date range. */
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime toDate;

    public NotificationFilterRequest() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public NotificationPriority getPriority() { return priority; }
    public void setPriority(NotificationPriority priority) { this.priority = priority; }

    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }

    public Boolean getArchived() { return archived; }
    public void setArchived(Boolean archived) { this.archived = archived; }

    public LocalDateTime getFromDate() { return fromDate; }
    public void setFromDate(LocalDateTime fromDate) { this.fromDate = fromDate; }

    public LocalDateTime getToDate() { return toDate; }
    public void setToDate(LocalDateTime toDate) { this.toDate = toDate; }
}
