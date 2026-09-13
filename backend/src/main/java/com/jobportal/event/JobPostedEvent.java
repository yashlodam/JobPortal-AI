package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

/**
 * Published when a recruiter posts a new job.
 *
 * <p><strong>Scalar-only design:</strong> No JPA entity references — prevents
 * {@code DetachedObjectException} in {@code AFTER_COMMIT} listeners.</p>
 */
public class JobPostedEvent extends ApplicationEvent {

    private final Long   jobId;
    private final String jobTitle;
    private final Long   recruiterUserId;
    private final boolean featured;

    public JobPostedEvent(Object source,
                          Long jobId,
                          String jobTitle,
                          Long recruiterUserId,
                          boolean featured) {
        super(source);
        this.jobId           = jobId;
        this.jobTitle        = jobTitle;
        this.recruiterUserId = recruiterUserId;
        this.featured        = featured;
    }

    public Long   getJobId()          { return jobId; }
    public String getJobTitle()       { return jobTitle; }
    public Long   getRecruiterUserId(){ return recruiterUserId; }
    public boolean isFeatured()       { return featured; }
}
