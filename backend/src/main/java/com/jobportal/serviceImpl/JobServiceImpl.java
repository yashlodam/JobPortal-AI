package com.jobportal.serviceImpl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.chat.repository.ConversationRepository;
import com.jobportal.domain.JobStatus;
import com.jobportal.dto.request.JobFilterRequest;
import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.CategoryResponse;
import com.jobportal.dto.response.JobDetailResponse;
import com.jobportal.dto.response.JobSummaryResponse;
import com.jobportal.dto.response.SearchFacetsResponse;
import com.jobportal.dto.response.SearchSuggestionsResponse;
import com.jobportal.dto.response.WorkModeResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.event.JobDeletedEvent;
import com.jobportal.event.JobPostedEvent;
import com.jobportal.service.JobSearchEngineService;

import com.jobportal.exception.JobPortalException;
import com.jobportal.jobmatch.repository.JobMatchAnalysisRepository;
import com.jobportal.mapper.JobMapper;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.specification.JobSpecification;
import com.jobportal.service.JobService;
import com.jobportal.service.RecruiterAuthorizationService;

/**
 * Job service implementation.
 *
 * <h3>Query Strategy</h3>
 *
 * <h4>Create</h4>
 * <p>New Job entity — {@code save()} persists it. Skills collections are empty
 * {@code ArrayList}s (initialized in entity constructor), so
 * {@code applyRequest} can call {@code .clear() + .addAll()} safely
 * with no lazy-load issue.</p>
 *
 * <h4>Update</h4>
 * <p>Load via {@code findByIdWithDetails} (EntityGraph: company + recruiter +
 * recruiter.user). This also initializes {@code skillsRequired} and
 * {@code preferredSkills} as proper Hibernate collections within the session,
 * so {@code applyRequest}'s {@code .clear() + .addAll()} does not trigger a
 * {@code LazyInitializationException}.</p>
 *
 * <h4>Read (lists)</h4>
 * <p>All paginated list queries use named JPQL methods in {@link JobRepository}
 * that have an explicit {@code countQuery}. EntityGraph is applied to the data
 * query — company and recruiter.user are loaded in one JOIN. skillsRequired is
 * loaded by {@code @BatchSize(25)} in one additional batch query.</p>
 *
 * <h4>Read (filter/search via Specifications)</h4>
 * <p>{@code @EntityGraph} does NOT apply to {@code JpaSpecificationExecutor.findAll}.
 * Company and recruiter are therefore loaded by Hibernate's {@code @BatchSize}
 * (set on the entity associations via the global property) in two additional
 * batch queries. Total for a page of N: 1 (data) + 1 (count) + 2 (batch) = 4 SQL,
 * constant regardless of N.</p>
 *
 * <h4>View count increment</h4>
 * <p>Uses a dedicated {@code @Modifying} UPDATE query that touches only one
 * column — no entity load + save cycle needed.</p>
 *
 * <h3>Notifications (event-driven)</h3>
 * <ul>
 *   <li>{@link JobPostedEvent} — fired after a job is successfully created.
 *       The listener logs/fans-out job-match notifications to matched users.</li>
 *   <li>{@link JobDeletedEvent} — fired before entity deletion.
 *       Carries all applicant IDs so the listener can notify them about
 *       the job being removed.</li>
 * </ul>
 */
@Service
public class JobServiceImpl implements JobService {

    private final JobRepository                  jobRepository;
    private final UserRepository                 userRepository;
    private final RecruiterRepository            recruiterRepository;
    private final CompanyRepository              companyRepository;
    private final JobApplicationRepository       jobApplicationRepository;
    private final JobMapper                      jobMapper;
    private final ApplicationEventPublisher      eventPublisher;
    private final RecruiterAuthorizationService  recruiterAuthorizationService;
    private final ConversationRepository         conversationRepository;
    private final JobMatchAnalysisRepository     jobMatchAnalysisRepository;
    private final JobSearchEngineService         jobSearchEngineService;

