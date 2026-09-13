package com.jobportal.chat.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * STOMP WebSocket configuration.
 *
 * <h3>Architecture</h3>
 * Client connects to: ws://host/ws  (or wss:// in production)
 * SockJS fallback:    http://host/ws (long-polling, EventSource, iframe)
 *
 * <h3>Security (Cookie-based)</h3>
 * HTTP layer:   /ws/** is permitted in SecurityConfig (WebSocket upgrade passes through).
 * Cookie:       Browser automatically sends the HttpOnly cookie on SockJS HTTP requests.
 * Handshake:    CookieHandshakeInterceptor reads the cookie, validates JWT, and stores
 *               the authenticated email in WebSocket session attributes.
 * STOMP layer:  JwtChannelInterceptor reads the email from session attributes on CONNECT.
 * Message layer: Sender identity always resolved from StompPrincipal (never from payload).
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;
    private final CookieHandshakeInterceptor cookieHandshakeInterceptor;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:5174,https://*.vercel.app,https://job-portal-frontend-rho-nine.vercel.app}")
    private String allowedOrigins;

    public WebSocketConfig(
            JwtChannelInterceptor jwtChannelInterceptor,
            CookieHandshakeInterceptor cookieHandshakeInterceptor) {
        this.jwtChannelInterceptor = jwtChannelInterceptor;
        this.cookieHandshakeInterceptor = cookieHandshakeInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        // Native WebSocket endpoint (used by modern STOMP client with wss://)
        registry.addEndpoint("/ws", "/api/ws")
            .setAllowedOriginPatterns(origins)
            .addInterceptors(cookieHandshakeInterceptor);

        // SockJS fallback endpoint (available for legacy fallback)
        registry.addEndpoint("/ws-sockjs", "/api/ws-sockjs")
            .setAllowedOriginPatterns(origins)
            .addInterceptors(cookieHandshakeInterceptor)
            .withSockJS();
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration
            .setMessageSizeLimit(64 * 1024)       // 64 KB max message payload
            .setSendBufferSizeLimit(256 * 1024)   // 256 KB send buffer per session
            .setSendTimeLimit(15 * 1000)          // 15 seconds send timeout
            .setTimeToFirstMessage(30 * 1000);    // 30 seconds connection idle grace
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor);
    }
}
