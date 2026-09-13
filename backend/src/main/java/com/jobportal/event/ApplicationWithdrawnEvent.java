package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

/**
 * Published by {@link com.jobportal.serviceImpl.JobApplicationServiceImpl} when a
 * candidate withdraws their application.
 *
 * <p>Carries only scalar values (not JPA entities) because the application entity
 * is deleted before this event is dispatched. Passing the entity post-deletion
 * would expose a detached/invalid proxy to the listener.</p>
 */
public class ApplicationWithdrawnEvent extends ApplicationEvent {

    private final String applicantName;
    private final Long recruiterUserId;
    private final String jobTitle;
    private final Long jobId;
    private final Long applicationId;

    public ApplicationWithdrawnEvent(Object source,
                                     String applicantName,
                                     Long recruiterUserId,
                                     String jobTitle,
                                     Long jobId,
                                     Long applicationId) {
        super(source);
        this.applicantName   = applicantName;
        this.recruiterUserId = recruiterUserId;
        this.jobTitle        = jobTitle;
        this.jobId           = jobId;
        this.applicationId   = applicationId;
    }

    public String getApplicantName()   { return applicantName; }
    public Long getRecruiterUserId()   { return recruiterUserId; }
    public String getJobTitle()        { return jobTitle; }
    public Long getJobId()             { return jobId; }
    public Long getApplicationId()     { return applicationId; }
}
