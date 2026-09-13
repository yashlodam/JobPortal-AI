package com.jobportal.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.dto.CompanyRequestDTO;
import com.jobportal.dto.CompanyResponseDTO;
import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.request.UpdateApplicationStatusRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.JobApplicationResponse;
import com.jobportal.dto.response.JobDetailResponse;
import com.jobportal.dto.response.JobSummaryResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.CompanyService;
import com.jobportal.service.JobApplicationService;
import com.jobportal.service.JobService;

import jakarta.validation.Valid;

/**
 * Recruiter REST controller — all recruiter-specific operations under /api/recruiter.
 *
 * <p>This controller is the single source of truth for every action a recruiter
 * can perform. All endpoints require authentication; role enforcement is handled
 * inside the service layer (RECRUITER account type and ownership checks).</p>
 *
 * <h3>Sections</h3>
 * <ul>
 *   <li>Company Management — create / update / delete the recruiter's company, upload assets.</li>
 *   <li>Job Management    — post / edit / remove jobs; list the recruiter's own jobs.</li>
 *   <li>Application Management — view applicants for a job, update application status.</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/recruiter")
@org.springframework.security.access.prepost.PreAuthorize("hasAuthority('EMPLOYER') or hasAuthority('ADMIN')")
public class RecruiterController {

    private final CompanyService         companyService;
    private final JobService             jobService;
    private final JobApplicationService  jobApplicationService;

    public RecruiterController(
            CompanyService companyService,
            JobService jobService,
            JobApplicationService jobApplicationService) {
        this.companyService        = companyService;
        this.jobService            = jobService;
        this.jobApplicationService = jobApplicationService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── Company Management ────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a company profile for the authenticated recruiter.
     * A recruiter must have a company before posting jobs.
     */
    @PostMapping("/company")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> createCompany(
            @Valid @RequestBody CompanyRequestDTO dto,
            Authentication authentication) throws JobPortalException {
        CompanyResponseDTO company = companyService.createCompany(dto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company created successfully", company));
    }

    /**
     * Get the authenticated recruiter's company profile.
     */
    @GetMapping("/company")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> getMyCompany(
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.getMyCompany(authentication.getName())));
    }

    /**
     * Update the authenticated recruiter's company profile.
     */
    @PutMapping("/company")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> updateCompany(
            @Valid @RequestBody CompanyRequestDTO dto,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Company updated successfully",
                companyService.updateCompany(dto, authentication.getName())));
    }

    /**
     * Delete the authenticated recruiter's company profile.
     * All jobs associated with the company will be removed as well.
     */
    @DeleteMapping("/company")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(
            Authentication authentication) throws JobPortalException {
        companyService.deleteCompany(authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Company deleted successfully"));
    }

    /**
     * Upload / replace the company logo.
     * Accepts any image (JPEG, PNG, WebP). Max size configured globally.
     */
    @PostMapping("/company/logo")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> uploadCompanyLogo(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        return ResponseEntity.ok(ApiResponse.success("Logo uploaded successfully",
                companyService.uploadLogo(file, authentication.getName())));
    }

    /**
     * Upload / replace the company cover image.
     */
    @PostMapping("/company/cover")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> uploadCompanyCover(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        return ResponseEntity.ok(ApiResponse.success("Cover image uploaded successfully",
                companyService.uploadCoverImage(file, authentication.getName())));
    }

    /**
     * List all active jobs posted under the recruiter's company.
     * Paginated, sorted by creation date descending.
     */
    @GetMapping("/company/jobs")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> getMyCompanyJobs(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.getMyCompanyJobs(authentication.getName(), pageable)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── Job Management ────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Post a new job listing.
     * The recruiter must have a company profile before posting.
     * Returns the full job detail so the client can display it immediately.
     */
    @PostMapping("/jobs")
    public ResponseEntity<ApiResponse<JobDetailResponse>> createJob(
            @Valid @RequestBody JobRequest dto,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job posted successfully",
                        jobService.createJob(dto, authentication.getName())));
    }

    /**
     * Update an existing job listing.
     * Only the recruiter who created the job may update it (ownership check in service).
     */
    @PutMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<JobDetailResponse>> updateJob(
            @PathVariable Long jobId,
            @Valid @RequestBody JobRequest dto,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Job updated successfully",
                jobService.updateJob(jobId, dto, authentication.getName())));
    }

    /**
     * Delete a job listing.
     * Notifies all applicants via event-driven notification (ApplicationEventPublisher).
     * Only the recruiter who owns the job may delete it.
     */
    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable Long jobId,
            Authentication authentication) throws JobPortalException {
        jobService.deleteJob(jobId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Job deleted successfully"));
    }

    /**
     * List all jobs posted by the authenticated recruiter.
     * Includes all statuses (OPEN, CLOSED, etc.).
     */
    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> getMyJobs(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                jobService.getMyJobs(authentication.getName(), pageable)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── Application Management ────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get all applications submitted for a specific job.
     * Only the recruiter who owns the job can access this.
     * Returns applicant details including resume info for review.
     */
    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<ApiResponse<Page<JobApplicationResponse>>> getJobApplications(
            @PathVariable Long jobId,
            Authentication authentication,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                jobApplicationService.getJobApplications(
                        jobId, authentication.getName(), pageable)));
    }

    /**
     * Get all applications submitted across all jobs belonging to the authenticated recruiter.
     */
    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<Page<JobApplicationResponse>>> getAllApplications(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                jobApplicationService.getAllRecruiterApplications(authentication.getName(), pageable)));
    }

    /**
     * Update the status of an application (e.g., UNDER_REVIEW → INTERVIEW → ACCEPTED).
     * Only the recruiter who owns the job may update application status.
     * Triggers a notification to the applicant via event listener.
     */
    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> updateApplicationStatus(
            @PathVariable Long applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Application status updated successfully",
                jobApplicationService.updateApplicationStatus(
                        applicationId, request, authentication.getName())));
    }

    /**
     * Get real-time aggregated dashboard KPIs for the authenticated recruiter.
     */
    @GetMapping({"/dashboard-stats", "/stats"})
    public ResponseEntity<ApiResponse<com.jobportal.dto.response.RecruiterDashboardStatsResponse>> getDashboardStats(
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                jobApplicationService.getRecruiterDashboardStats(authentication.getName())));
    }
}

