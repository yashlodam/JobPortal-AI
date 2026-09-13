package com.jobportal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.response.AdminPlatformStatsResponse;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.service.AdminDashboardService;

/**
 * REST Controller for platform overview aggregate analytics.
 * Supports /api/admin/stats and /admin/stats.
 */
@RestController
@RequestMapping({"/api/admin/stats", "/admin/stats"})
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminStatsController {

    private final AdminDashboardService adminDashboardService;

    public AdminStatsController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    /**
     * Retrieve system aggregate statistics.
     * GET /api/admin/stats
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminPlatformStatsResponse>> getPlatformStats() {
        AdminPlatformStatsResponse stats = adminDashboardService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.success("Platform statistics retrieved successfully.", stats));
    }
}
