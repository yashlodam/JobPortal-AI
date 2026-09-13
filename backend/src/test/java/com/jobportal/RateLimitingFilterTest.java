package com.jobportal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jobportal.config.RateLimitingFilter;

class RateLimitingFilterTest {

    private RateLimitingFilter filter;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        filter = new RateLimitingFilter(objectMapper);
    }

    @Test
    @DisplayName("Requests within limit pass through the filter chain")
    void testRequestsWithinLimitPass() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
        req.setRemoteAddr("192.168.1.100");
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        assertEquals(HttpStatus.OK.value(), res.getStatus());
    }

    @Test
    @DisplayName("Requests exceeding auth rate limit return 429 TOO MANY REQUESTS")
    void testRequestsExceedingLimitReturn429() throws Exception {
        String ip = "192.168.1.200";

        // Auth limit is 15 per minute
        for (int i = 0; i < 15; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
            req.setRemoteAddr(ip);
            MockHttpServletResponse res = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();
            filter.doFilter(req, res, chain);
            assertEquals(HttpStatus.OK.value(), res.getStatus());
        }

        // 16th request should return 429
        MockHttpServletRequest req16 = new MockHttpServletRequest("POST", "/api/auth/login");
        req16.setRemoteAddr(ip);
        MockHttpServletResponse res16 = new MockHttpServletResponse();
        MockFilterChain chain16 = new MockFilterChain();

        filter.doFilter(req16, res16, chain16);

        assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), res16.getStatus());
        assertEquals("60", res16.getHeader("Retry-After"));
    }
}