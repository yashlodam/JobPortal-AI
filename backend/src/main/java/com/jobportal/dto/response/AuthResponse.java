package com.jobportal.dto.response;

/**
 * Authentication response returned after a successful login.
 * Supports both modern HttpOnly cookies and Bearer token fallback for cross-domain SPAs.
 */
public class AuthResponse {

    private String message;
    private String token;
    private Long id;
    private String name;
    private String email;
    private String accountType;

    public AuthResponse() {}

    public AuthResponse(String message, Long id, String name, String email, String accountType) {
        this.message = message;
        this.id = id;
        this.name = name;
        this.email = email;
        this.accountType = accountType;
    }

    public AuthResponse(String message, String token, Long id, String name, String email, String accountType) {
        this.message = message;
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.accountType = accountType;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
}
