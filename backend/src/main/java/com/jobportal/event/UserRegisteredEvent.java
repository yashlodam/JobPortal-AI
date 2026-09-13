package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

import com.jobportal.domain.AccountType;

/**
 * Published after a new user successfully completes registration.
 * Scalar-only — no JPA entity references.
 */
public class UserRegisteredEvent extends ApplicationEvent {

    private final Long        userId;
    private final String      name;
    private final String      email;
    private final AccountType accountType;

    public UserRegisteredEvent(Object source,
                               Long userId,
                               String name,
                               String email,
                               AccountType accountType) {
        super(source);
        this.userId      = userId;
        this.name        = name;
        this.email       = email;
        this.accountType = accountType;
    }

    public Long        getUserId()     { return userId; }
    public String      getName()       { return name; }
    public String      getEmail()      { return email; }
    public AccountType getAccountType(){ return accountType; }
}
