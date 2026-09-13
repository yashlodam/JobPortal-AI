package com.jobportal.chat.dto.response;

/**
 * Total unread message count for the authenticated user across all conversations.
 * Used to drive the unread badge on the Messages nav icon.
 */
public class ChatUnreadCountResponse {

    private long totalUnread;

    public ChatUnreadCountResponse() {}

    public ChatUnreadCountResponse(long totalUnread) {
        this.totalUnread = totalUnread;
    }

    public long getTotalUnread() { return totalUnread; }
    public void setTotalUnread(long totalUnread) { this.totalUnread = totalUnread; }
}
