package com.jobportal.chat.config;

import java.security.Principal;

/**
 * Minimal Principal implementation that wraps the authenticated user email.
 *
 * Created by JwtChannelInterceptor on successful STOMP CONNECT authentication.
 * Stored in the WebSocket session and available in @MessageMapping methods
 * via the Principal parameter, or via SimpMessageHeaderAccessor.getUser().
 *
 * getName() returns the user email, matching UserDetails.getUsername()
 * and JwtProvider.getEmailFromToken() - the single source of truth for identity.
 */
public class StompPrincipal implements Principal {

    private final String email;

    public StompPrincipal(String email) {
        this.email = email;
    }

    @Override
    public String getName() {
        return email;
    }
}
