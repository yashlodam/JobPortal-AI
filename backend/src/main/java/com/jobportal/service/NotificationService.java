package com.jobportal.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jobportal.domain.NotificationPriority;
import com.jobportal.domain.NotificationType;
import com.jobportal.dto.request.NotificationFilterRequest;
import com.jobportal.dto.response.NotificationResponse;
import com.jobportal.dto.response.UnreadCountResponse;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;

/**
 * Service contract for creating and managing in-app notifications.
 *
 * <h3>Creation API</h3>
 * <p>Two overloads of {@code send} are provided:
 * <ul>
 *   <li>A minimal overload for quick internal calls (priority defaults to MEDIUM,
 *       no actionUrl).</li>
 *   <li>A full overload accepting all fields for rich notifications
 *       (e.g. interview reminders with a deep-link URL and HIGH priority).</li>
 * </ul>
 * All other services call these methods. No external module should access
 * {@link com.jobportal.repository.NotificationRepository} directly.</p>
 *
 * <h3>Search</h3>
 * <p>{@link #filterNotifications} uses JPA Specifications and supports
 * keyword search, type/priority/read filtering, and date ranges.</p>
 *
 * <h3>Extension points</h3>
 * <p>This interface is intentionally thin on infrastructure details so
 * an {@code @Async} WebSocket push, Kafka producer, or Firebase FCM call
 * can be added inside the implementation without changing callers.</p>
 */
public interface NotificationService {

    // ── Creation ─────────────────────────────────────────────────────────────

    /**
     * Minimal notification creator — priority defaults to {@code MEDIUM},
     * no actionUrl, no image/icon.
     *
     * @param recipient     target user (never null)
     * @param type          event category
     * @param title         short heading (max 150 chars)
     * @param message       detail text (max 500 chars)
     * @param referenceId   optional ID of the triggering entity (nullable)
     * @param referenceType optional type discriminator, e.g. {@code "JOB"} (nullable)
     */
    void send(User recipient,
              NotificationType type,
              String title,
              String message,
              Long referenceId,
              String referenceType);

    /**
     * Full notification creator — all fields explicit.
     *
     * @param recipient     target user (never null)
     * @param type          event category
     * @param priority      urgency level
     * @param title         short heading (max 150 chars)
     * @param message       detail text (max 500 chars)
     * @param actionUrl     optional deep-link URL (nullable)
     * @param referenceId   optional ID of the triggering entity (nullable)
     * @param referenceType optional type discriminator (nullable)
     */
    void send(User recipient,
              NotificationType type,
              NotificationPriority priority,
              String title,
              String message,
              String actionUrl,
              Long referenceId,
              String referenceType);

    /**
     * Creates a sample {@code SYSTEM} notification for the authenticated user.
     * Used by the {@code POST /api/notifications/test} endpoint during development.
     *
     * @param email authenticated user's email
     * @throws JobPortalException if user not found
     */
    void createTestNotification(String email) throws JobPortalException;

    // ── Read ─────────────────────────────────────────────────────────────────

    /**
     * Fetch a single notification by ID.
     * Validates ownership — throws {@code 403} if the notification belongs to another user.
     *
     * @param id    notification ID
     * @param email authenticated user's email
     * @throws JobPortalException 404 if not found, 403 if not owned
     */
    NotificationResponse getNotificationById(Long id, String email) throws JobPortalException;

    /**
     * Paginated notification feed — active (non-archived) notifications, newest-first.
     *
     * @param email    authenticated user's email
     * @param pageable pagination + sorting parameters
     * @throws JobPortalException if user not found
     */
    Page<NotificationResponse> getMyNotifications(String email, Pageable pageable)
            throws JobPortalException;

    /**
     * Paginated feed of only unread, active notifications — drives the bell dropdown.
     *
     * @param email    authenticated user's email
     * @param pageable pagination parameters
     * @throws JobPortalException if user not found
     */
    Page<NotificationResponse> getMyUnreadNotifications(String email, Pageable pageable)
            throws JobPortalException;

    /**
     * Count of unread, active notifications — drives the bell badge.
     *
     * @param email authenticated user's email
     * @throws JobPortalException if user not found
     */
    UnreadCountResponse getUnreadCount(String email) throws JobPortalException;

    /**
     * Composable search and filter for the notification inbox.
     * Supports keyword, type, priority, read status, archived flag, and date ranges.
     *
     * @param filter   filter criteria (all fields optional)
     * @param email    authenticated user's email
     * @param pageable pagination + sorting parameters
     * @throws JobPortalException if user not found
     */
    Page<NotificationResponse> filterNotifications(NotificationFilterRequest filter,
                                                    String email,
                                                    Pageable pageable)
            throws JobPortalException;

    // ── Mutation ─────────────────────────────────────────────────────────────

    /**
     * Mark one notification as read.
     * Validates ownership before mutation.
     *
     * @param id    notification ID
     * @param email authenticated user's email
     * @throws JobPortalException 404 if not found, 403 if not owned
     */
    void markAsRead(Long id, String email) throws JobPortalException;

    /**
     * Mark all active, unread notifications as read in one bulk UPDATE.
     *
     * @param email authenticated user's email
     * @throws JobPortalException if user not found
     */
    void markAllAsRead(String email) throws JobPortalException;

    /**
     * Archive one notification (soft-dismiss without deletion).
     * Validates ownership before mutation.
     *
     * @param id    notification ID
     * @param email authenticated user's email
     * @throws JobPortalException 404 if not found, 403 if not owned
     */
    void archiveNotification(Long id, String email) throws JobPortalException;

    /**
     * Archive all active notifications for the user in one bulk UPDATE.
     *
     * @param email authenticated user's email
     * @throws JobPortalException if user not found
     */
    void archiveAllNotifications(String email) throws JobPortalException;

    /**
     * Hard-delete one notification.
     * Validates ownership before deletion.
     *
     * @param id    notification ID
     * @param email authenticated user's email
     * @throws JobPortalException 404 if not found, 403 if not owned
     */
    void deleteNotification(Long id, String email) throws JobPortalException;

    /**
     * Hard-delete all notifications for the user.
     *
     * @param email authenticated user's email
     * @throws JobPortalException if user not found
     */
    void deleteAllNotifications(String email) throws JobPortalException;
}
