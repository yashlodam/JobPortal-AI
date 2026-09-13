package com.jobportal.interview.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.interview.entity.InterviewQuestion;

/**
 * Repository interface for {@link InterviewQuestion} management.
 */
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {

    /** Get all questions for a session ordered by orderNumber. */
    List<InterviewQuestion> findBySessionIdOrderByOrderNumberAsc(Long sessionId);

    /** Get a specific question by session ID and order number. */
    Optional<InterviewQuestion> findBySessionIdAndOrderNumber(Long sessionId, int orderNumber);

    /** Count total questions generated for a session so far. */
    int countBySessionId(Long sessionId);

    /** Delete all questions associated with a session. */
    void deleteBySessionId(Long sessionId);
}
