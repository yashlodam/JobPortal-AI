package com.jobportal.response;

import com.jobportal.domain.AccountType;

/**
 * Authentication response returned after successful login.
 * Contains JWT token and essential user metadata to avoid a second /me call.
 */
public class AuthResponse {

    private String token;
    private String message;
    private Long userId;
    private String name;
    private String email;
    private AccountType accountType;
    private Long profileId;
    private Long recruiterId;

    public AuthResponse() {
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }

    public Long getProfileId() { return profileId; }
    public void setProfileId(Long profileId) { this.profileId = profileId; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }
}