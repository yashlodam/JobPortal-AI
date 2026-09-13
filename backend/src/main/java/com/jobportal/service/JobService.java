package com.jobportal.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jobportal.dto.request.JobFilterRequest;
import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.CategoryResponse;
import com.jobportal.dto.response.JobDetailResponse;
import com.jobportal.dto.response.JobSummaryResponse;
import com.jobportal.dto.response.WorkModeResponse;
import com.jobportal.exception.JobPortalException;

/**
 * Job service contract.
 *
 * <p>createJob and updateJob return {@code JobDetailResponse} (not Summary)
 * because the client needs to display the created/updated job's full detail
 * immediately after the write — returning Summary would require an immediate
 * follow-up GET.</p>
 *
 * <p>filterJobs accepts a separate {@code Pageable} parameter. Pagination
 * is a transport concern and should not be embedded inside the filter DTO.</p>
 */
public interface JobService {

    // ── Write ────────────────────────────────────────────────────────────────

    JobDetailResponse createJob(JobRequest dto, String email) throws JobPortalException;

    JobDetailResponse updateJob(Long jobId, JobRequest dto, String email) throws JobPortalException;

    void deleteJob(Long jobId, String email) throws JobPortalException;

    // ── Single Read ──────────────────────────────────────────────────────────

    JobDetailResponse getJobById(Long jobId) throws JobPortalException;

    JobDetailResponse incrementViewAndGet(Long jobId) throws JobPortalException;

    // ── Public Lists ─────────────────────────────────────────────────────────

    Page<JobSummaryResponse> getAllJobs(Pageable pageable);

    List<JobSummaryResponse> latestJobs();

    Page<JobSummaryResponse> featuredJobs(Pageable pageable);

    List<JobSummaryResponse> similarJobs(Long jobId) throws JobPortalException;

    // ── Scoped Lists ─────────────────────────────────────────────────────────

    Page<JobSummaryResponse> getMyJobs(String email, Pageable pageable) throws JobPortalException;

    Page<JobSummaryResponse> getCompanyJobs(Long companyId, Pageable pageable) throws JobPortalException;

    Page<JobSummaryResponse> getJobsByCategory(String category, Pageable pageable);

    // ── Search & Filter ──────────────────────────────────────────────────────

    Page<JobSummaryResponse> searchJobs(String keyword, Pageable pageable);

    /**
     * Filter jobs by multiple criteria. Pagination is separate from filter criteria.
     *
     * @param request filter predicates (no pagination embedded)
     * @param pageable pagination and sorting (from Spring's web resolver)
     */
    Page<JobSummaryResponse> filterJobs(JobFilterRequest request, Pageable pageable);

    List<CategoryResponse> getCategories();

    List<WorkModeResponse> getWorkModes();

    com.jobportal.dto.response.SearchSuggestionsResponse getSearchSuggestions(String query);

    com.jobportal.dto.response.SearchFacetsResponse getSearchFacets(JobFilterRequest request);
}