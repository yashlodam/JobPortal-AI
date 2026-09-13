package com.jobportal.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.config.CookieProperties;
import com.jobportal.config.JwtProvider;
import com.jobportal.dto.request.LoginRequest;
import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.dto.request.ResetPasswordRequest;
import com.jobportal.dto.request.VerifyOtpRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.AuthResponse;
import com.jobportal.dto.response.UserResponse;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.UserService;

import jakarta.validation.Valid;

/**
 * Authentication controller — handles registration, login, logout, OTP, and password reset.
 *
 * <h3>Cookie-based JWT Authentication</h3>
 * After a successful login, the JWT is stored in an HttpOnly, Secure, SameSite cookie
 * instead of being returned in the response body. This prevents JavaScript (and therefore XSS
 * attackers) from ever reading the token. The browser automatically includes the cookie on
 * every subsequent request to the API.
 *
 * <h3>Endpoints</h3>
 * <ul>
 *   <li>POST /api/auth/register — public</li>
 *   <li>POST /api/auth/login    — sets access_token cookie on success, 401 on failure</li>
 *   <li>POST /api/auth/logout   — clears access_token cookie</li>
 *   <li>GET  /api/auth/me       — returns current user profile (cookie required)</li>
 *   <li>POST /api/auth/send-otp/{email}</li>
 *   <li>POST /api/auth/verify-otp</li>
 *   <li>POST /api/auth/reset-password</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/auth")
@org.springframework.validation.annotation.Validated
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;
    private final CookieProperties cookieProperties;

    public AuthController(
            UserService userService,
            UserRepository userRepository,
            JwtProvider jwtProvider,
            AuthenticationManager authenticationManager,
            CookieProperties cookieProperties) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
        this.authenticationManager = authenticationManager;
        this.cookieProperties = cookieProperties;
    }

    // ── Register ─────────────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest request) throws JobPortalException {
        UserResponse userResponse = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", userResponse));
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    /**
     * Authenticates the user and sets the JWT as an HttpOnly cookie.
     *
     * The response body contains safe user data (id, name, email, accountType) so the
     * frontend can populate Redux state immediately without a separate /users/me call.
     * The JWT itself is never sent to JavaScript.
     *
     * <p>Error handling:
     * <ul>
     *   <li>Wrong credentials → 401 with "Invalid email or password."</li>
     *   <li>Account disabled  → 401 with specific message</li>
     *   <li>Other auth error  → 401 with generic message</li>
     * </ul>
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        // 1. Authenticate credentials — catch Spring Security exceptions explicitly
        //    so login failures return 401, not the generic 500 handler.
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()));
        } catch (DisabledException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Your account is disabled. Please contact support."));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password."));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication failed. Please try again."));
        }

        // 2. Generate JWT
        String jwt = jwtProvider.generateToken(authentication);

        // 3. Build HttpOnly cookie
        ResponseCookie cookie = buildAccessCookie(jwt);

        // 4. Load user data for the response body
        //    (findByEmail is safe here — authentication already succeeded)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException(
                        "User not found after successful authentication: " + request.getEmail()));

        AuthResponse authResponse = new AuthResponse(
                "Login successful",
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAccountType() != null ? user.getAccountType().name() : null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success("Login successful", authResponse));
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    /**
     * Clears the authentication cookie by setting Max-Age=0.
     * The JWT itself is not validated on logout — if the cookie is already gone,
     * this is a no-op (still returns 200 for idempotency).
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        ResponseCookie clearCookie = ResponseCookie.from(cookieProperties.getCookieName(), "")
                .httpOnly(true)
                .secure(cookieProperties.isCookieSecure())
                .sameSite(cookieProperties.getCookieSameSite())
                .path(cookieProperties.getCookiePath())
                .maxAge(0) // immediately expire
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(ApiResponse.message("Logged out successfully"));
    }

    // ── Current User (Auth Restore on App Startup) ────────────────────────────

    /**
     * Returns the current user's profile using the cookie for authentication.
     * Called by the frontend on startup to restore auth state from the cookie
     * (replaces the old pattern of reading JWT from localStorage + calling /users/me).
     *
     * <p>Note: Spring Security's JwtTokenValidator extracts the email from the cookie
     * and populates the Authentication object before this method is called.
     * If the cookie is missing or expired, Spring Security returns 401 before
     * this method is ever invoked.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication)
            throws JobPortalException {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<UserResponse>error("Not authenticated"));
        }
        UserResponse user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    // ── OTP Endpoints ─────────────────────────────────────────────────────────

    @PostMapping({"/send-otp/{email:.+}", "/send-otp/{email}"})
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            @PathVariable @jakarta.validation.constraints.Email(message = "Invalid email format") @jakarta.validation.constraints.NotBlank(message = "Email is required") String email) throws Exception {
        String cleanEmail = email != null ? email.trim() : "";
        userService.sendOtp(cleanEmail);
        return ResponseEntity.ok(ApiResponse.message("Verification code sent successfully to " + cleanEmail));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) throws JobPortalException {
        userService.verifyOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.message("OTP verified successfully"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) throws JobPortalException {
        userService.resetPassword(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.message("Password reset successfully"));
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Builds the ResponseCookie for the JWT with all security attributes.
     *
     * <ul>
     *   <li>HttpOnly  — JavaScript cannot read this cookie (XSS protection)</li>
     *   <li>Secure    — Only sent over HTTPS in production (false for dev)</li>
     *   <li>SameSite  — Lax: sent on same-site and top-level navigation (CSRF protection)</li>
     *   <li>Path      — / means cookie is sent on all API requests</li>
     *   <li>MaxAge    — Matches JWT expiration (8 hours = 28800 seconds)</li>
     * </ul>
     */
    private ResponseCookie buildAccessCookie(String jwt) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie
                .from(cookieProperties.getCookieName(), jwt)
                .httpOnly(true)
                .secure(cookieProperties.isCookieSecure())
                .sameSite(cookieProperties.getCookieSameSite())
                .path(cookieProperties.getCookiePath())
                .maxAge(cookieProperties.getCookieMaxAge());

        if (cookieProperties.getCookieDomain() != null
                && !cookieProperties.getCookieDomain().isBlank()) {
            builder.domain(cookieProperties.getCookieDomain());
        }

        return builder.build();
    }
}
