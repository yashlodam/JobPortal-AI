package com.jobportal.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jobportal.dto.request.UpdateUserStatusRequest;
import com.jobportal.dto.response.AdminPlatformStatsResponse;
import com.jobportal.dto.response.AdminUserResponse;
import com.jobportal.exception.JobPortalException;

/**
 * Service for platform-wide administration:
 * User management, account status modifications, and system analytics.
 */
public interface AdminDashboardService {

    /**
     * List users with optional role and search filters.
     */
    Page<AdminUserResponse> listUsers(String role, String search, Pageable pageable);

    /**
     * Retrieve single user details by ID.
     */
    AdminUserResponse getUserById(Long userId) throws JobPortalException;

    /**
     * Update/toggle account status (ACTIVE / SUSPENDED / INACTIVE).
     */
    AdminUserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) throws JobPortalException;

    /**
     * Delete or soft-deactivate user account.
     */
    void deleteUser(Long userId) throws JobPortalException;

    /**
     * Compute system-wide aggregate statistics.
     */
    AdminPlatformStatsResponse getPlatformStats();
}
