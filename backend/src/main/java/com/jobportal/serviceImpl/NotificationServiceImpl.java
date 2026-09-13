package com.jobportal.serviceImpl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.NotificationPriority;
import com.jobportal.domain.NotificationType;
import com.jobportal.dto.request.NotificationFilterRequest;
import com.jobportal.dto.response.NotificationResponse;
import com.jobportal.dto.response.UnreadCountResponse;
import com.jobportal.entity.Notification;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.mapper.NotificationMapper;
import com.jobportal.repository.NotificationRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.specification.NotificationSpecification;
import com.jobportal.service.NotificationService;

/**
 * Production-ready implementation of {@link NotificationService}.
 *
 * <h3>Transaction strategy</h3>
 * <ul>
 *   <li>Read methods annotated with {@code @Transactional(readOnly = true)} —
 *       Hibernate uses an optimised read-only session (no dirty checking).</li>
 *   <li>Write methods annotated with plain {@code @Transactional}.</li>
 *   <li>{@code send()} is safe to call from within an existing transaction;
 *       the notification is committed together with the calling unit of work.</li>
 * </ul>
 *
 * <h3>Performance</h3>
 * <ul>
 *   <li>Bulk mutations (mark-all, archive-all, delete-all) use single JPQL
 *       UPDATE / DELETE statements — no entity hydration.</li>
 *   <li>Single-notification mutations return an affected-row count so the service
 *       can distinguish "not found" from "forbidden" without an extra SELECT.</li>
 *   <li>{@code filterNotifications} uses JPA Specifications — no manual query
 *       string concatenation.</li>
 * </ul>
 *
 * <h3>Extension points</h3>
 * <p>Future integrations (WebSocket push, Firebase FCM, email digest) can be added
 * inside {@link #persistAndNotify} without changing any caller or interface method.</p>
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   UserRepository userRepository,
                                   NotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.userRepository         = userRepository;
        this.notificationMapper     = notificationMapper;
    }

    // ── Creation ─────────────────────────────────────────────────────────────

    /**
     * Minimal send — priority defaults to MEDIUM, no actionUrl.
     * Backward-compatible with all existing callers.
     */
    @Override
    @Transactional
    public void send(User recipient,
                     NotificationType type,
                     String title,
                     String message,
                     Long referenceId,
                     String referenceType) {
        send(recipient, type, NotificationPriority.MEDIUM, title, message,
                null, referenceId, referenceType);
    }

    /**
     * Full send — all fields explicit.
     * Single persistence point: all other send methods delegate here.
     */
    @Override
    @Transactional
    public void send(User recipient,
                     NotificationType type,
                     NotificationPriority priority,
                     String title,
                     String message,
                     String actionUrl,
                     Long referenceId,
                     String referenceType) {
        persistAndNotify(recipient, type, priority, title, message,
                actionUrl, referenceId, referenceType);
    }

    /**
     * Creates a sample SYSTEM notification for the authenticated user.
     * Used by the test endpoint during development.
     */
    @Override
    @Transactional
    public void createTestNotification(String email) throws JobPortalException {
        User user = findUserByEmail(email);
        persistAndNotify(
                user,
                NotificationType.SYSTEM,
                NotificationPriority.LOW,
                "Test Notification",
                "This is a test notification sent via POST /api/notifications/test.",
                null,
                null,
                null
        );
        log.info("Test notification created for user [{}]", email);
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(Long id, String email)
            throws JobPortalException {
        User user = findUserByEmail(email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Notification not found with id: " + id));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw JobPortalException.forbidden(
                    "You are not authorized to access this notification.");
        }
        return notificationMapper.toResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(String email, Pageable pageable)
            throws JobPortalException {
        User user = findUserByEmail(email);
        return notificationRepository
                .findByRecipientId(user.getId(), pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyUnreadNotifications(String email, Pageable pageable)
            throws JobPortalException {
        User user = findUserByEmail(email);
        return notificationRepository
                .findUnreadByRecipientId(user.getId(), pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(String email) throws JobPortalException {
        User user = findUserByEmail(email);
        long count = notificationRepository.countUnreadByRecipientId(user.getId());
        return new UnreadCountResponse(count);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> filterNotifications(NotificationFilterRequest filter,
                                                           String email,
                                                           Pageable pageable)
            throws JobPortalException {
        User user = findUserByEmail(email);
        Specification<Notification> spec =
                NotificationSpecification.buildFrom(user.getId(), filter);
        return notificationRepository.findAll(spec, pageable)
                .map(notificationMapper::toResponse);
    }

    // ── Mutation ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void markAsRead(Long id, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        assertExists(id);
        int updated = notificationRepository.markOneRead(id, user.getId());
        if (updated == 0) {
            throw JobPortalException.forbidden(
                    "You are not authorized to update this notification.");
        }
        log.debug("Notification [{}] marked as read by user [{}]", id, email);
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) throws JobPortalException {
        User user = findUserByEmail(email);
        notificationRepository.markAllReadForUser(user.getId());
        log.debug("All notifications marked as read for user [{}]", email);
    }

    @Override
    @Transactional
    public void archiveNotification(Long id, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        assertExists(id);
        int updated = notificationRepository.archiveOneByIdAndRecipientId(id, user.getId());
        if (updated == 0) {
            throw JobPortalException.forbidden(
                    "You are not authorized to archive this notification.");
        }
        log.debug("Notification [{}] archived by user [{}]", id, email);
    }

    @Override
    @Transactional
    public void archiveAllNotifications(String email) throws JobPortalException {
        User user = findUserByEmail(email);
        notificationRepository.archiveAllForUser(user.getId());
        log.debug("All notifications archived for user [{}]", email);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        assertExists(id);
        int deleted = notificationRepository.deleteByIdAndRecipientId(id, user.getId());
        if (deleted == 0) {
            throw JobPortalException.forbidden(
                    "You are not authorized to delete this notification.");
        }
        log.debug("Notification [{}] deleted by user [{}]", id, email);
    }

    @Override
    @Transactional
    public void deleteAllNotifications(String email) throws JobPortalException {
        User user = findUserByEmail(email);
        notificationRepository.deleteAllByRecipientId(user.getId());
        log.debug("All notifications deleted for user [{}]", email);
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Core persistence method — the single point where a Notification is built and saved.
     *
     * <p>This is the extension point for future integrations:
     * WebSocket push, Firebase FCM, email digest, etc. can all be added here
     * without touching any service interface or caller.</p>
     */
    private void persistAndNotify(User recipient,
                                   NotificationType type,
                                   NotificationPriority priority,
                                   String title,
                                   String message,
                                   String actionUrl,
                                   Long referenceId,
                                   String referenceType) {
        Notification notification = new Notification(
                recipient, type, priority, title, message, actionUrl,
                referenceId, referenceType);
        notificationRepository.save(notification);
        log.debug("Notification saved — type=[{}] priority=[{}] recipient=[{}]",
                type, priority, recipient.getEmail());

        // ── Future integration hooks (uncomment when ready) ─────────────────
        // webSocketNotificationService.push(recipient.getId(), notification);
        // firebasePushService.send(recipient, notification);
    }

    /**
     * Finds a user by email; throws 404 if not found.
     */
    private User findUserByEmail(String email) throws JobPortalException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("User not found: " + email));
    }

    /**
     * Asserts that a notification with the given ID exists; throws 404 if not.
     * Separated from ownership check so the caller can differentiate
     * "not found" (404) from "not owned" (403) — important for security UX.
     */
    private void assertExists(Long id) throws JobPortalException {
        if (!notificationRepository.existsById(id)) {
            throw JobPortalException.notFound("Notification not found with id: " + id);
        }
    }
}
