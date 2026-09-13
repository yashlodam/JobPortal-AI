package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

/**
 * Published after a user successfully resets their password.
 * Scalar-only — no JPA entity references.
 */
public class PasswordResetEvent extends ApplicationEvent {

    private final Long   userId;
    private final String email;

    public PasswordResetEvent(Object source, Long userId, String email) {
        super(source);
        this.userId = userId;
        this.email  = email;
    }

    public Long   getUserId() { return userId; }
    public String getEmail()  { return email; }
}
