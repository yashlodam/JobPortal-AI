package com.jobportal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.domain.JobStatus;
import com.jobportal.dto.response.CategoryResponse;
import com.jobportal.dto.response.WorkModeResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.Recruiter;

/**
 * Job repository.
 *
 * <h3>N+1 Prevention Strategy</h3>
 *
 * <p>The {@code @EntityGraph} annotation on Spring Data derived queries works
 * correctly — Hibernate applies the graph and fires a JOIN FETCH for the listed
 * paths. However, <strong>{@code @EntityGraph} does NOT apply to
 * {@code JpaSpecificationExecutor.findAll(Specification, Pageable)}</strong>.
 * Spring Data creates a separate execution path for Specification queries and
 * ignores interface-level {@code @EntityGraph} declarations.</p>
 *
 * <p>Solution for Specification queries: use an explicit JPQL query with
 * {@code JOIN FETCH}, or, for paginated results, apply {@code @BatchSize} on
 * the entity's associations (already done in the {@link Job} entity) and rely
 * on Hibernate's subselect batch loading. The count query for pagination uses
 * a separate COUNT JPQL, avoiding the Cartesian-product problem.</p>
 *
 * <h3>Skill-search and Cartesian Products</h3>
 *
 * <p>Joining {@code skillsRequired} ({@code @ElementCollection}) inside a
 * Specification's {@code JOIN} for keyword search produces duplicate Job rows
 * (one per matching skill). {@code query.distinct(true)} fixes the data but
 * breaks the count query used by {@code Page}. The fix: move keyword skill
 * searching to an EXISTS subquery or use full-text search at the DB level.
 * The {@link com.jobportal.repository.specification.JobSpecification} has been
 * updated accordingly.</p>
 *
 * <h3>Two query methods per use-case</h3>
 * <ul>
 *   <li>Scalar-only read (write paths, existence checks): plain findById / findByRecruiter</li>
 *   <li>Full-detail read (mapping to DTO): EntityGraph variants load company +
 *       recruiter + recruiter.user in one JOIN without Cartesian product
 *       (all @ManyToOne / @OneToOne — safe to join simultaneously).</li>
 * </ul>
 */
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    // ── Scalar / Mutation paths (no EntityGraph) ─────────────────────────────

    /** Used by mutation paths that only need the job's own scalar fields. */
    Optional<Job> findById(Long id);
    
    @Query("""
    	    SELECT new com.jobportal.dto.response.CategoryResponse(
    	        j.category,
    	        COUNT(j)
    	    )
    	    FROM Job j
    	    WHERE j.status = com.jobportal.domain.JobStatus.OPEN
    	    GROUP BY j.category
    	    ORDER BY COUNT(j) DESC
    	    """)
    	List<CategoryResponse> getCategoryCount();
    
    @Query("""
    	    SELECT new com.jobportal.dto.response.WorkModeResponse(
    	        j.workingMode,
    	        COUNT(j)
    	    )
    	    FROM Job j
    	    WHERE j.status = com.jobportal.domain.JobStatus.OPEN
    	    GROUP BY j.workingMode
    	    ORDER BY COUNT(j) DESC
    	    """)
    	List<WorkModeResponse> getWorkModeCount();

    // ── Full-detail read paths (EntityGraph applied) ──────────────────────────

    /**
     * Loads the job with company, recruiter, and recruiter.user in one JOIN.
     * Used by all read paths that call {@code JobMapper.toDetail()} or
     * {@code JobMapper.toSummary()} — avoids N+1 on company/recruiter.
     *
     * <p>Note: {@code skillsRequired} and {@code preferredSkills} are
     * {@code @ElementCollection} and are NOT included in the EntityGraph.
     * Adding them here would cause a Cartesian product join.
     * They are instead batch-loaded by {@code @BatchSize(25)} on first access
     * within the open transaction — a constant 1 extra SQL per collection.</p>
     */
    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query("SELECT j FROM Job j WHERE j.id = :id")
    Optional<Job> findByIdWithDetails(@Param("id") Long id);

    /**
     * Paginated jobs for all public listing endpoints (getAllJobs, featured, etc.)
     * EntityGraph loads company + recruiter in the main query.
     * The separate COUNT query does not apply the EntityGraph — this is correct
     * and performant.
     *
     * <p>Replaces the {@code findAll(Pageable)} override, which had a subtle bug:
     * Spring Data's {@code @EntityGraph} on the override applied to the data
     * query but Hibernate 6 still issued separate SQL for the count query,
     * which was fine — but the override was misleading. Using a named JPQL
     * query with a separate countQuery is more explicit and maintainable.</p>
     */
    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query(
        value = "SELECT j FROM Job j WHERE j.status = :status",
        countQuery = "SELECT COUNT(j) FROM Job j WHERE j.status = :status"
    )
    Page<Job> findAllByStatus(@Param("status") JobStatus status, Pageable pageable);

    /**
     * All jobs regardless of status — for admin/recruiter dashboards.
     */
    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query(
        value = "SELECT j FROM Job j",
        countQuery = "SELECT COUNT(j) FROM Job j"
    )
    Page<Job> findAllWithDetails(Pageable pageable);

    // ── Recruiter scoped ──────────────────────────────────────────────────────

    /** Used in write paths to check ownership — no EntityGraph needed. */
    boolean existsByIdAndRecruiterId(Long jobId, Long recruiterId);

    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query(
        value = "SELECT j FROM Job j WHERE j.recruiter = :recruiter",
        countQuery = "SELECT COUNT(j) FROM Job j WHERE j.recruiter = :recruiter"
    )
    Page<Job> findByRecruiterWithDetails(@Param("recruiter") Recruiter recruiter, Pageable pageable);

    // ── Featured / Latest ─────────────────────────────────────────────────────

    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query(
        value = "SELECT j FROM Job j WHERE j.featured = true AND j.status = :status",
        countQuery = "SELECT COUNT(j) FROM Job j WHERE j.featured = true AND j.status = :status"
    )
    Page<Job> findFeaturedByStatus(@Param("status") JobStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query("SELECT j FROM Job j WHERE j.status = :status ORDER BY j.createdAt DESC LIMIT 10")
    List<Job> findTop10OpenJobs(@Param("status") JobStatus status);

    // ── Company scoped ────────────────────────────────────────────────────────

    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query(
        value = "SELECT j FROM Job j WHERE j.company.id = :companyId AND j.status = :status",
        countQuery = "SELECT COUNT(j) FROM Job j WHERE j.company.id = :companyId AND j.status = :status"
    )
    Page<Job> findByCompanyIdAndStatus(
            @Param("companyId") Long companyId,
            @Param("status") JobStatus status,
            Pageable pageable);

    // ── Category scoped ───────────────────────────────────────────────────────

    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query(
        value = "SELECT j FROM Job j WHERE LOWER(j.category) = LOWER(:category) AND j.status = :status",
        countQuery = "SELECT COUNT(j) FROM Job j WHERE LOWER(j.category) = LOWER(:category) AND j.status = :status"
    )
    Page<Job> findByCategoryAndStatus(
            @Param("category") String category,
            @Param("status") JobStatus status,
            Pageable pageable);

    // ── Similar Jobs ──────────────────────────────────────────────────────────

    /**
     * Finds up to 5 similar jobs by category, city, or title keyword.
     * EntityGraph applied for DTO mapping. LIMIT done via Pageable.
     *
     * <p>Note: this query is JPQL, not Criteria API, so EntityGraph applies
     * correctly — unlike Specification-based queries.</p>
     */
    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query("""
        SELECT j FROM Job j
        WHERE j.id <> :jobId
          AND j.status = :status
          AND (
              LOWER(j.category) = LOWER(:category)
              OR LOWER(j.city) = LOWER(:city)
              OR LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :jobTitle, '%'))
          )
        ORDER BY j.createdAt DESC
        """)
    List<Job> findSimilarJobs(
            @Param("jobId") Long jobId,
            @Param("status") JobStatus status,
            @Param("category") String category,
            @Param("city") String city,
            @Param("jobTitle") String jobTitle,
            Pageable pageable);

    // ── View counter (dedicated UPDATE — avoids loading the full entity) ───────

    /**
     * Atomically increments the view counter using a targeted UPDATE.
     * This avoids: load entity → modify → save (3 operations) and replaces
     * it with a single {@code UPDATE jobs SET total_views = total_views + 1}
     * statement. Thread-safe at the SQL level.
     */
    @Modifying
    @Query("UPDATE Job j SET j.totalViews = j.totalViews + 1 WHERE j.id = :jobId")
    void incrementViewCount(@Param("jobId") Long jobId);
    
    long countByCompanyIdAndStatus(Long companyId, JobStatus status);

    long countByStatus(JobStatus status);

    @Query("SELECT COUNT(j) FROM Job j WHERE (j.recruiter.id = :recruiterId OR j.recruiter.user.id = :userId) AND j.status = :status")
    long countByRecruiterAndStatus(
            @Param("recruiterId") Long recruiterId,
            @Param("userId") Long userId,
            @Param("status") JobStatus status);

    @Query("SELECT COUNT(j) FROM Job j WHERE (j.recruiter.id = :recruiterId OR j.recruiter.user.id = :userId) AND j.featured = true AND j.status = :status")
    long countFeaturedByRecruiterAndStatus(
            @Param("recruiterId") Long recruiterId,
            @Param("userId") Long userId,
            @Param("status") JobStatus status);

    // ── Recommendation Engine ─────────────────────────────────────────────────

    /**
     * Fetches up to {@code pageable.getPageSize()} OPEN jobs that a given applicant has NOT yet applied to.
     * Used as the candidate pool for the deterministic recommendation engine.
     *
     * <p>EntityGraph loads company + recruiter for DTO mapping.
     * The NOT IN clause leverages the index on job_applications(applicant_id).
     * For applicants with no prior applications, the subquery returns an empty list
     * and the most recent OPEN jobs are returned (capped by Pageable).</p>
     *
     * <p><strong>IMPORTANT:</strong> Always call this with a bounded Pageable (e.g. PageRequest.of(0, 50))
     * to prevent loading the entire jobs table into heap memory for new applicants.</p>
     */
    @EntityGraph(attributePaths = {"company", "recruiter", "recruiter.user"})
    @Query("""
        SELECT j FROM Job j
        WHERE j.status = com.jobportal.domain.JobStatus.OPEN
          AND NOT EXISTS (
              SELECT 1 FROM JobApplication ja
              WHERE ja.applicant.id = :applicantId AND ja.job.id = j.id
          )
        ORDER BY j.createdAt DESC
        """)
    List<Job> findOpenJobsNotAppliedByApplicant(@Param("applicantId") Long applicantId, Pageable pageable);

    // ── Admin / Suspension Operations ─────────────────────────────────────────

    /**
     * Closes all OPEN jobs belonging to a recruiter in a single UPDATE.
     * Called when a recruiter is suspended so their job listings become invisible
     * to applicants immediately without loading and saving each job entity.
     *
     * @param  recruiterId  the recruiter whose open jobs should be closed
     * @return              number of rows affected
     */
    @Modifying
    @Query("""
           UPDATE Job j
           SET j.status = com.jobportal.domain.JobStatus.CLOSED
           WHERE j.recruiter.id = :recruiterId
             AND j.status = com.jobportal.domain.JobStatus.OPEN
           """)
    int closeAllOpenJobsByRecruiterId(@Param("recruiterId") Long recruiterId);

    /**
     * Atomically increments totalApplicants counter for a job.
     */
    @Modifying
    @Query("UPDATE Job j SET j.totalApplicants = COALESCE(j.totalApplicants, 0) + 1 WHERE j.id = :jobId")
    void incrementApplicantCount(@Param("jobId") Long jobId);

    /**
     * Atomically decrements totalApplicants counter for a job (floored at 0).
     */
    @Modifying
    @Query("UPDATE Job j SET j.totalApplicants = CASE WHEN COALESCE(j.totalApplicants, 0) > 0 THEN j.totalApplicants - 1 ELSE 0 END WHERE j.id = :jobId")
    void decrementApplicantCount(@Param("jobId") Long jobId);

    /**
     * Counts the recruiter's jobs for admin dashboard statistics.
     */
    long countByRecruiterId(Long recruiterId);

    // ── Search Engine Autocomplete & Suggestions ─────────────────────────────

    @Query("SELECT DISTINCT j.jobTitle FROM Job j WHERE j.status = com.jobportal.domain.JobStatus.OPEN AND LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY j.jobTitle ASC")
    List<String> findDistinctJobTitlesByPrefix(@Param("query") String query, Pageable pageable);

    @Query("SELECT DISTINCT c.companyName FROM Job j JOIN j.company c WHERE j.status = com.jobportal.domain.JobStatus.OPEN AND LOWER(c.companyName) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY c.companyName ASC")
    List<String> findDistinctCompaniesByPrefix(@Param("query") String query, Pageable pageable);

    @Query("SELECT DISTINCT j.city FROM Job j WHERE j.status = com.jobportal.domain.JobStatus.OPEN AND j.city IS NOT NULL AND LOWER(j.city) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY j.city ASC")
    List<String> findDistinctCitiesByPrefix(@Param("query") String query, Pageable pageable);

    @Query("SELECT DISTINCT s FROM Job j JOIN j.skillsRequired s WHERE j.status = com.jobportal.domain.JobStatus.OPEN AND LOWER(s) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY s ASC")
    List<String> findDistinctSkillsByPrefix(@Param("query") String query, Pageable pageable);

    // ── Search Facets & Aggregations ──────────────────────────────────────────

    @Query("SELECT j.jobType, COUNT(j) FROM Job j WHERE j.status = com.jobportal.domain.JobStatus.OPEN GROUP BY j.jobType")
    List<Object[]> getJobTypeCount();

    @Query("SELECT j.experienceLevel, COUNT(j) FROM Job j WHERE j.status = com.jobportal.domain.JobStatus.OPEN GROUP BY j.experienceLevel")
    List<Object[]> getExperienceLevelCount();

    @Query("SELECT j.city, COUNT(j) FROM Job j WHERE j.status = com.jobportal.domain.JobStatus.OPEN AND j.city IS NOT NULL GROUP BY j.city ORDER BY COUNT(j) DESC")
    List<Object[]> getCityCount(Pageable pageable);
}

