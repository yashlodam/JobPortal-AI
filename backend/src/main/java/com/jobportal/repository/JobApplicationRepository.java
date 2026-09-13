package com.jobportal.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.entity.JobApplication;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    boolean existsByApplicantIdAndJobId(Long applicantId, Long jobId);

    /**
     * Load a single application with ALL associations needed by the status-update
     * path and the response mapper: job, job.company, job.recruiter, applicant, resume.
     * One query — no follow-up lazy loads needed.
     */
    @EntityGraph(attributePaths = {"job", "job.company", "job.recruiter", "job.recruiter.user", "applicant", "resume"})
    @Query("SELECT ja FROM JobApplication ja WHERE ja.id = :id")
    Optional<JobApplication> findByIdWithDetails(@Param("id") Long id);

    @EntityGraph(attributePaths = {"job", "job.company", "applicant", "resume"})
    Page<JobApplication> findByApplicantId(Long applicantId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company", "applicant", "resume"})
    Page<JobApplication> findByJobId(Long jobId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company", "job.recruiter", "applicant", "resume"})
    @Query(
        value = "SELECT ja FROM JobApplication ja WHERE ja.job.recruiter.id = :recruiterId OR ja.job.recruiter.user.id = :userId",
        countQuery = "SELECT COUNT(ja) FROM JobApplication ja WHERE ja.job.recruiter.id = :recruiterId OR ja.job.recruiter.user.id = :userId"
    )
    Page<JobApplication> findByJobRecruiterIdOrUserId(@Param("recruiterId") Long recruiterId, @Param("userId") Long userId, Pageable pageable);

    default Page<JobApplication> findByJobRecruiterId(Long recruiterId, Pageable pageable) {
        return findByJobRecruiterIdOrUserId(recruiterId, recruiterId, pageable);
    }

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.job.recruiter.id = :recruiterId OR ja.job.recruiter.user.id = :userId")
    long countByJobRecruiterIdOrUserId(@Param("recruiterId") Long recruiterId, @Param("userId") Long userId);

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE (ja.job.recruiter.id = :recruiterId OR ja.job.recruiter.user.id = :userId) AND ja.status = :status")
    long countByJobRecruiterIdOrUserIdAndStatus(
            @Param("recruiterId") Long recruiterId,
            @Param("userId") Long userId,
            @Param("status") com.jobportal.domain.ApplicationStatus status);

    @EntityGraph(attributePaths = {"job", "job.company", "applicant", "resume"})
    Optional<JobApplication> findByApplicantIdAndJobId(Long applicantId, Long jobId);

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.job.id = :jobId")
    long countByJobId(@Param("jobId") Long jobId);

    /**
     * Returns all applicant user IDs for a given job.
     * Used by {@link com.jobportal.serviceImpl.JobServiceImpl#deleteJob}
     * to capture IDs before the job entity is deleted, so the
     * {@link com.jobportal.event.JobDeletedEvent} listener can notify them.
     */
    @Query("SELECT ja.applicant.id FROM JobApplication ja WHERE ja.job.id = :jobId")
    java.util.List<Long> findApplicantUserIdsByJobId(@Param("jobId") Long jobId);

    /**
     * Disassociates deleted resumes from past job applications so foreign key constraints are not violated.
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE JobApplication ja SET ja.resume = null WHERE ja.resume.id = :resumeId")
    void nullifyResumeReference(@Param("resumeId") Long resumeId);
}
