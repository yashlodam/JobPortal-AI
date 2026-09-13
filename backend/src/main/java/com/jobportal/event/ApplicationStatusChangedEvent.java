package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

import com.jobportal.domain.ApplicationStatus;

/**
 * Published by {@link com.jobportal.serviceImpl.JobApplicationServiceImpl} when a
 * recruiter changes the status of an application (SHORTLISTED, REJECTED, etc.).
 *
 * <p><strong>Design:</strong> This event carries only <em>scalar values</em> — no JPA
 * entity references. The listener runs in a new transaction after the original commit,
 * so Hibernate session is already closed. Passing entity proxies here would cause a
 * {@code LazyInitializationException} when the listener accesses any lazy field.
 * Scalars are always safe.</p>
 *
 * <p>All data needed by the {@link com.jobportal.listener.NotificationEventListener}
 * is captured inside the originating transaction and stored in this event.</p>
 */
public class ApplicationStatusChangedEvent extends ApplicationEvent {

    /** ID of the application that was updated. */
    private final Long applicationId;

    /** ID of the applicant's User entity (recipient of the notification). */
    private final Long applicantUserId;

    /** Human-readable name of the applicant. */
    private final String applicantName;

    /** Email of the applicant (for logging / future email dispatch). */
    private final String applicantEmail;

    /** Title of the job the application is for. */
    private final String jobTitle;

    /** ID of the job (used to build the deep-link URL). */
    private final Long jobId;

    /** Name of the company. */
    private final String companyName;

    /** The new status set by the recruiter. */
    private final ApplicationStatus newStatus;

    /** Optional free-text note from the recruiter (may be null). */
    private final String recruiterNote;

    public ApplicationStatusChangedEvent(Object source,
                                         Long applicationId,
                                         Long applicantUserId,
                                         String applicantName,
                                         String applicantEmail,
                                         String jobTitle,
                                         Long jobId,
                                         String companyName,
                                         ApplicationStatus newStatus,
                                         String recruiterNote) {
        super(source);
        this.applicationId  = applicationId;
        this.applicantUserId = applicantUserId;
        this.applicantName  = applicantName;
        this.applicantEmail = applicantEmail;
        this.jobTitle       = jobTitle;
        this.jobId          = jobId;
        this.companyName    = companyName;
        this.newStatus      = newStatus;
        this.recruiterNote  = recruiterNote;
    }

    public Long getApplicationId()   { return applicationId; }
    public Long getApplicantUserId() { return applicantUserId; }
    public String getApplicantName() { return applicantName; }
    public String getApplicantEmail(){ return applicantEmail; }
    public String getJobTitle()      { return jobTitle; }
    public Long getJobId()           { return jobId; }
    public String getCompanyName()   { return companyName; }
    public ApplicationStatus getNewStatus() { return newStatus; }
    public String getRecruiterNote() { return recruiterNote; }
}
