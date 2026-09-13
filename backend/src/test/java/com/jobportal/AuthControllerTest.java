package com.jobportal;

import com.jobportal.controller.AuthController;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.jobportal.config.CookieProperties;
import com.jobportal.config.JwtProvider;
import com.jobportal.domain.AccountType;
import com.jobportal.dto.request.LoginRequest;
import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.AuthResponse;
import com.jobportal.dto.response.UserResponse;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.UserService;

class AuthControllerTest {

    private UserService userService;
    private UserRepository userRepository;
    private JwtProvider jwtProvider;
    private AuthenticationManager authenticationManager;
    private CookieProperties cookieProperties;
    private AuthController authController;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        userRepository = mock(UserRepository.class);
        jwtProvider = mock(JwtProvider.class);
        authenticationManager = mock(AuthenticationManager.class);
        cookieProperties = new CookieProperties();
        cookieProperties.setCookieName("access_token");
        cookieProperties.setCookieMaxAge(28800);
        cookieProperties.setCookieSecure(false);
        cookieProperties.setCookieSameSite("Lax");
        cookieProperties.setCookiePath("/");

        authController = new AuthController(
                userService,
                userRepository,
                jwtProvider,
                authenticationManager,
                cookieProperties
        );
    }

    @Test
    @DisplayName("Register returns 201 CREATED with user data")
    void testRegisterSuccess() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@example.com");
        req.setPassword("Password123!");
        req.setAccountType(AccountType.APPLICANT);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(1L);
        userResponse.setName("Test User");
        userResponse.setEmail("test@example.com");

        when(userService.registerUser(any(RegisterRequest.class))).thenReturn(userResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = authController.register(req);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("test@example.com", response.getBody().getData().getEmail());
    }

    @Test
    @DisplayName("Login sets HttpOnly cookie and returns 200 OK")
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("Password123!");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtProvider.generateToken(auth)).thenReturn("mocked-jwt-token");

        User user = new User();
        user.setId(10L);
        user.setName("Test Candidate");
        user.setEmail("test@example.com");
        user.setAccountType(AccountType.APPLICANT);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.login(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(10L, response.getBody().getData().getId());

        String setCookieHeader = response.getHeaders().getFirst("Set-Cookie");
        assertNotNull(setCookieHeader);
        assertTrue(setCookieHeader.contains("access_token=mocked-jwt-token"));
        assertTrue(setCookieHeader.contains("HttpOnly"));
    }

    @Test
    @DisplayName("Login with invalid credentials returns 401 UNAUTHORIZED")
    void testLoginBadCredentials() {
        LoginRequest req = new LoginRequest();
        req.setEmail("wrong@example.com");
        req.setPassword("wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.login(req);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Invalid email or password.", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Logout clears the access_token cookie with Max-Age=0")
    void testLogoutClearsCookie() {
        ResponseEntity<ApiResponse<Void>> response = authController.logout();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        String setCookieHeader = response.getHeaders().getFirst("Set-Cookie");
        assertNotNull(setCookieHeader);
        assertTrue(setCookieHeader.contains("access_token="));
        assertTrue(setCookieHeader.contains("Max-Age=0"));
    }
}