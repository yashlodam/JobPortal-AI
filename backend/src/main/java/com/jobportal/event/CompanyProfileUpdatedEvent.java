package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

/**
 * Published when a recruiter creates or updates their company profile.
 * Scalar-only — no JPA entity references.
 */
public class CompanyProfileUpdatedEvent extends ApplicationEvent {

    private final Long    companyId;
    private final String  companyName;
    private final Long    recruiterUserId;
    /** {@code true} = just created; {@code false} = updated. */
    private final boolean created;

    public CompanyProfileUpdatedEvent(Object source,
                                      Long companyId,
                                      String companyName,
                                      Long recruiterUserId,
                                      boolean created) {
        super(source);
        this.companyId       = companyId;
        this.companyName     = companyName;
        this.recruiterUserId = recruiterUserId;
        this.created         = created;
    }

    public Long    getCompanyId()        { return companyId; }
    public String  getCompanyName()      { return companyName; }
    public Long    getRecruiterUserId()  { return recruiterUserId; }
    public boolean isCreated()           { return created; }
}
