package com.jobportal.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;
import com.jobportal.dto.request.JobFilterRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.CategoryResponse;
import com.jobportal.dto.response.JobDetailResponse;
import com.jobportal.dto.response.JobSummaryResponse;
import com.jobportal.dto.response.SearchFacetsResponse;
import com.jobportal.dto.response.SearchSuggestionsResponse;
import com.jobportal.dto.response.WorkModeResponse;

import com.jobportal.exception.JobPortalException;
import com.jobportal.service.JobService;

/**
 * Public Job REST controller — read-only endpoints for browsing jobs.
 *
 * <p>All write operations (create, update, delete) and recruiter-scoped reads
 * have been moved to {@link RecruiterController} at {@code /api/recruiter/jobs}.</p>
 *
 * <h3>Design decisions</h3>
 *
 * <h4>POST /api/jobs/filter (not GET with body)</h4>
 * <p>HTTP GET with a request body is technically undefined by the HTTP spec and
 * is not supported by many HTTP clients, proxies, and load balancers. The filter
 * endpoint uses POST to carry the filter criteria in the request body.
 * The Pageable parameters (page, size, sort) are passed as query params
 * — handled automatically by Spring's {@code HandlerMethodArgumentResolver}.</p>
 *
 * <h4>Wildcard return types removed</h4>
 * <p>{@code ApiResponse<?>} breaks API documentation tools (OpenAPI/Swagger)
 * and client code generators. All endpoints have fully typed returns.</p>
 */
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // ── Public Read Endpoints ─────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> getAllJobs(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getAllJobs(pageable)));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobDetailResponse>> getJobById(
            @PathVariable Long jobId) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(jobService.getJobById(jobId)));
    }

    /**
     * Increments view count and returns the full job detail.
     * Whitelisted as public in SecurityConfig.
     */
    @PostMapping("/{jobId}/view")
    public ResponseEntity<ApiResponse<JobDetailResponse>> viewJob(
            @PathVariable Long jobId) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(jobService.incrementViewAndGet(jobId)));
    }

    /**
     * Autocomplete suggestions for search input typeahead.
     * Returns matching job titles, skills, companies, and locations.
     */
    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<SearchSuggestionsResponse>> getSearchSuggestions(
            @RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(jobService.getSearchSuggestions(query)));
    }

    /**
     * Live search facets and aggregation counts for filter sidebar chips.
     */
    @GetMapping("/facets")
    public ResponseEntity<ApiResponse<SearchFacetsResponse>> getSearchFacets(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city) {
        JobFilterRequest filter = new JobFilterRequest();
        filter.setKeyword(keyword);
        filter.setCategory(category);
        filter.setCity(city);
        return ResponseEntity.ok(ApiResponse.success(jobService.getSearchFacets(filter)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String workingMode,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) Long minimumSalary,
            @RequestParam(required = false) Long maximumSalary,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String qualification,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean urgentHiring,
            @RequestParam(required = false) Boolean easyApply,
            @RequestParam(required = false) Integer postedWithinDays,
            @RequestParam(required = false) String sortBy,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        JobFilterRequest filter = new JobFilterRequest();
        filter.setKeyword(keyword);
        filter.setCity(city);
        filter.setState(state);
        filter.setCountry(country);
        filter.setJobTypes(parseJobTypes(jobType));
        filter.setWorkingModes(parseWorkingModes(workingMode));
        filter.setExperienceLevels(parseExperienceLevels(experienceLevel));
        filter.setMinimumSalary(minimumSalary);
        filter.setMaximumSalary(maximumSalary);
        filter.setSkills(skills);
        filter.setCategory(category);
        filter.setQualification(qualification);
        filter.setFeatured(featured);
        filter.setUrgentHiring(urgentHiring);
        filter.setEasyApply(easyApply);
        filter.setPostedWithinDays(postedWithinDays);
        filter.setSortBy(sortBy);

        return ResponseEntity.ok(ApiResponse.success(jobService.filterJobs(filter, pageable)));
    }

    private List<JobType> parseJobTypes(String raw) {
        if (raw == null || raw.trim().isEmpty()) return new ArrayList<>();
        List<JobType> list = new ArrayList<>();
        for (String s : raw.split(",")) {
            String clean = s.trim();
            if (!clean.isEmpty()) {
                try {
                    list.add(JobType.valueOf(clean.toUpperCase()));
                } catch (IllegalArgumentException ignored) {}
            }
        }
        return list;
    }

    private List<WorkingMode> parseWorkingModes(String raw) {
        if (raw == null || raw.trim().isEmpty()) return new ArrayList<>();
        List<WorkingMode> list = new ArrayList<>();
        for (String s : raw.split(",")) {
            WorkingMode mode = WorkingMode.fromString(s.trim());
            if (mode != null) {
                list.add(mode);
            }
        }
        return list;
    }

    private List<ExperienceLevel> parseExperienceLevels(String raw) {
        if (raw == null || raw.trim().isEmpty()) return new ArrayList<>();
        List<ExperienceLevel> list = new ArrayList<>();
        for (String s : raw.split(",")) {
            ExperienceLevel level = ExperienceLevel.fromString(s.trim());
            if (level != null) {
                list.add(level);
            }
        }
        return list;
    }


    /**
     * Advanced filter endpoint. Uses POST (not GET) because complex filter
     * objects with lists (skills, etc.) are not reliably passed as GET query params.
     * Pageable (page, size, sort) is resolved from query params by Spring.
     *
     * Example: POST /api/jobs/filter?page=0&size=10&sort=createdAt,desc
     */
    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> filterJobs(
            @RequestBody(required = false) JobFilterRequest request,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        if (request == null) request = new JobFilterRequest();
        return ResponseEntity.ok(ApiResponse.success(
                jobService.filterJobs(request, pageable)));
    }

    @GetMapping("/company/jobs/{companyId}")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> getCompanyJobs(
            @PathVariable Long companyId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getCompanyJobs(companyId, pageable)));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> getJobsByCategory(
            @PathVariable String category,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getJobsByCategory(category, pageable)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getCategories()));
    }

    @GetMapping("/work-modes")
    public ResponseEntity<ApiResponse<List<WorkModeResponse>>> getWorkModes() {
        return ResponseEntity.ok(ApiResponse.success(jobService.getWorkModes()));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<JobSummaryResponse>>> latestJobs() {
        return ResponseEntity.ok(ApiResponse.success(jobService.latestJobs()));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> featuredJobs(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(jobService.featuredJobs(pageable)));
    }

    @GetMapping("/{jobId}/similar")
    public ResponseEntity<ApiResponse<List<JobSummaryResponse>>> similarJobs(
            @PathVariable Long jobId) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(jobService.similarJobs(jobId)));
    }
}
