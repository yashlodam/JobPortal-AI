package com.jobportal.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.request.UpdateUserStatusRequest;
import com.jobportal.dto.response.AdminUserResponse;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.AdminDashboardService;

/**
 * Admin User Management REST Controller.
 * Supports /api/admin/users and /admin/users.
 */
@RestController
@RequestMapping({"/api/admin/users", "/admin/users"})
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminUserController {

    private final AdminDashboardService adminDashboardService;

    public AdminUserController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    /**
     * List all users with optional role and keyword search.
     * GET /api/admin/users?role=EMPLOYER&search=john&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        Page<AdminUserResponse> page = adminDashboardService.listUsers(role, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully.", page));
    }

    /**
     * Get specific user details by ID.
     * GET /api/admin/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(
            @PathVariable Long id) throws JobPortalException {

        AdminUserResponse user = adminDashboardService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully.", user));
    }

    /**
     * Toggle or update user account status (e.g. ACTIVE, SUSPENDED, INACTIVE).
     * PATCH /api/admin/users/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateUserStatusRequest request) throws JobPortalException {

        AdminUserResponse user = adminDashboardService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully.", user));
    }

    /**
     * Fallback PUT endpoint for updating user account status.
     * PUT /api/admin/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateUserStatusRequest request) throws JobPortalException {

        AdminUserResponse user = adminDashboardService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully.", user));
    }

    /**
     * Delete or deactivate a user account.
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id) throws JobPortalException {

        adminDashboardService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User account deactivated successfully.", null));
    }
}
