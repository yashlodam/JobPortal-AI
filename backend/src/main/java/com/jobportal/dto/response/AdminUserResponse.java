package com.jobportal.dto.response;

import java.time.LocalDateTime;

import com.jobportal.domain.AccountType;
import com.jobportal.domain.RecruiterStatus;

/**
 * Detailed user response for admin user management views.
 */
public class AdminUserResponse {

    private Long id;
    private String name;
    private String email;
    private AccountType accountType;
    private String role;
    private Boolean isActive;
    private String status;
    private RecruiterStatus recruiterStatus;
    private String companyName;
    private String designation;
    private Long profileId;
    private Long recruiterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AdminUserResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
        this.role = (accountType != null) ? accountType.name() : null;
    }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public RecruiterStatus getRecruiterStatus() { return recruiterStatus; }
    public void setRecruiterStatus(RecruiterStatus recruiterStatus) { this.recruiterStatus = recruiterStatus; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public Long getProfileId() { return profileId; }
    public void setProfileId(Long profileId) { this.profileId = profileId; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
