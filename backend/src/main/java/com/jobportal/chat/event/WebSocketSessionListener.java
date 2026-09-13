package com.jobportal.chat.event;

import java.security.Principal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.jobportal.chat.dto.response.ConversationParticipantResponse;
import com.jobportal.chat.dto.response.SenderResponse;
import com.jobportal.chat.repository.ConversationParticipantRepository;
import com.jobportal.chat.repository.ConversationRepository;
import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;

/**
 * Listens to WebSocket session lifecycle events to manage user presence.
 *
 * On CONNECT:
 *   - Mark the user online in all their ConversationParticipant rows.
 *   - Broadcast presence update to all conversations the user participates in.
 *
 * On DISCONNECT:
 *   - Mark the user offline.
 *   - Update lastSeenAt timestamp.
 *   - Broadcast offline presence to all affected conversations.
 *
 * Presence update is broadcast to /topic/conversations/{id} so the other
 * participant's UI can show online/offline indicator in real time.
 */
@Component
public class WebSocketSessionListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketSessionListener.class);

    private final UserRepository userRepository;
    private final ConversationParticipantRepository participantRepository;
    private final ConversationRepository conversationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketSessionListener(
            UserRepository userRepository,
            ConversationParticipantRepository participantRepository,
            ConversationRepository conversationRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.userRepository         = userRepository;
        this.participantRepository  = participantRepository;
        this.conversationRepository = conversationRepository;
        this.messagingTemplate      = messagingTemplate;
    }

    // ── Connect ──────────────────────────────────────────────────────────

    @EventListener
    @Transactional
    public void handleSessionConnected(SessionConnectedEvent event) {
        String email = extractEmail(event.getUser());
        if (email == null) return;

        userRepository.findByEmail(email).ifPresent(user -> {
            long userId = user.getId();
            participantRepository.updateOnlineStatus(userId, true);
            log.info("WebSocket CONNECTED: [{}] is now ONLINE", email);
            broadcastPresence(userId, user, true);
        });
    }

    // ── Disconnect ───────────────────────────────────────────────────────

    @EventListener
    @Transactional
    public void handleSessionDisconnected(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String email = extractEmail(accessor.getUser());
        if (email == null) return;

        userRepository.findByEmail(email).ifPresent(user -> {
            long userId = user.getId();
            participantRepository.updateOnlineStatus(userId, false);
            participantRepository.updateLastSeenAt(userId);
            log.info("WebSocket DISCONNECTED: [{}] is now OFFLINE", email);
            broadcastPresence(userId, user, false);
        });
    }

    // ── Presence broadcast ───────────────────────────────────────────────

    /**
     * Broadcast presence update to all conversations the user participates in.
     * Each conversation subscriber will receive the updated participant presence.
     */
    private void broadcastPresence(long userId, User user, boolean online) {
        participantRepository.findAllByUserId(userId).forEach(cp -> {
            Long convId = cp.getConversation().getId();
            ConversationParticipantResponse presence = buildPresencePayload(user, online);
            messagingTemplate.convertAndSend(
                "/topic/conversations/" + convId + "/presence",
                presence
            );
        });
    }

    private ConversationParticipantResponse buildPresencePayload(User user, boolean online) {
        SenderResponse sender = new SenderResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getProfile() != null ? user.getProfile().getProfileImage() : null,
            user.getAccountType() != null ? user.getAccountType().name() : null
        );
        ConversationParticipantResponse presence = new ConversationParticipantResponse();
        presence.setUser(sender);
        presence.setOnline(online);
        return presence;
    }

    private String extractEmail(Principal principal) {
        if (principal == null) return null;
        String name = principal.getName();
        if (name == null || name.isBlank()) return null;
        return name;
    }
}
