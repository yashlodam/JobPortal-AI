package com.jobportal.dto.response;

/**
 * Lightweight response for the notification bell badge count.
 *
 * <p>Intentionally minimal — polled frequently by the frontend to update the badge.
 * {@code hasUnread} is a computed convenience field to avoid client-side {@code count > 0}
 * logic and enables the frontend to conditionally render the badge without arithmetic.</p>
 */
public class UnreadCountResponse {

    private final long count;
    private final boolean hasUnread;

    public UnreadCountResponse(long count) {
        this.count = count;
        this.hasUnread = count > 0;
    }

    public long getCount() { return count; }
    public boolean isHasUnread() { return hasUnread; }
}
