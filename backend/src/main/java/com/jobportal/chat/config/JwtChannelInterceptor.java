package com.jobportal.chat.config;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import com.jobportal.config.JwtProvider;

/**
 * STOMP channel interceptor that authenticates WebSocket connections.
 *
 * <h3>Cookie-First Architecture (Updated)</h3>
 * After migrating to HttpOnly cookie auth, the flow is:
 * <ol>
 *   <li>Browser sends SockJS HTTP upgrade request → cookie is automatically included.</li>
 *   <li>{@link CookieHandshakeInterceptor} reads the cookie, validates the JWT,
 *       and stores the user's email in the WebSocket session attributes
 *       under the key {@code "authenticatedEmail"}.</li>
 *   <li>This interceptor reads that attribute on STOMP CONNECT and sets
 *       the {@link StompPrincipal} — no STOMP {@code Authorization} header needed.</li>
 *   <li>All subsequent {@code @MessageMapping} calls have
 *       {@code principal.getName() = email}.</li>
 *   <li>Non-CONNECT frames from unauthenticated sessions are rejected.</li>
 * </ol>
 *
 * <h3>Backward Compatibility</h3>
 * If the session attribute is missing (e.g., API tool connecting without cookie),
 * the interceptor falls back to reading {@code Authorization: Bearer <token>} from
 * the STOMP CONNECT headers. This can be removed once fully migrated.
 */
@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtChannelInterceptor.class);
    private static final String SESSION_ATTR_EMAIL = "authenticatedEmail";

    private final JwtProvider jwtProvider;
    private final com.jobportal.chat.repository.ConversationParticipantRepository participantRepository;

    public JwtChannelInterceptor(
            JwtProvider jwtProvider,
            com.jobportal.chat.repository.ConversationParticipantRepository participantRepository) {
        this.jwtProvider = jwtProvider;
        this.participantRepository = participantRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        StompCommand command = accessor.getCommand();
        if (command == null) return message;

        switch (command) {
            case CONNECT -> {
                String email = null;

                // ── 1. Cookie path (primary): read from WS session attributes ──────────
                // Populated by CookieHandshakeInterceptor during the HTTP upgrade.
                Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                if (sessionAttributes != null) {
                    Object attr = sessionAttributes.get(SESSION_ATTR_EMAIL);
                    if (attr instanceof String s && !s.isBlank()) {
                        email = s;
                        log.debug("STOMP CONNECT: authenticated via cookie session attr [{}]", email);
                    }
                }

                // ── 2. STOMP header (fallback for API tools / backward compat) ─────────
                if (email == null) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            email = jwtProvider.getEmailFromToken(token);
                            log.debug("STOMP CONNECT: authenticated via Authorization header [{}]", email);
                        } catch (Exception e) {
                            log.warn("STOMP CONNECT rejected: invalid JWT in header - {}", e.getMessage());
                            throw new IllegalArgumentException("Invalid or expired JWT token.");
                        }
                    }
                }

                if (email == null) {
                    log.warn("STOMP CONNECT rejected: no valid authentication found (no cookie attr, no valid Bearer header)");
                    throw new IllegalArgumentException(
                        "WebSocket authentication required. Ensure you are logged in.");
                }

                accessor.setUser(new StompPrincipal(email));
                log.info("STOMP CONNECT authenticated: [{}]", email);
            }

            case SUBSCRIBE -> {
                if (accessor.getUser() == null) {
                    log.warn("STOMP SUBSCRIBE rejected: unauthenticated session");
                    throw new IllegalStateException(
                        "WebSocket session is not authenticated. Send CONNECT first.");
                }

                String destination = accessor.getDestination();
                if (destination != null && destination.startsWith("/topic/conversations/")) {
                    String sub = destination.substring("/topic/conversations/".length());
                    int slashIdx = sub.indexOf('/');
                    String idStr = slashIdx >= 0 ? sub.substring(0, slashIdx) : sub;
                    try {
                        Long convId = Long.parseLong(idStr);
                        String userEmail = accessor.getUser().getName();
                        if (userEmail == null || participantRepository.findByConversationIdAndUserEmail(convId, userEmail).isEmpty()) {
                            log.warn("STOMP SUBSCRIBE forbidden: user [{}] is not a participant in conversation [{}]", userEmail, convId);
                            throw new IllegalArgumentException("Access denied: You are not a participant in conversation " + convId);
                        }
                    } catch (NumberFormatException e) {
                        log.warn("STOMP SUBSCRIBE invalid conversation destination: {}", destination);
                    }
                }
            }

            case SEND, UNSUBSCRIBE -> {
                // Reject non-CONNECT frames from unauthenticated sessions
                if (accessor.getUser() == null) {
                    log.warn("STOMP {} rejected: unauthenticated session", command);
                    throw new IllegalStateException(
                        "WebSocket session is not authenticated. Send CONNECT first.");
                }
            }

            default -> {
                // DISCONNECT, RECEIPT, ERROR — pass through
            }
        }

        return message;
    }
}
