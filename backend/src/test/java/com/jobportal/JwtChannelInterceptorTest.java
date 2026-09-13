package com.jobportal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;

import com.jobportal.chat.config.JwtChannelInterceptor;
import com.jobportal.chat.config.StompPrincipal;
import com.jobportal.chat.entity.ConversationParticipant;
import com.jobportal.chat.repository.ConversationParticipantRepository;
import com.jobportal.config.JwtProvider;

class JwtChannelInterceptorTest {

    private JwtProvider jwtProvider;
    private ConversationParticipantRepository participantRepository;
    private JwtChannelInterceptor interceptor;

    @BeforeEach
    void setUp() {
        jwtProvider = mock(JwtProvider.class);
        participantRepository = mock(ConversationParticipantRepository.class);
        interceptor = new JwtChannelInterceptor(jwtProvider, participantRepository);
    }

    @Test
    @DisplayName("CONNECT with cookie session attribute sets StompPrincipal")
    void testConnectWithSessionAttribute() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setLeaveMutable(true);
        Map<String, Object> sessionAttrs = new HashMap<>();
        sessionAttrs.put("authenticatedEmail", "user@example.com");
        accessor.setSessionAttributes(sessionAttrs);

        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
        MessageChannel channel = mock(MessageChannel.class);

        Message<?> result = interceptor.preSend(message, channel);

        assertNotNull(result);
        StompHeaderAccessor resultAccessor = StompHeaderAccessor.wrap(result);
        assertNotNull(resultAccessor.getUser());
        assertEquals("user@example.com", resultAccessor.getUser().getName());
    }

    @Test
    @DisplayName("CONNECT without any auth throws IllegalArgumentException")
    void testConnectWithoutAuthThrows() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setLeaveMutable(true);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
        MessageChannel channel = mock(MessageChannel.class);

        assertThrows(IllegalArgumentException.class, () ->
                interceptor.preSend(message, channel));
    }

    @Test
    @DisplayName("SUBSCRIBE to conversation by participant is permitted")
    void testSubscribeAllowedForParticipant() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setLeaveMutable(true);
        accessor.setUser(new StompPrincipal("user@example.com"));
        accessor.setDestination("/topic/conversations/42");

        when(participantRepository.findByConversationIdAndUserEmail(42L, "user@example.com"))
                .thenReturn(Optional.of(new ConversationParticipant()));

        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
        MessageChannel channel = mock(MessageChannel.class);

        Message<?> result = interceptor.preSend(message, channel);
        assertNotNull(result);
    }

    @Test
    @DisplayName("SUBSCRIBE to conversation by non-participant throws IllegalArgumentException")
    void testSubscribeDeniedForNonParticipant() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setLeaveMutable(true);
        accessor.setUser(new StompPrincipal("eavesdropper@example.com"));
        accessor.setDestination("/topic/conversations/42");

        when(participantRepository.findByConversationIdAndUserEmail(42L, "eavesdropper@example.com"))
                .thenReturn(Optional.empty());

        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
        MessageChannel channel = mock(MessageChannel.class);

        assertThrows(IllegalArgumentException.class, () ->
                interceptor.preSend(message, channel));
    }
}