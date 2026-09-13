package com.jobportal.interview.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.interview.entity.InterviewSession;
import com.jobportal.interview.enums.InterviewStatus;

/**
 * Repository interface for {@link InterviewSession} management.
 */
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    /** Paginated history of sessions for a user, newest first. */
    Page<InterviewSession> findByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);

    /** Find a session by ID and validate ownership. */
    Optional<InterviewSession> findByIdAndUserId(Long id, Long userId);

    /** Count active/completed sessions for a user. */
    long countByUserIdAndStatus(Long userId, InterviewStatus status);

    /** Custom query to check if user has an active session in progress. */
    @Query("SELECT s FROM InterviewSession s WHERE s.user.id = :userId AND s.status = 'IN_PROGRESS'")
    Optional<InterviewSession> findActiveSessionForUser(@Param("userId") Long userId);
}
