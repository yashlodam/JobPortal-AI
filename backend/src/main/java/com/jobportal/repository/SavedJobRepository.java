package com.jobportal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.entity.SavedJob;

public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {

    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    Optional<SavedJob> findByUserIdAndJobId(Long userId, Long jobId);

    @EntityGraph(attributePaths = {"job", "job.company", "job.recruiter", "job.recruiter.user"})
    Page<SavedJob> findByUserId(Long userId, Pageable pageable);

    /**
     * Returns all job IDs saved by a given user in a single query.
     * Used by the recommendation engine to flag saved jobs without N+1.
     */
    @Query("SELECT sj.job.id FROM SavedJob sj WHERE sj.user.id = :userId")
    List<Long> findJobIdsByUserId(@Param("userId") Long userId);
}
