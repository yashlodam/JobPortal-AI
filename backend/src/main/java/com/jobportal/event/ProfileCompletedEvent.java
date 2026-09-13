package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

/**
 * Published when a profile completion check determines the profile is now complete.
 * Scalar-only — no JPA entity references.
 */
public class ProfileCompletedEvent extends ApplicationEvent {

    private final Long   userId;
    private final String email;

    public ProfileCompletedEvent(Object source, Long userId, String email) {
        super(source);
        this.userId = userId;
        this.email  = email;
    }

    public Long   getUserId() { return userId; }
    public String getEmail()  { return email; }
}