    public JobServiceImpl(
            JobRepository jobRepository,
            UserRepository userRepository,
            RecruiterRepository recruiterRepository,
            CompanyRepository companyRepository,
            JobApplicationRepository jobApplicationRepository,
            JobMapper jobMapper,
            ApplicationEventPublisher eventPublisher,
            RecruiterAuthorizationService recruiterAuthorizationService,
            ConversationRepository conversationRepository,
            JobMatchAnalysisRepository jobMatchAnalysisRepository,
            JobSearchEngineService jobSearchEngineService) {
        this.jobRepository                 = jobRepository;
        this.userRepository                = userRepository;
        this.recruiterRepository           = recruiterRepository;
        this.companyRepository             = companyRepository;
        this.jobApplicationRepository      = jobApplicationRepository;
        this.jobMapper                     = jobMapper;
        this.eventPublisher                = eventPublisher;
        this.recruiterAuthorizationService = recruiterAuthorizationService;
        this.conversationRepository        = conversationRepository;
        this.jobMatchAnalysisRepository    = jobMatchAnalysisRepository;
        this.jobSearchEngineService        = jobSearchEngineService;
    }

    // ── Create ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public JobDetailResponse createJob(JobRequest dto, String email) throws JobPortalException {
        // ── SECURITY GATE: approved or pending recruiters can post jobs ─────────────
        Recruiter recruiter = recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email);
        User user = recruiter.getUser();

        if (recruiter.getCompany() == null) {
            throw JobPortalException.badRequest(
                    "You must create a company profile before posting jobs.");
        }

        Job job = new Job();
        jobMapper.applyRequest(dto, job);
        job.setRecruiter(recruiter);
        job.setCompany(recruiter.getCompany());
        job.setStatus(JobStatus.OPEN);

        Job saved = jobRepository.save(job);

        // ── Publish event (scalars only ─ session is still open here) ────────
        eventPublisher.publishEvent(new JobPostedEvent(
                this,
                saved.getId(),
                saved.getJobTitle(),
                user.getId(),
                Boolean.TRUE.equals(saved.getFeatured())
        ));

        // Re-fetch with full details so the mapper can access company + recruiter.user
        return jobMapper.toDetail(findJobByIdWithDetails(saved.getId()));
    }

    // ── Update ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public JobDetailResponse updateJob(Long jobId, JobRequest dto, String email)
            throws JobPortalException {
        // ── SECURITY GATE: approved or pending recruiters can update their jobs ───
        Recruiter recruiter = recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email);
        User user = recruiter.getUser();

        // Use findByIdWithDetails: loads company + recruiter + recruiter.user
        // AND initializes skillsRequired/preferredSkills within this session
        // so applyRequest's .clear() + .addAll() are safe.
        Job job = findJobByIdWithDetails(jobId);

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw JobPortalException.forbidden("You are not authorized to update this job.");
        }

        jobMapper.applyRequest(dto, job);
        jobRepository.save(job);
        return jobMapper.toDetail(findJobByIdWithDetails(jobId));
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteJob(Long jobId, String email) throws JobPortalException {
        // ── SECURITY GATE: approved or pending recruiters can delete their jobs ───
        Recruiter recruiter = recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email);

        Job job = jobRepository.findByIdWithDetails(jobId)
                .orElseThrow(() -> JobPortalException.notFound("Job not found with id: " + jobId));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw JobPortalException.forbidden("You are not authorized to delete this job.");
        }

        // ── Capture applicant IDs BEFORE deletion, while session is open ─────
        List<Long> applicantUserIds =
                jobApplicationRepository.findApplicantUserIdsByJobId(jobId);

        String jobTitle        = job.getJobTitle();
        int    totalApplicants = applicantUserIds.size();

        // ── Clean up FK-constrained child records BEFORE the cascade delete ──
        // 1. Null-out conversation.jobApplication references so conversations
        //    linked to any of this job's applications won't block deletion.
        conversationRepository.detachAllJobApplicationsForJob(jobId);

        // 2. Delete all job-match analyses for this job's applications so the
        //    cascade delete on JobApplication succeeds without FK conflicts.
        jobMatchAnalysisRepository.deleteAllByJobId(jobId);

        // ── Delete the entity (not by id) so JPA cascades to applications ────
        // CascadeType.ALL on Job.applications and Job.savedJobs means Hibernate
        // will DELETE those rows before removing the job row itself.
        jobRepository.delete(job);

        // ── Publish event: listener notifies all applicants (JOB_EXPIRED) ────
        if (totalApplicants > 0) {
            eventPublisher.publishEvent(new JobDeletedEvent(
                    this, jobId, jobTitle, totalApplicants, applicantUserIds));
        }
    }

    // ── Single Job Read ───────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public JobDetailResponse getJobById(Long jobId) throws JobPortalException {
        return jobMapper.toDetail(findJobByIdWithDetails(jobId));
    }

    // ── View Count ────────────────────────────────────────────────────────────

    /**
     * Increments view count atomically via a single UPDATE, then returns
     * the full job detail. Two queries total, no entity load + save cycle.
     */
    @Override
    @Transactional
    public JobDetailResponse incrementViewAndGet(Long jobId) throws JobPortalException {
        if (!jobRepository.existsById(jobId)) {
            throw JobPortalException.notFound("Job not found with id: " + jobId);
        }
        jobRepository.incrementViewCount(jobId);
        return jobMapper.toDetail(findJobByIdWithDetails(jobId));
    }

    // ── Public Lists ──────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<JobSummaryResponse> getAllJobs(Pageable pageable) {
        return jobRepository.findAllByStatus(JobStatus.OPEN, pageable)
                .map(jobMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobSummaryResponse> latestJobs() {
        return jobRepository.findTop10OpenJobs(JobStatus.OPEN)
                .stream()
                .map(jobMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobSummaryResponse> featuredJobs(Pageable pageable) {
        return jobRepository.findFeaturedByStatus(JobStatus.OPEN, pageable)
                .map(jobMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobSummaryResponse> similarJobs(Long jobId) throws JobPortalException {
        Job currentJob = findJobByIdWithDetails(jobId);
        Pageable limit = PageRequest.of(0, 5);
        return jobRepository.findSimilarJobs(
                currentJob.getId(),
                JobStatus.OPEN,
                currentJob.getCategory(),
                currentJob.getCity(),
                currentJob.getJobTitle(),
                limit
        ).stream().map(jobMapper::toSummary).toList();
    }

    // ── Recruiter / Company Scoped ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<JobSummaryResponse> getMyJobs(String email, Pageable pageable)
            throws JobPortalException {
        User user = findUserByEmail(email);
        Recruiter recruiter = findRecruiterByUser(user);
        return jobRepository.findByRecruiterWithDetails(recruiter, pageable)
                .map(jobMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobSummaryResponse> getCompanyJobs(Long companyId, Pageable pageable)
            throws JobPortalException {
        if (!companyRepository.existsById(companyId)) {
            throw JobPortalException.notFound("Company not found with id: " + companyId);
        }
        return jobRepository.findByCompanyIdAndStatus(companyId, JobStatus.OPEN, pageable)
                .map(jobMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobSummaryResponse> getJobsByCategory(String category, Pageable pageable) {
        return jobRepository.findByCategoryAndStatus(category, JobStatus.OPEN, pageable)
                .map(jobMapper::toSummary);
    }

    // ── Search & Filter (Specification) ──────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<JobSummaryResponse> searchJobs(String keyword, Pageable pageable) {
        JobFilterRequest filter = new JobFilterRequest();
        filter.setKeyword(keyword);
        return filterJobs(filter, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobSummaryResponse> filterJobs(JobFilterRequest request, Pageable pageable) {
        if (request == null) {
            request = new JobFilterRequest();
        }

        // 1. Intent Extraction & Preprocessing
        if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
            JobSearchEngineService.SearchIntent intent = jobSearchEngineService.parseQuery(request.getKeyword());
            if (intent.getExtractedCity() != null && (request.getCities() == null || request.getCities().isEmpty())) {
                request.setCity(intent.getExtractedCity());
            }
            if (intent.getExtractedMode() != null && (request.getWorkingModes() == null || request.getWorkingModes().isEmpty())) {
                request.setWorkingMode(intent.getExtractedMode());
            }
            if (intent.getExtractedJobType() != null && (request.getJobTypes() == null || request.getJobTypes().isEmpty())) {
                request.setJobType(intent.getExtractedJobType());
            }
            if (intent.getExtractedExperience() != null && (request.getExperienceLevels() == null || request.getExperienceLevels().isEmpty())) {
                request.setExperienceLevel(intent.getExtractedExperience());
            }
            if (intent.getCleanedKeyword() != null && !intent.getCleanedKeyword().isEmpty()) {
                request.setKeyword(intent.getCleanedKeyword());
            }
        }

        Specification<Job> specification = JobSpecification.buildFrom(request);

        // 2. Relevance Ranking when requested or keyword present with default sort
        boolean isRelevanceSort = "relevance".equalsIgnoreCase(request.getSortBy())
                || (request.getKeyword() != null && !request.getKeyword().trim().isEmpty() && isDefaultSort(pageable));

        if (isRelevanceSort) {
            final String finalKeyword = request.getKeyword();
            JobSearchEngineService.SearchIntent intent = jobSearchEngineService.parseQuery(finalKeyword);

            // Bounded candidate pool for Render Free memory safety (max 100 recent matching jobs)
            Pageable candidatePool = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Job> poolPage = jobRepository.findAll(specification, candidatePool);
            List<Job> allMatches = new ArrayList<>(poolPage.getContent());

            allMatches.sort((a, b) -> {
                double scoreB = jobSearchEngineService.calculateRelevanceScore(b, finalKeyword, intent.getTokens(), intent.getSynonyms());
                double scoreA = jobSearchEngineService.calculateRelevanceScore(a, finalKeyword, intent.getTokens(), intent.getSynonyms());
                int cmp = Double.compare(scoreB, scoreA);
                if (cmp != 0) return cmp;
                if (b.getCreatedAt() != null && a.getCreatedAt() != null) {
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                }
                return 0;
            });

            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allMatches.size());
            List<JobSummaryResponse> pagedList = start < allMatches.size()
                    ? allMatches.subList(start, end).stream().map(jobMapper::toSummary).toList()
                    : Collections.emptyList();
            return new PageImpl<>(pagedList, pageable, poolPage.getTotalElements());
        }

        return jobRepository.findAll(specification, pageable).map(jobMapper::toSummary);
    }

    private boolean isDefaultSort(Pageable pageable) {
        if (pageable == null || pageable.getSort().isUnsorted()) return true;
        return pageable.getSort().stream().allMatch(order -> "createdAt".equalsIgnoreCase(order.getProperty()));
    }

    @Override
    @Transactional(readOnly = true)
    public SearchSuggestionsResponse getSearchSuggestions(String query) {
        return jobSearchEngineService.getSuggestions(query);
    }

    @Override
    @Transactional(readOnly = true)
    public SearchFacetsResponse getSearchFacets(JobFilterRequest request) {
        return jobSearchEngineService.getFacets(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return jobRepository.getCategoryCount();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkModeResponse> getWorkModes() {
        return jobRepository.getWorkModeCount();
    }


    // ── Private Helpers ───────────────────────────────────────────────────────

    private User findUserByEmail(String email) throws JobPortalException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("User not found"));
    }

    private Recruiter findRecruiterByUser(User user) throws JobPortalException {
        return recruiterRepository.findByUser(user)
                .orElseThrow(() -> JobPortalException.forbidden(
                        "Recruiter profile not found. Only recruiters can manage jobs."));
    }

    private Job findJobByIdWithDetails(Long jobId) throws JobPortalException {
        return jobRepository.findByIdWithDetails(jobId)
                .orElseThrow(() -> JobPortalException.notFound("Job not found with id: " + jobId));
    }
}
