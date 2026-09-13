package com.jobportal.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
import com.jobportal.dto.response.UserResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.AdminDashboardService;
import com.jobportal.service.UserService;

/**
 * User controller: supports current user info as well as fallback /api/users endpoints.
 */
@RestController
@RequestMapping({"/api/users", "/users"})
public class UserController {

    private final UserService userService;
    private final AdminDashboardService adminDashboardService;

    public UserController(UserService userService, AdminDashboardService adminDashboardService) {
        this.userService = userService;
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            Authentication authentication) throws JobPortalException {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<AdminUserResponse> page = adminDashboardService.listUsers(role, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(
            @PathVariable Long id) throws JobPortalException {
        AdminUserResponse user = adminDashboardService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateUserStatusRequest request) throws JobPortalException {
        AdminUserResponse user = adminDashboardService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateUserStatusRequest request) throws JobPortalException {
        AdminUserResponse user = adminDashboardService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id) throws JobPortalException {
        adminDashboardService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", null));
    }
}
