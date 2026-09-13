package com.jobportal.interview.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.interview.entity.InterviewAnswer;

/**
 * Repository interface for {@link InterviewAnswer} management.
 */
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, Long> {

    /** Find all answers for a session in order. */
    List<InterviewAnswer> findBySessionIdOrderBySubmittedAtAsc(Long sessionId);

    /** Find answer for a specific question. */
    Optional<InterviewAnswer> findByQuestionId(Long questionId);

    /** Count total submitted answers for a session. */
    int countBySessionId(Long sessionId);

    /** Delete all answers associated with a session. */
    void deleteBySessionId(Long sessionId);

    /** Calculate average score across all answered questions in a session. */
    @Query("SELECT AVG(a.score) FROM InterviewAnswer a WHERE a.session.id = :sessionId")
    Double getAverageScoreForSession(@Param("sessionId") Long sessionId);
}
