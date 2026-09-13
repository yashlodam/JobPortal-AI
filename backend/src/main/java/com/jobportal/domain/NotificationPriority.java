package com.jobportal.domain;

/**
 * Priority level of a notification.
 * Used to visually rank and sort notifications by urgency in the UI.
 *
 * <ul>
 *   <li>{@link #LOW} — informational only; can be safely dismissed.</li>
 *   <li>{@link #MEDIUM} — standard operational notification (default).</li>
 *   <li>{@link #HIGH} — time-sensitive; displayed prominently.</li>
 *   <li>{@link #CRITICAL} — requires immediate user action (security, account lock).</li>
 * </ul>
 */
public enum NotificationPriority {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}
