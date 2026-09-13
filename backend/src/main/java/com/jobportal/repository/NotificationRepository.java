package com.jobportal.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.domain.NotificationType;
import com.jobportal.entity.Notification;

/**
 * Repository for {@link Notification} entities.
 *
 * <h3>Security</h3>
 * <p>All queries that target individual notifications include a {@code recipient.id}
 * predicate, ensuring no notification can be read, mutated, or deleted by a user
 * who does not own it (defense against IDOR).</p>
 *
 * <h3>Performance</h3>
 * <ul>
 *   <li>Bulk mutations ({@code markAllReadForUser}, {@code archiveAllForUser},
 *       {@code deleteAllByRecipientId}) use {@code @Modifying} JPQL UPDATE/DELETE
 *       statements to avoid loading entities into memory.</li>
 *   <li>Single-notification mutations return an {@code int} affected-row count
 *       so the service can differentiate "not found" from "forbidden".</li>
 *   <li>Archive and expiry queries support the {@link com.jobportal.scheduler.NotificationScheduler}
 *       cleanup jobs without requiring full entity hydration.</li>
 * </ul>
 *
 * <h3>Specification support</h3>
 * <p>Implements {@link JpaSpecificationExecutor} so the
 * {@link com.jobportal.repository.specification.NotificationSpecification}
 * can drive the search / filter endpoint via {@code findAll(Specification, Pageable)}.</p>
 */
public interface NotificationRepository
        extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {

    // ── Feed queries (non-archived by default) ────────────────────────────────

    /**
     * Paginated notification feed — active (non-archived) notifications only,
     * newest-first.
     */
    @Query("""
            SELECT n FROM Notification n
            WHERE n.recipient.id = :userId
              AND n.archived = false
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> findByRecipientId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Paginated unread + active notification feed — drives the bell dropdown.
     */
    @Query("""
            SELECT n FROM Notification n
            WHERE n.recipient.id = :userId
              AND n.read = false
              AND n.archived = false
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> findUnreadByRecipientId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Count of unread, active notifications — drives the bell badge number.
     */
    @Query("""
            SELECT COUNT(n) FROM Notification n
            WHERE n.recipient.id = :userId
              AND n.read = false
              AND n.archived = false
            """)
    long countUnreadByRecipientId(@Param("userId") Long userId);

    // ── Ownership check ───────────────────────────────────────────────────────

    /** Returns {@code true} if the notification exists and belongs to the given user. */
    boolean existsByIdAndRecipientId(Long id, Long recipientId);

    /**
     * Checks whether the given user already has a notification of a specific type.
     * Used to de-duplicate one-time milestone notifications like {@code PROFILE_COMPLETED}.
     */
    boolean existsByRecipientIdAndType(Long recipientId,
                                        com.jobportal.domain.NotificationType type);

    // ── Single-notification mutations (return affected-row count) ─────────────

    /**
     * Mark one notification as read, but only if it belongs to the given user.
     *
     * @return number of rows updated (0 = not found or not owned)
     */
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.read = true
            WHERE n.id = :id AND n.recipient.id = :userId
            """)
    int markOneRead(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * Archive one notification, only if it belongs to the given user.
     *
     * @return number of rows updated (0 = not found or not owned)
     */
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.archived = true
            WHERE n.id = :id AND n.recipient.id = :userId
            """)
    int archiveOneByIdAndRecipientId(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * Hard-delete one notification, only if it belongs to the given user.
     *
     * @return number of rows deleted (0 = not found or not owned)
     */
    @Modifying
    @Query("""
            DELETE FROM Notification n
            WHERE n.id = :id AND n.recipient.id = :userId
            """)
    int deleteByIdAndRecipientId(@Param("id") Long id, @Param("userId") Long userId);

    // ── Bulk mutations ────────────────────────────────────────────────────────

    /**
     * Mark all unread, active notifications for a user as read in one UPDATE statement.
     */
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.read = true
            WHERE n.recipient.id = :userId
              AND n.read = false
              AND n.archived = false
            """)
    void markAllReadForUser(@Param("userId") Long userId);

    /**
     * Archive all active notifications for a user in one UPDATE statement.
     */
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.archived = true
            WHERE n.recipient.id = :userId
              AND n.archived = false
            """)
    void archiveAllForUser(@Param("userId") Long userId);

    /**
     * Hard-delete all notifications for a user (account cleanup).
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :userId")
    void deleteAllByRecipientId(@Param("userId") Long userId);

    // ── Scheduler queries (maintenance / cleanup) ─────────────────────────────

    /**
     * Archive all non-archived notifications whose {@code expiresAt} timestamp
     * has passed. Called by the hourly scheduler job.
     *
     * @param now current timestamp
     * @return number of rows archived
     */
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.archived = true
            WHERE n.expiresAt IS NOT NULL
              AND n.expiresAt < :now
              AND n.archived = false
            """)
    int archiveExpiredNotifications(@Param("now") LocalDateTime now);

    /**
     * Hard-delete archived notifications older than the given cutoff.
     * Called by the daily scheduler to prevent unbounded table growth.
     *
     * @param before cutoff timestamp (e.g. 30 days ago)
     * @return number of rows deleted
     */
    @Modifying
    @Query("""
            DELETE FROM Notification n
            WHERE n.archived = true
              AND n.createdAt < :before
            """)
    int deleteOldArchivedNotifications(@Param("before") LocalDateTime before);

    /**
     * Hard-delete read SYSTEM notifications older than the given cutoff.
     * System announcements accumulate quickly and don't need permanent storage.
     *
     * @param type   the notification type to clean (e.g. {@code SYSTEM})
     * @param before cutoff timestamp
     * @return number of rows deleted
     */
    @Modifying
    @Query("""
            DELETE FROM Notification n
            WHERE n.type = :type
              AND n.read = true
              AND n.createdAt < :before
            """)
    int deleteOldReadNotificationsByType(@Param("type") NotificationType type,
                                         @Param("before") LocalDateTime before);
}
