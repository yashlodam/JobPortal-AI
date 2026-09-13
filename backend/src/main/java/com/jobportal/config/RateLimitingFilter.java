package com.jobportal.config;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.exception.ErrorResponse;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * In-memory sliding-window rate limiter filter.
 * Protects critical endpoints against brute-force attacks and AI quota exhaustion:
 * <ul>
 *   <li>/api/auth/login &amp; /api/auth/send-otp/** : 15 requests / minute per client IP</li>
 *   <li>/api/ai/copilot/** : 20 requests / minute per client IP</li>
 * </ul>
 */
@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    private static final int AUTH_LIMIT_PER_MINUTE = 15;
    private static final int AI_LIMIT_PER_MINUTE = 20;
    private static final long WINDOW_SECONDS = 60;

    private final ConcurrentHashMap<String, WindowCounter> requestCounts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(ObjectMapper objectMapper) {
        if (objectMapper != null) {
            this.objectMapper = objectMapper.findAndRegisterModules();
        } else {
            this.objectMapper = new ObjectMapper().findAndRegisterModules();
        }
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        int maxAllowed = resolveLimit(path, method);

        if (maxAllowed > 0) {
            String clientIp = extractClientIp(request);
            String bucketKey = clientIp + ":" + extractRouteKey(path);

            long currentEpochMinute = Instant.now().getEpochSecond() / WINDOW_SECONDS;

            WindowCounter counter = requestCounts.compute(bucketKey, (k, existing) -> {
                if (existing == null || existing.epochMinute != currentEpochMinute) {
                    return new WindowCounter(currentEpochMinute, 1);
                }
                existing.counter.incrementAndGet();
                return existing;
            });

            if (counter.counter.get() > maxAllowed) {
                log.warn("Rate limit exceeded for IP [{}] on path [{}] ({}/{})",
                        clientIp, path, counter.counter.get(), maxAllowed);

                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setHeader("Retry-After", String.valueOf(WINDOW_SECONDS));

                ErrorResponse error = new ErrorResponse(
                        "Too many requests. Please wait a moment before trying again.",
                        HttpStatus.TOO_MANY_REQUESTS.value(),
                        HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
                        "RATE_LIMIT_EXCEEDED",
                        LocalDateTime.now()
                );

                try {
                    response.getWriter().write(objectMapper.writeValueAsString(error));
                } catch (Exception ex) {
                    // Fallback JSON in case of serializer issue
                    response.getWriter().write("{\"message\":\"Too many requests. Please wait a moment before trying again.\",\"status\":429,\"error\":\"Too Many Requests\",\"errorCode\":\"RATE_LIMIT_EXCEEDED\"}");
                }
                return;
            }

            if (requestCounts.size() > 200) {
                cleanupStaleEntries(currentEpochMinute);
            }
        }

        filterChain.doFilter(request, response);
    }

    private int resolveLimit(String path, String method) {
        if ("OPTIONS".equalsIgnoreCase(method)) return 0;

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/send-otp/")) {
            return AUTH_LIMIT_PER_MINUTE;
        }
        if (path.startsWith("/api/ai/copilot/")) {
            return AI_LIMIT_PER_MINUTE;
        }
        return 0;
    }

    private String extractRouteKey(String path) {
        if (path.startsWith("/api/auth/login")) return "auth_login";
        if (path.startsWith("/api/auth/send-otp/")) return "auth_otp";
        if (path.startsWith("/api/ai/copilot/")) return "ai_copilot";
        return "general";
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private void cleanupStaleEntries(long currentEpochMinute) {
        requestCounts.entrySet().removeIf(entry ->
                entry.getValue().epochMinute < currentEpochMinute);
    }

    private static class WindowCounter {
        final long epochMinute;
        final AtomicInteger counter;

        WindowCounter(long epochMinute, int initialVal) {
            this.epochMinute = epochMinute;
            this.counter = new AtomicInteger(initialVal);
        }
    }
}