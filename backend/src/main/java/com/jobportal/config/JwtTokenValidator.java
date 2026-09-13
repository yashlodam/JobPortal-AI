package com.jobportal.config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT validation filter that runs once per HTTP request.
 *
 * <h3>Token extraction priority (cookie-first architecture)</h3>
 * <ol>
 *   <li><strong>HttpOnly Cookie</strong> ({@code access_token}) — primary method.
 *       The browser sends this automatically; JavaScript cannot read or steal it.</li>
 *   <li><strong>Authorization: Bearer header</strong> — fallback for API tools (Postman, curl),
 *       server-to-server calls, or during local development testing.
 *       This fallback can be removed once the migration is fully verified in production.</li>
 * </ol>
 *
 * <p>If a valid JWT is found by either method, the authenticated user is placed in the
 * Spring Security context for the duration of the request. If not, the request continues
 * unauthenticated and Spring Security will reject protected endpoints automatically.
 */
public class JwtTokenValidator extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenValidator.class);

    private final JwtProvider jwtProvider;
    private final UserDetailsService userDetailsService;
    private final CookieProperties cookieProperties;

    public JwtTokenValidator(
            JwtProvider jwtProvider,
            UserDetailsService userDetailsService,
            CookieProperties cookieProperties) {
        this.jwtProvider = jwtProvider;
        this.userDetailsService = userDetailsService;
        this.cookieProperties = cookieProperties;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String jwt = extractJwt(request);

        if (jwt != null) {
            try {
                String email = jwtProvider.getEmailFromToken(jwt);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (JwtException | IllegalArgumentException | UsernameNotFoundException ex) {
                // Invalid token or user no longer exists — let the request continue without authentication.
                // Spring Security will reject protected endpoints automatically with 401.
                log.warn("JWT authentication skipped: {}", ex.getMessage());
            } catch (Exception ex) {
                log.error("Unexpected error during JWT validation: {}", ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT from the request using cookie-first strategy.
     *
     * 1. Check for the HttpOnly cookie (primary — used by the browser after login).
     * 2. Fall back to Authorization: Bearer header (for API tools / server-to-server).
     *
     * @return the raw JWT string (without "Bearer " prefix), or null if not found.
     */
    private String extractJwt(HttpServletRequest request) {
        // ── 1. Cookie (primary) ────────────────────────────────────────────────
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            String cookieName = cookieProperties.getCookieName();
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    String value = cookie.getValue();
                    if (value != null && !value.isBlank()) {
                        return value;
                    }
                }
            }
        }

        // ── 2. Authorization: Bearer header (fallback) ─────────────────────────
        String authHeader = request.getHeader(JwtConstants.HEADER_STRING);
        if (authHeader != null && authHeader.startsWith(JwtConstants.TOKEN_PREFIX)) {
            return authHeader.substring(JwtConstants.TOKEN_PREFIX.length());
        }

        return null;
    }
}