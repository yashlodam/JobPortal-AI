package com.jobportal.scheduler;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.NotificationType;
import com.jobportal.repository.NotificationRepository;

/**
 * Scheduled maintenance tasks for the notification table.
 *
 * <h3>Jobs</h3>
 * <ul>
 *   <li><b>Archive expired</b> — runs every hour; moves notifications past their
 *       {@code expiresAt} timestamp to {@code archived = true}.</li>
 *   <li><b>Delete old archived</b> — runs daily at midnight; hard-deletes archived
 *       notifications older than 30 days to prevent unbounded table growth.</li>
 *   <li><b>Clean old system notifications</b> — runs daily at 02:00; deletes read
 *       {@code SYSTEM} notifications older than 7 days (announcements accumulate
 *       quickly and don't need permanent storage).</li>
 * </ul>
 *
 * <h3>Why not use NotificationService?</h3>
 * <p>These are maintenance operations (mass UPDATE / DELETE) that bypass business
 * logic. They operate directly on the repository using batch JPQL queries, which
 * is far more efficient than entity-by-entity processing through the service layer.
 * The scheduler is part of the notification module and is the only component
 * besides the service that is permitted to access the repository directly.</p>
 */
@Component
public class NotificationScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificationScheduler.class);

    /** Notifications archived more than this many days ago will be hard-deleted. */
    private static final int ARCHIVED_RETENTION_DAYS = 30;

    /** Read SYSTEM notifications older than this many days will be deleted. */
    private static final int SYSTEM_NOTIFICATION_RETENTION_DAYS = 7;

    private final NotificationRepository notificationRepository;

    public NotificationScheduler(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // ── Jobs ─────────────────────────────────────────────────────────────────

    /**
     * Archives all non-archived notifications whose {@code expiresAt} has passed.
     * Runs every hour at the top of the hour.
     *
     * <p>Example notifications with expiry: interview reminders (expire after interview time),
     * limited-time offer notifications (expire after offer deadline).</p>
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void archiveExpiredNotifications() {
        try {
            int archived = notificationRepository.archiveExpiredNotifications(LocalDateTime.now());
            if (archived > 0) {
                log.info("Scheduler: archived {} expired notification(s)", archived);
            }
        } catch (Exception ex) {
            log.error("Scheduler: archiveExpiredNotifications failed — {}", ex.getMessage(), ex);
        }
    }

    /**
     * Hard-deletes archived notifications older than {@value #ARCHIVED_RETENTION_DAYS} days.
     * Runs daily at midnight (00:00).
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void deleteOldArchivedNotifications() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(ARCHIVED_RETENTION_DAYS);
            int deleted = notificationRepository.deleteOldArchivedNotifications(cutoff);
            if (deleted > 0) {
                log.info("Scheduler: deleted {} old archived notification(s) (>{}d)",
                        deleted, ARCHIVED_RETENTION_DAYS);
            }
        } catch (Exception ex) {
            log.error("Scheduler: deleteOldArchivedNotifications failed — {}", ex.getMessage(), ex);
        }
    }

    /**
     * Deletes read {@code SYSTEM} notifications older than
     * {@value #SYSTEM_NOTIFICATION_RETENTION_DAYS} days.
     * Runs daily at 02:00 to avoid peak-hour load.
     *
     * <p>System announcements are one-time broadcasts; once read they carry no
     * ongoing value and should not consume storage indefinitely.</p>
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanOldSystemNotifications() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minusDays(SYSTEM_NOTIFICATION_RETENTION_DAYS);
            int deleted = notificationRepository
                    .deleteOldReadNotificationsByType(NotificationType.SYSTEM, cutoff);
            if (deleted > 0) {
                log.info("Scheduler: deleted {} old read SYSTEM notification(s) (>{}d)",
                        deleted, SYSTEM_NOTIFICATION_RETENTION_DAYS);
            }
        } catch (Exception ex) {
            log.error("Scheduler: cleanOldSystemNotifications failed — {}", ex.getMessage(), ex);
        }
    }
}
