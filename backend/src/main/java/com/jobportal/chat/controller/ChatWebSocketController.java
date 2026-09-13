package com.jobportal.chat.controller;

import java.security.Principal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.chat.dto.request.SendMessageRequest;
import com.jobportal.chat.dto.request.TypingIndicatorRequest;
import com.jobportal.chat.dto.response.MessageResponse;
import com.jobportal.chat.dto.response.ReadReceiptResponse;
import com.jobportal.chat.dto.response.TypingResponse;
import com.jobportal.chat.dto.response.WebSocketErrorResponse;
import com.jobportal.chat.entity.Conversation;
import com.jobportal.chat.entity.ConversationParticipant;
import com.jobportal.chat.entity.Message;
import com.jobportal.chat.mapper.ChatMapper;
import com.jobportal.chat.repository.ConversationParticipantRepository;
import com.jobportal.chat.service.ChatService;
import com.jobportal.domain.NotificationPriority;
import com.jobportal.domain.NotificationType;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.NotificationService;

/**
 * STOMP WebSocket controller that handles real-time chat message events.
 *
 * Endpoints:
 *   /app/chat.send    - send a message to a conversation
 *   /app/chat.typing  - broadcast a typing indicator to a conversation
 *   /app/chat.read    - mark a conversation as read and broadcast receipt
 *
 * Security model:
 *   - principal.getName() gives the sender email (set by JwtChannelInterceptor).
 *   - conversationId is taken from the payload, but access is always validated
 *     via ChatService.validateAndGetConversation() before any operation.
 *   - senderId is NEVER taken from the payload.
 *
 * Error handling:
 *   - @MessageExceptionHandler catches all exceptions and routes structured
 *     errors to /user/queue/errors on the sending client only.
 *   - No raw exception messages are exposed to the client.
 *
 * Notification integration:
 *   - On every new message, a MESSAGE_RECEIVED in-app notification is sent
 *     to each OTHER participant who is currently offline.
 *   - Online participants receive the message via WebSocket directly.
 */
