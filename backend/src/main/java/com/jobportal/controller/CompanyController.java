package com.jobportal.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.CompanyResponseDTO;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.JobSummaryResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.CompanyService;

/**
 * Public Company controller — read-only endpoints for browsing companies.
 *
 * <p>All write operations (create, update, delete, logo/cover upload) and
 * recruiter-scoped reads (get my company, my company's jobs) have been moved
 * to {@link RecruiterController} at {@code /api/recruiter/company}.</p>
 *
 * <p>All endpoints in this controller are publicly accessible — no authentication required.</p>
 */
@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    // ── Public Read Endpoints ─────────────────────────────────────────────────

    /**
     * List all companies (paginated).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<CompanyResponseDTO>>> getAllCompanies(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getAllCompanies(pageable)));
    }

    /**
     * Get a single company by ID including public profile.
     */
    @GetMapping("/{companyId}")
    public ResponseEntity<ApiResponse<CompanyResponseDTO>> getCompanyById(
            @PathVariable Long companyId) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanyById(companyId)));
    }

    /**
     * List all active jobs posted by a specific company (paginated).
     */
    @GetMapping("/{companyId}/jobs")
    public ResponseEntity<ApiResponse<Page<JobSummaryResponse>>> getCompanyJobs(
            @PathVariable Long companyId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable)
            throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.getCompanyJobs(companyId, pageable)));
    }

    /**
     * Full-text search across company names and descriptions.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CompanyResponseDTO>>> searchCompanies(
            @RequestParam String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                companyService.searchCompanies(keyword, pageable)));
    }
}
