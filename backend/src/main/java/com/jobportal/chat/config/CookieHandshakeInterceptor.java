package com.jobportal.chat.config;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.jobportal.config.CookieProperties;
import com.jobportal.config.JwtProvider;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.server.ServletServerHttpRequest;

/**
 * WebSocket handshake interceptor that extracts the JWT from the
 * HttpOnly cookie during the SockJS HTTP upgrade request.
 *
 * Why this exists:
 *   After migrating from Authorization: Bearer (localStorage) to HttpOnly cookies,
 *   the browser automatically includes the cookie on the HTTP upgrade request
 *   (SockJS /info and /websocket endpoints). This interceptor reads the cookie,
 *   validates the JWT, and stores the authenticated user's email in the WebSocket
 *   session attributes. JwtChannelInterceptor then reads it from session attributes
 *   on the STOMP CONNECT frame — no JavaScript token access needed.
 *
 * Session attribute key: "authenticatedEmail"
 */
@Component
public class CookieHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(CookieHandshakeInterceptor.class);
    private static final String SESSION_ATTR_EMAIL = "authenticatedEmail";

    private final JwtProvider jwtProvider;
    private final CookieProperties cookieProperties;

    public CookieHandshakeInterceptor(JwtProvider jwtProvider, CookieProperties cookieProperties) {
        this.jwtProvider = jwtProvider;
        this.cookieProperties = cookieProperties;
    }

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) {

        // Only works with servlet-backed requests (always true for Spring Boot)
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            log.warn("[WS Handshake] Non-servlet request — skipping cookie auth");
            return true; // Allow connection; STOMP interceptor will reject if unauthenticated
        }

        HttpServletRequest httpRequest = servletRequest.getServletRequest();
        Cookie[] cookies = httpRequest.getCookies();

        // 1. Try HttpOnly Cookie
        if (cookies != null) {
            String cookieName = cookieProperties.getCookieName();
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    String jwt = cookie.getValue();
                    try {
                        String email = jwtProvider.getEmailFromToken(jwt);
                        if (email != null) {
                            attributes.put(SESSION_ATTR_EMAIL, email);
                            log.debug("[WS Handshake] JWT validated via cookie for: {}", email);
                            return true;
                        }
                    } catch (Exception e) {
                        log.warn("[WS Handshake] Invalid JWT in cookie: {}", e.getMessage());
                    }
                }
            }
        }

        // 2. Fallback: query parameter ?token=... or ?access_token=... (for cross-domain SPAs)
        String tokenParam = httpRequest.getParameter("token");
        if (tokenParam == null || tokenParam.isBlank()) {
            tokenParam = httpRequest.getParameter("access_token");
        }
        if (tokenParam != null && !tokenParam.isBlank()) {
            try {
                String email = jwtProvider.getEmailFromToken(tokenParam);
                if (email != null) {
                    attributes.put(SESSION_ATTR_EMAIL, email);
                    log.debug("[WS Handshake] JWT validated via query param for: {}", email);
                    return true;
                }
            } catch (Exception e) {
                log.warn("[WS Handshake] Invalid JWT in query param: {}", e.getMessage());
            }
        }

        log.debug("[WS Handshake] No cookie or query token found on upgrade request");
        return true; // Always allow handshake; STOMP interceptor will enforce auth on CONNECT
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // Nothing to do post-handshake
    }
}