@Controller
public class ChatWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final ChatService chatService;
    private final ChatMapper chatMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final com.jobportal.config.JwtProvider jwtProvider;

    public ChatWebSocketController(
            ChatService chatService,
            ChatMapper chatMapper,
            SimpMessagingTemplate messagingTemplate,
            ConversationParticipantRepository participantRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            com.jobportal.config.JwtProvider jwtProvider) {
        this.chatService          = chatService;
        this.chatMapper           = chatMapper;
        this.messagingTemplate    = messagingTemplate;
        this.participantRepository = participantRepository;
        this.userRepository        = userRepository;
        this.notificationService   = notificationService;
        this.jwtProvider          = jwtProvider;
    }

    // ── Send Message ─────────────────────────────────────────────────────

    /**
     * Handle a send-message request from a WebSocket client.
     *
     * Flow:
     *   1. Validate sender is a participant of the conversation.
     *   2. Persist the message via ChatService.saveMessage().
     *   3. Build MessageResponse and broadcast to /topic/conversations/{id}.
     *   4. Send MESSAGE_RECEIVED notification to each offline participant.
     *
     * Client subscribes to: /topic/conversations/{conversationId}
     * to receive the broadcast message.
     */
    @MessageMapping("/chat.send")
    @Transactional
    public void sendMessage(
            @Payload SendMessageRequest request,
            Principal principal,
            SimpMessageHeaderAccessor headerAccessor) throws JobPortalException {

        String senderEmail = (principal != null) ? principal.getName() : null;

        // Fallback 1: Extract from session attributes populated by HandshakeInterceptor
        if (senderEmail == null && headerAccessor != null && headerAccessor.getSessionAttributes() != null) {
            Object attr = headerAccessor.getSessionAttributes().get("authenticatedEmail");
            if (attr instanceof String s && !s.isBlank()) {
                senderEmail = s;
            }
        }

        // Fallback 2: Extract from native Authorization header
        if (senderEmail == null && headerAccessor != null) {
            String authHeader = headerAccessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    senderEmail = jwtProvider.getEmailFromToken(authHeader.substring(7));
                } catch (Exception ignored) {
                    // invalid header token
                }
            }
        }

        if (senderEmail == null) {
            log.warn("sendMessage rejected: unauthenticated WebSocket session for convId={}",
                request != null ? request.getConversationId() : null);
            return;
        }

        Long convId = request.getConversationId();

        // Validate and save
        Message savedMessage = chatService.saveMessage(convId, request.getContent(), senderEmail);
        MessageResponse response = chatMapper.toMessageResponse(savedMessage);

        // Broadcast to all subscribers of this conversation
        messagingTemplate.convertAndSend(
            "/topic/conversations/" + convId,
            response
        );
        log.debug("Message id=[{}] broadcast to /topic/conversations/[{}]",
            savedMessage.getId(), convId);

        // Notify offline participants
        notifyOfflineParticipants(savedMessage, convId, senderEmail);
    }

    // ── Typing Indicator ─────────────────────────────────────────────────

    /**
     * Handle a typing indicator from a WebSocket client.
     * NOT persisted — purely real-time ephemeral state.
     *
     * Client subscribes to: /topic/conversations/{conversationId}
     * to receive typing events from other participants.
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(
            @Payload TypingIndicatorRequest request,
            Principal principal) throws JobPortalException {

        if (principal == null) return;
        String senderEmail = principal.getName();
        Long convId = request.getConversationId();

        // Security: verify user is a participant before broadcasting
        if (!chatService.validateAndGetConversation(convId, senderEmail).getId().equals(convId)) {
            log.warn("Typing indicator rejected: [{}] is not a participant of conv [{}]",
                senderEmail, convId);
            return;
        }

        userRepository.findByEmail(senderEmail).ifPresent(user -> {
            TypingResponse typingResponse = new TypingResponse(
                convId,
                user.getId(),
                user.getName(),
                request.isTyping()
            );
            messagingTemplate.convertAndSend(
                "/topic/conversations/" + convId + "/typing",
                typingResponse
            );
        });
    }

    // ── Mark as Read ─────────────────────────────────────────────────────

    /**
     * Handle a mark-read event from a WebSocket client.
     * Updates lastReadAt and broadcasts a ReadReceipt to the conversation.
     * This allows the sender to see when the other party read their messages.
     *
     * Client subscribes to: /topic/conversations/{conversationId}/read
     * to receive read receipts.
     *
     * Note: the payload only carries conversationId.
     * The reader identity comes from the JWT principal — never from the payload.
     */
    @MessageMapping("/chat.read")
    @Transactional
    public void markAsRead(
            @Payload SendMessageRequest request,
            Principal principal) throws JobPortalException {

        if (principal == null) return;
        String readerEmail = principal.getName();
        Long convId = request.getConversationId();

        chatService.markAsRead(convId, readerEmail);

        userRepository.findByEmail(readerEmail).ifPresent(user -> {
            ReadReceiptResponse receipt = new ReadReceiptResponse(
                convId,
                user.getId(),
                user.getName(),
                java.time.LocalDateTime.now()
            );
            messagingTemplate.convertAndSend(
                "/topic/conversations/" + convId + "/read",
                receipt
            );
            log.debug("Read receipt broadcast for conv [{}] by [{}]", convId, readerEmail);
        });
    }

    // ── Error Handling ───────────────────────────────────────────────────

    /**
     * Catch all exceptions from @MessageMapping methods.
     * Routes a structured error ONLY to the client that caused it,
     * via /user/queue/errors (private per-user queue).
     * No raw stack traces or internal error messages are exposed.
     */
    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public WebSocketErrorResponse handleException(Exception ex) {
        log.error("WebSocket message handler exception: {}", ex.getMessage(), ex);
        if (ex instanceof JobPortalException jpe) {
            int status = jpe.getHttpStatus() != null ? jpe.getHttpStatus().value() : 500;
            if (status == 403) return WebSocketErrorResponse.accessDenied();
            if (status == 400) return WebSocketErrorResponse.invalidPayload(jpe.getMessage());
        }
        return WebSocketErrorResponse.serverError();
    }

    // ── Private helpers ──────────────────────────────────────────────────

    /**
     * Send MESSAGE_RECEIVED in-app notifications to participants who are
     * currently OFFLINE. Online participants receive the message via WebSocket.
     *
     * Design: only notify offline users to avoid double-alert for users
     * who are actively in the conversation.
     */
    private void notifyOfflineParticipants(Message message, Long convId, String senderEmail) {
        try {
            participantRepository.findAllByConversationId(convId).stream()
                .filter(cp -> !cp.getUser().getEmail().equals(senderEmail))
                .filter(cp -> !cp.isOnline())
                .forEach(cp -> {
                    User recipient = cp.getUser();
                    User sender = message.getSender();
                    notificationService.send(
                        recipient,
                        NotificationType.MESSAGE_RECEIVED,
                        NotificationPriority.HIGH,
                        "New message from " + sender.getName(),
                        truncate(message.getContent(), 100),
                        "/messages/" + convId,
                        message.getId(),
                        "MESSAGE"
                    );
                    log.debug("MESSAGE_RECEIVED notification sent to [{}] for conv [{}]",
                        recipient.getEmail(), convId);
                });
        } catch (Exception ex) {
            // Notification failure must never fail the message delivery
            log.error("Failed to send message notifications for conv [{}]: {}",
                convId, ex.getMessage(), ex);
        }
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen - 3) + "...";
    }
}
