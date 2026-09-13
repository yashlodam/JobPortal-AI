package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

import com.jobportal.entity.Job;

/**
 * Published by {@link com.jobportal.serviceImpl.JobServiceImpl}
 * just before a job is deleted (hard-deleted from the system).
 *
 * <p>The listener uses this event to notify all applicants who had applied to
 * the job that it has been removed. Scalar copies of required data are captured
 * before deletion so the listener does not need to make DB queries.</p>
 *
 * <p>This is the only event that fires <em>before</em> the entity is deleted.
 * The caller captures needed data from the entity, then deletes it.
 * The listener runs after commit (safely) using only the scalar fields.</p>
 */
public class JobDeletedEvent extends ApplicationEvent {

    /** Job ID captured before deletion for reference. */
    private final Long jobId;
    private final String jobTitle;
    /** Total applicants — used to decide whether fan-out is needed. */
    private final int totalApplicants;
    /** IDs of users who applied — resolved before deletion. */
    private final java.util.List<Long> applicantUserIds;

    public JobDeletedEvent(Object source,
                           Long jobId,
                           String jobTitle,
                           int totalApplicants,
                           java.util.List<Long> applicantUserIds) {
        super(source);
        this.jobId           = jobId;
        this.jobTitle        = jobTitle;
        this.totalApplicants = totalApplicants;
        this.applicantUserIds = java.util.List.copyOf(applicantUserIds);
    }

    public Long getJobId()                         { return jobId; }
    public String getJobTitle()                    { return jobTitle; }
    public int getTotalApplicants()                { return totalApplicants; }
    public java.util.List<Long> getApplicantUserIds() { return applicantUserIds; }
}
