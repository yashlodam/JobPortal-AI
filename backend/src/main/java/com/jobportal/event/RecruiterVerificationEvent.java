package com.jobportal.event;

import org.springframework.context.ApplicationEvent;

import com.jobportal.domain.RecruiterStatus;

/**
 * Domain event published when a recruiter's verification status changes.
 *
 * <p>Carries only scalar values — safe for use in
 * {@code @TransactionalEventListener(AFTER_COMMIT)} listeners where the
 * original JPA session is already closed.</p>
 *
 * <h3>Published by</h3>
 * <ul>
 *   <li>{@link com.jobportal.serviceImpl.RecruiterVerificationServiceImpl#submitVerification} — PENDING</li>
 *   <li>{@link com.jobportal.serviceImpl.AdminRecruiterServiceImpl#approveRecruiter} — APPROVED</li>
 *   <li>{@link com.jobportal.serviceImpl.AdminRecruiterServiceImpl#rejectRecruiter} — REJECTED</li>
 *   <li>{@link com.jobportal.serviceImpl.AdminRecruiterServiceImpl#suspendRecruiter} — SUSPENDED</li>
 * </ul>
 *
 * <h3>Consumed by</h3>
 * {@link com.jobportal.listener.NotificationEventListener#onRecruiterVerificationChanged}
 */
public class RecruiterVerificationEvent extends ApplicationEvent {

    private final Long            recruiterId;
    private final Long            recruiterUserId;
    private final String          recruiterEmail;
    private final String          recruiterName;
    private final RecruiterStatus newStatus;
    private final String          rejectionReason;   // null for PENDING/APPROVED

    public RecruiterVerificationEvent(
            Object source,
            Long recruiterId,
            Long recruiterUserId,
            String recruiterEmail,
            String recruiterName,
            RecruiterStatus newStatus,
            String rejectionReason) {
        super(source);
        this.recruiterId      = recruiterId;
        this.recruiterUserId  = recruiterUserId;
        this.recruiterEmail   = recruiterEmail;
        this.recruiterName    = recruiterName;
        this.newStatus        = newStatus;
        this.rejectionReason  = rejectionReason;
    }

    public Long            getRecruiterId()      { return recruiterId; }
    public Long            getRecruiterUserId()  { return recruiterUserId; }
    public String          getRecruiterEmail()   { return recruiterEmail; }
    public String          getRecruiterName()    { return recruiterName; }
    public RecruiterStatus getNewStatus()        { return newStatus; }
    public String          getRejectionReason()  { return rejectionReason; }
}
