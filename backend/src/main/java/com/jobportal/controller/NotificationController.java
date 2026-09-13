package com.jobportal.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.request.NotificationFilterRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.NotificationResponse;
import com.jobportal.dto.response.UnreadCountResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.NotificationService;

/**
 * REST controller for in-app notifications.
 *
 * <p>All endpoints require an authenticated user. Users can only access their own
 * notifications — ownership validation happens in the service layer.</p>
 *
 * <h3>Routes</h3>
 * <pre>
 *   GET    /api/notifications                  — paginated active feed (all)
 *   GET    /api/notifications/{id}             — single notification
 *   GET    /api/notifications/unread           — paginated unread feed
 *   GET    /api/notifications/unread-count     — bell badge count
 *   GET    /api/notifications/search           — filter/search (query params)
 *
 *   PUT    /api/notifications/{id}/read        — mark one as read
 *   PUT    /api/notifications/read-all         — mark all as read
 *   PUT    /api/notifications/archive/{id}     — archive one
 *   PUT    /api/notifications/archive-all      — archive all
 *
 *   DELETE /api/notifications/{id}             — hard-delete one
 *   DELETE /api/notifications/delete-all       — hard-delete all
 *
 *   POST   /api/notifications/test             — create test notification (dev)
 * </pre>
 *
 * <h3>Path-variable vs literal-segment precedence</h3>
 * <p>Spring MVC resolves literal path segments before path-variable patterns.
 * {@code /unread}, {@code /unread-count}, {@code /read-all}, {@code /archive-all},
 * {@code /delete-all}, {@code /search}, and {@code /test} all take precedence
 * over {@code /{id}} for GET and DELETE mappings.</p>
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // ── Read Endpoints ────────────────────────────────────────────────────────

    /**
     * Paginated active notification feed — all non-archived notifications, newest-first.
     *
     * <p>Default: 20 items per page, sorted by {@code createdAt} descending.</p>
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getAll(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return ResponseEntity.ok(ApiResponse.success(Page.empty(pageable)));
        }
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getMyNotifications(authentication.getName(), pageable)));
    }

    /**
     * Fetch a single notification by ID.
     *
     * <p>Returns {@code 404} if not found, {@code 403} if it belongs to another user.</p>
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getById(
            @PathVariable Long id,
            Authentication authentication)
            throws JobPortalException {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getNotificationById(id, authentication.getName())));
    }

    /**
     * Paginated feed of unread, active notifications — drives the bell dropdown panel.
     */
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getUnread(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return ResponseEntity.ok(ApiResponse.success(Page.empty(pageable)));
        }
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getMyUnreadNotifications(authentication.getName(), pageable)));
    }

    /**
     * Lightweight unread count — poll this frequently to drive the bell badge.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
            Authentication authentication) throws JobPortalException {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return ResponseEntity.ok(ApiResponse.success(new UnreadCountResponse(0L)));
        }
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getUnreadCount(authentication.getName())));
    }

    /**
     * Composable search and filter endpoint.
     *
     * <p>All query parameters are optional. Absent parameters produce no predicate.</p>
     *
     * <p>Supported parameters:
     * <ul>
     *   <li>{@code keyword} — case-insensitive full-text search on title + message</li>
     *   <li>{@code type} — exact match on {@link com.jobportal.domain.NotificationType}</li>
     *   <li>{@code priority} — exact match on {@link com.jobportal.domain.NotificationPriority}</li>
     *   <li>{@code read} — {@code true} or {@code false}</li>
     *   <li>{@code archived} — {@code true} to include archived; defaults to active only</li>
     *   <li>{@code fromDate}, {@code toDate} — ISO-8601 datetime range on {@code createdAt}</li>
     * </ul>
     * </p>
     *
     * <p>Example: {@code GET /api/notifications/search?keyword=interview&type=INTERVIEW_SCHEDULED&read=false}</p>
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> search(
            @ModelAttribute NotificationFilterRequest filter,
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.filterNotifications(filter, authentication.getName(), pageable)));
    }

    // ── Mark-Read Endpoints ───────────────────────────────────────────────────

    /**
     * Mark a single notification as read.
     *
     * <p>Returns {@code 404} if not found, {@code 403} if not owned by the caller.</p>
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            Authentication authentication)
            throws JobPortalException {
        notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Notification marked as read."));
    }

    /**
     * Mark all unread, active notifications as read in one call.
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            Authentication authentication)
            throws JobPortalException {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("All notifications marked as read."));
    }

    // ── Archive Endpoints ─────────────────────────────────────────────────────

    /**
     * Archive (soft-dismiss) a single notification.
     * Archived notifications are hidden from the main feed but not deleted.
     *
     * <p>Returns {@code 404} if not found, {@code 403} if not owned by the caller.</p>
     */
    @PutMapping("/archive/{id}")
    public ResponseEntity<ApiResponse<Void>> archiveOne(
            @PathVariable Long id,
            Authentication authentication)
            throws JobPortalException {
        notificationService.archiveNotification(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Notification archived."));
    }

    /**
     * Archive all active notifications (inbox-zero).
     */
    @PutMapping("/archive-all")
    public ResponseEntity<ApiResponse<Void>> archiveAll(
            Authentication authentication)
            throws JobPortalException {
        notificationService.archiveAllNotifications(authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("All notifications archived."));
    }

    // ── Delete Endpoints ──────────────────────────────────────────────────────

    /**
     * Hard-delete a single notification.
     *
     * <p>Returns {@code 404} if not found, {@code 403} if not owned by the caller.</p>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOne(
            @PathVariable Long id,
            Authentication authentication)
            throws JobPortalException {
        notificationService.deleteNotification(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Notification deleted."));
    }

    /**
     * Hard-delete all notifications for the authenticated user (clear inbox).
     */
    @DeleteMapping("/delete-all")
    public ResponseEntity<ApiResponse<Void>> deleteAll(
            Authentication authentication)
            throws JobPortalException {
        notificationService.deleteAllNotifications(authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("All notifications deleted."));
    }

    // ── Development / Test ────────────────────────────────────────────────────

    /**
     * Creates a sample {@code SYSTEM} notification for the authenticated user.
     * Useful for verifying the notification pipeline during development.
     *
     * <p><strong>Note:</strong> Restrict this endpoint to admin/dev roles before
     * deploying to production.</p>
     */
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<Void>> createTestNotification(
            Authentication authentication)
            throws JobPortalException {
        notificationService.createTestNotification(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.message("Test notification created successfully."));
    }
}
