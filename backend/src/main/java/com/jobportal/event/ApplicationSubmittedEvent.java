package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

/**
 * Published when a candidate successfully submits a job application.
 *
 * <p><strong>Scalar-only design:</strong> All fields are plain Java scalars — no JPA
 * entity references. This event fires with {@code @TransactionalEventListener(AFTER_COMMIT)},
 * meaning the original Hibernate session is already closed when listeners run.
 * Passing entity proxies into a subsequent {@code REQUIRES_NEW} transaction causes
 * {@code DetachedObjectException}. Scalars are always safe.</p>
 */
public class ApplicationSubmittedEvent extends ApplicationEvent {

    /** ID of the application just created. */
    private final Long applicationId;

    /** ID of the applicant user (the person who applied). */
    private final Long applicantUserId;

    /** Name of the applicant — for the notification body. */
    private final String applicantName;

    /** ID of the job applied to. */
    private final Long jobId;

    /** Title of the job — for the notification body. */
    private final String jobTitle;

    /** ID of the recruiter's User record (notification recipient). */
    private final Long recruiterUserId;

    public ApplicationSubmittedEvent(Object source,
                                     Long applicationId,
                                     Long applicantUserId,
                                     String applicantName,
                                     Long jobId,
                                     String jobTitle,
                                     Long recruiterUserId) {
        super(source);
        this.applicationId   = applicationId;
        this.applicantUserId = applicantUserId;
        this.applicantName   = applicantName;
        this.jobId           = jobId;
        this.jobTitle        = jobTitle;
        this.recruiterUserId = recruiterUserId;
    }

    public Long   getApplicationId()   { return applicationId; }
    public Long   getApplicantUserId() { return applicantUserId; }
    public String getApplicantName()   { return applicantName; }
    public Long   getJobId()           { return jobId; }
    public String getJobTitle()        { return jobTitle; }
    public Long   getRecruiterUserId() { return recruiterUserId; }
}
