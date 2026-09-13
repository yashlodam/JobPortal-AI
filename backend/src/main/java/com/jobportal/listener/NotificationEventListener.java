package com.jobportal.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.jobportal.domain.ApplicationStatus;
import com.jobportal.domain.NotificationPriority;
import com.jobportal.domain.NotificationType;
import com.jobportal.entity.User;
import com.jobportal.event.ApplicationStatusChangedEvent;
import com.jobportal.event.ApplicationSubmittedEvent;
import com.jobportal.event.ApplicationWithdrawnEvent;
import com.jobportal.event.CompanyProfileUpdatedEvent;
import com.jobportal.event.JobDeletedEvent;
import com.jobportal.event.JobPostedEvent;
import com.jobportal.event.PasswordResetEvent;
import com.jobportal.event.ProfileCompletedEvent;
import com.jobportal.event.UserRegisteredEvent;
import com.jobportal.repository.NotificationRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.NotificationService;

/**
 * Spring event listener that translates domain events into in-app notifications.
 *
 * <h3>Decoupling</h3>
 * <p>Job, Application, and other modules publish events via
 * {@link org.springframework.context.ApplicationEventPublisher}. They have
 * zero dependency on {@link NotificationService}. This listener is the
 * single integration point between the domain modules and the notification module.</p>
 *
 * <h3>Transaction phase</h3>
 * <p>All listeners use {@code @TransactionalEventListener(AFTER_COMMIT)}.
 * Notifications are only created AFTER the triggering transaction commits
 * successfully — no spurious notifications on rollback.</p>
 *
 * <h3>CRITICAL: Scalar Events & Proxy Execution</h3>
 * <p>All event classes pass scalar fields only (IDs, names, titles).
 * Each listener method runs in a fresh transaction ({@code REQUIRES_NEW}) after commit,
 * loads the target {@link User} fresh from DB, and calls {@code notificationService.send()}
 * directly on the injected bean proxy.</p>
 */
@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService      notificationService;
    private final UserRepository           userRepository;
    private final NotificationRepository   notificationRepository;

    public NotificationEventListener(NotificationService notificationService,
                                     UserRepository userRepository,
                                     NotificationRepository notificationRepository) {
        this.notificationService    = notificationService;
        this.userRepository         = userRepository;
        this.notificationRepository = notificationRepository;
    }

    // ── Job Events ───────────────────────────────────────────────────────────

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onJobPosted(JobPostedEvent event) {
        try {
            NotificationType type = event.isFeatured()
                    ? NotificationType.FEATURED_JOB
                    : NotificationType.NEW_JOB;

            log.info("Job posted — type=[{}] jobId=[{}] recruiterUserId=[{}]",
                    type, event.getJobId(), event.getRecruiterUserId());

        } catch (Exception ex) {
            log.error("Failed to handle JobPostedEvent for job [{}]: {}",
                    event.getJobId(), ex.getMessage(), ex);
        }
    }

    // ── Application Events ───────────────────────────────────────────────────

    /**
     * Notifies the recruiter when a candidate submits a new application.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onApplicationSubmitted(ApplicationSubmittedEvent event) {
        try {
            User recruiterUser = userRepository.findById(event.getRecruiterUserId()).orElse(null);
            if (recruiterUser == null) {
                log.warn("onApplicationSubmitted: recruiter user id=[{}] not found — skipping",
                        event.getRecruiterUserId());
                return;
            }

            notificationService.send(
                    recruiterUser,
                    NotificationType.APPLICATION_RECEIVED,
                    NotificationPriority.MEDIUM,
                    "New Application Received",
                    event.getApplicantName() + " applied for \"" + event.getJobTitle() + "\".",
                    "/recruiter/applications",
                    event.getApplicationId(),
                    "APPLICATION"
            );
            log.info("APPLICATION_RECEIVED notification sent — appId=[{}] recruiterUserId=[{}]",
                    event.getApplicationId(), event.getRecruiterUserId());
        } catch (Exception ex) {
            log.error("Failed to notify recruiter for ApplicationSubmittedEvent [{}]: {}",
                    event.getApplicationId(), ex.getMessage(), ex);
        }
    }

    /**
     * Notifies the applicant when the recruiter changes their application status
     * (SHORTLISTED, INTERVIEWING, REJECTED, OFFERED, etc.).
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onApplicationStatusChanged(ApplicationStatusChangedEvent event) {
        try {
            ApplicationStatus    status = event.getNewStatus();
            NotificationType     type   = mapStatusToType(status);
            NotificationPriority prio   = mapStatusToPriority(status);
            String title     = buildStatusTitle(status, event.getCompanyName());
            String body      = buildStatusBody(status,
                                               event.getJobTitle(),
                                               event.getCompanyName(),
                                               event.getRecruiterNote());
            String actionUrl = "/my-jobs/applied";

            User applicant = userRepository.findById(event.getApplicantUserId()).orElse(null);
            if (applicant == null) {
                log.warn("onApplicationStatusChanged: applicant id=[{}] not found — skipping",
                        event.getApplicantUserId());
                return;
            }

            notificationService.send(applicant, type, prio, title, body,
                    actionUrl, event.getApplicationId(), "APPLICATION");

            log.info("Status notification sent — app=[{}] status=[{}] applicant=[{}]",
                    event.getApplicationId(), status, event.getApplicantEmail());

        } catch (Exception ex) {
            log.error("Failed to send status notification for application [{}]: {}",
                    event.getApplicationId(), ex.getMessage(), ex);
        }
    }

    /**
     * Notifies the recruiter when a candidate withdraws their application.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onApplicationWithdrawn(ApplicationWithdrawnEvent event) {
        try {
            User recruiterUser = userRepository.findById(event.getRecruiterUserId()).orElse(null);
            if (recruiterUser == null) {
                log.warn("onApplicationWithdrawn: recruiter id=[{}] not found — skipping",
                        event.getRecruiterUserId());
                return;
            }

            notificationService.send(
                    recruiterUser,
                    NotificationType.APPLICATION_WITHDRAWN,
                    NotificationPriority.LOW,
                    "Application Withdrawn",
                    event.getApplicantName() + " withdrew their application for \"" + event.getJobTitle() + "\".",
                    "/recruiter/applications",
                    event.getApplicationId(),
                    "APPLICATION"
            );
            log.info("APPLICATION_WITHDRAWN notification sent — appId=[{}]", event.getApplicationId());
        } catch (Exception ex) {
            log.error("Failed to notify recruiter for ApplicationWithdrawnEvent [{}]: {}",
                    event.getApplicationId(), ex.getMessage(), ex);
        }
    }

    // ── User / Auth Events ───────────────────────────────────────────────────

    /**
     * Sends a welcome ACCOUNT notification when a user registers.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserRegistered(UserRegisteredEvent event) {
        try {
            User user = userRepository.findById(event.getUserId()).orElse(null);
            if (user == null) {
                log.warn("onUserRegistered: user id=[{}] not found — skipping", event.getUserId());
                return;
            }

            String roleLabel = switch (event.getAccountType()) {
                case APPLICANT -> "job seeker";
                case EMPLOYER  -> "recruiter";
                default        -> "member";
            };

            notificationService.send(
                    user,
                    NotificationType.ACCOUNT,
                    NotificationPriority.LOW,
                    "Welcome to Velora! 🎉",
                    "Hi " + event.getName() + "! Your " + roleLabel + " account is ready. Complete your profile to get started.",
                    "/profile",
                    null,
                    null
            );
            log.info("Welcome notification sent to [{}]", event.getEmail());
        } catch (Exception ex) {
            log.error("Failed to send welcome notification for [{}]: {}",
                    event.getEmail(), ex.getMessage(), ex);
        }
    }

    /**
     * Sends a SECURITY alert when a user resets their password.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onPasswordReset(PasswordResetEvent event) {
        try {
            User user = userRepository.findById(event.getUserId()).orElse(null);
            if (user == null) {
                log.warn("onPasswordReset: user id=[{}] not found — skipping", event.getUserId());
                return;
            }

            notificationService.send(
                    user,
                    NotificationType.SECURITY,
                    NotificationPriority.HIGH,
                    "Password Changed Successfully",
                    "Your Velora account password was just changed. If you did not make this change, contact support immediately.",
                    "/settings",
                    null,
                    null
            );
            log.info("SECURITY notification sent for password reset [{}]", event.getEmail());
        } catch (Exception ex) {
            log.error("Failed to send password-reset SECURITY notification for [{}]: {}",
                    event.getEmail(), ex.getMessage(), ex);
        }
    }

    // ── Company Events ───────────────────────────────────────────────────────

    /**
     * Notifies the recruiter when they create or update their company profile.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onCompanyProfileUpdated(CompanyProfileUpdatedEvent event) {
        try {
            User recruiterUser = userRepository.findById(event.getRecruiterUserId()).orElse(null);
            if (recruiterUser == null) {
                log.warn("onCompanyProfileUpdated: recruiter user id=[{}] not found — skipping",
                        event.getRecruiterUserId());
                return;
            }

            boolean isNew = event.isCreated();
            notificationService.send(
                    recruiterUser,
                    NotificationType.COMPANY_UPDATE,
                    NotificationPriority.LOW,
                    isNew ? "Company Profile Created! 🏢" : "Company Profile Updated",
                    isNew ? "Your company \"" + event.getCompanyName() + "\" is live. You can now post jobs!"
                          : "Your company \"" + event.getCompanyName() + "\" profile has been updated successfully.",
                    "/recruiter/company",
                    event.getCompanyId(),
                    "COMPANY"
            );
            log.info("COMPANY_UPDATE notification sent to [{}] for company [{}]",
                    recruiterUser.getEmail(), event.getCompanyId());
        } catch (Exception ex) {
            log.error("Failed to send company notification for recruiterId [{}]: {}",
                    event.getRecruiterUserId(), ex.getMessage(), ex);
        }
    }

    // ── Profile Events ───────────────────────────────────────────────────────

    /**
     * Sends a one-time PROFILE_COMPLETED celebration notification.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onProfileCompleted(ProfileCompletedEvent event) {
        try {
            boolean alreadyNotified = notificationRepository.existsByRecipientIdAndType(
                    event.getUserId(), NotificationType.PROFILE_COMPLETED);
            if (alreadyNotified) {
                return;
            }

            User user = userRepository.findById(event.getUserId()).orElse(null);
            if (user == null) {
                log.warn("onProfileCompleted: user id=[{}] not found — skipping", event.getUserId());
                return;
            }

            notificationService.send(
                    user,
                    NotificationType.PROFILE_COMPLETED,
                    NotificationPriority.MEDIUM,
                    "Your Profile is 100% Complete! ⭐",
                    "Great job! A complete profile gets 5x more recruiter views. Keep it updated to stay visible.",
                    "/profile",
                    null,
                    null
            );
            log.info("PROFILE_COMPLETED notification sent to [{}]", event.getEmail());
        } catch (Exception ex) {
            log.error("Failed to send profile-completed notification for [{}]: {}",
                    event.getEmail(), ex.getMessage(), ex);
        }
    }

    // ── Job Deletion Events ──────────────────────────────────────────────────

    /**
     * Notifies all applicants when a job they applied to has been deleted.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onJobDeleted(JobDeletedEvent event) {
        if (event.getApplicantUserIds() == null || event.getApplicantUserIds().isEmpty()) {
            return;
        }
        try {
            for (Long userId : event.getApplicantUserIds()) {
                User applicant = userRepository.findById(userId).orElse(null);
                if (applicant == null) {
                    log.warn("onJobDeleted: user id=[{}] not found — skipping", userId);
                    continue;
                }

                notificationService.send(
                        applicant,
                        NotificationType.JOB_EXPIRED,
                        NotificationPriority.MEDIUM,
                        "A Job You Applied to Has Been Removed",
                        "The job \"" + event.getJobTitle() + "\" has been removed by the recruiter. Explore similar open positions.",
                        "/find-jobs",
                        event.getJobId(),
                        "JOB"
                );
            }
            log.info("JOB_EXPIRED notifications sent to {} applicant(s) for job [{}]",
                    event.getTotalApplicants(), event.getJobId());
        } catch (Exception ex) {
            log.error("Failed to send JOB_EXPIRED notifications for job [{}]: {}",
                    event.getJobId(), ex.getMessage(), ex);
        }
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    private NotificationType mapStatusToType(ApplicationStatus status) {
        return switch (status) {
            case REVIEWING    -> NotificationType.APPLICATION_STATUS_UPDATED;
            case SHORTLISTED  -> NotificationType.APPLICATION_SHORTLISTED;
            case REJECTED     -> NotificationType.APPLICATION_REJECTED;
            case INTERVIEWING -> NotificationType.INTERVIEW_SCHEDULED;
            case OFFERED      -> NotificationType.OFFER_RECEIVED;
            case ACCEPTED     -> NotificationType.OFFER_ACCEPTED;
            default           -> NotificationType.APPLICATION_STATUS_UPDATED;
        };
    }

    private NotificationPriority mapStatusToPriority(ApplicationStatus status) {
        return switch (status) {
            case SHORTLISTED, INTERVIEWING, OFFERED, ACCEPTED -> NotificationPriority.HIGH;
            case REJECTED                                      -> NotificationPriority.MEDIUM;
            default                                            -> NotificationPriority.LOW;
        };
    }

    private String buildStatusTitle(ApplicationStatus status, String companyName) {
        String company = (companyName != null && !companyName.isBlank()) ? companyName : "the company";
        return switch (status) {
            case REVIEWING    -> "Application Under Review";
            case SHORTLISTED  -> "🎉 You've Been Shortlisted!";
            case INTERVIEWING -> "📅 Interview Scheduled!";
            case OFFERED      -> "🏆 You've Received an Offer from " + company + "!";
            case ACCEPTED     -> "✅ Offer Accepted";
            case REJECTED     -> "Application Update from " + company;
            default           -> "Application Status Updated";
        };
    }

    private String buildStatusBody(ApplicationStatus status,
                                    String jobTitle,
                                    String companyName,
                                    String recruiterNote) {
        String job     = (jobTitle    != null && !jobTitle.isBlank())    ? "\"" + jobTitle + "\""  : "your application";
        String company = (companyName != null && !companyName.isBlank()) ? companyName             : "the company";
        String note    = (recruiterNote != null && !recruiterNote.isBlank())
                ? " Note from recruiter: \"" + recruiterNote + "\""
                : "";

        return switch (status) {
            case REVIEWING ->
                    "Good news! " + company + " is actively reviewing your application for "
                    + job + ". Stay tuned for updates." + note;

            case SHORTLISTED ->
                    "Congratulations! Your profile stood out and you've been shortlisted"
                    + " for " + job + " at " + company + "."
                    + " Expect an interview invitation soon." + note;

            case INTERVIEWING ->
                    "Great news! " + company + " would like to interview you for " + job + "."
                    + " Check your profile for details and prepare well. Good luck!" + note;

            case OFFERED ->
                    "Exciting news! " + company + " has extended a job offer to you for "
                    + job + ". Review and respond to your offer in the portal." + note;

            case ACCEPTED ->
                    "Your acceptance for " + job + " at " + company + " has been confirmed."
                    + " Congratulations on your new opportunity!" + note;

            case REJECTED ->
                    "Thank you for your interest in " + job + " at " + company + "."
                    + " After careful consideration, they've decided to move forward"
                    + " with other candidates. Don't be discouraged — keep applying!" + note;

            default ->
                    "Your application status for " + job + " has been updated to: "
                    + formatStatus(status.name()) + "." + note;
        };
    }

    // ── Recruiter Verification Events ────────────────────────────────────────

    /**
     * Dispatches in-app notifications for recruiter verification lifecycle events:
     * VERIFICATION_SUBMITTED, RECRUITER_APPROVED, RECRUITER_REJECTED, RECRUITER_SUSPENDED.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onRecruiterVerificationChanged(com.jobportal.event.RecruiterVerificationEvent event) {
        try {
            User user = userRepository.findById(event.getRecruiterUserId()).orElse(null);
            if (user == null) {
                log.warn("onRecruiterVerificationChanged: user id=[{}] not found — skipping",
                        event.getRecruiterUserId());
                return;
            }

            com.jobportal.domain.RecruiterStatus status = event.getNewStatus();
            NotificationType type;
            NotificationPriority priority;
            String title;
            String body;
            String actionUrl;

            switch (status) {
                case PENDING_VERIFICATION -> {
                    type = NotificationType.VERIFICATION_SUBMITTED;
                    priority = NotificationPriority.MEDIUM;
                    title = "Verification Submitted";
                    body = "Your recruiter verification is submitted and is currently under review by our admin team.";
                    actionUrl = "/recruiter/verification";
                }
                case APPROVED -> {
                    type = NotificationType.RECRUITER_APPROVED;
                    priority = NotificationPriority.HIGH;
                    title = "Recruiter Account Approved! 🎉";
                    body = "Congratulations " + event.getRecruiterName() + "! Your recruiter account has been approved. You now have full access to post jobs and search talent.";
                    actionUrl = "/recruiter/dashboard";
                }
                case REJECTED -> {
                    type = NotificationType.RECRUITER_REJECTED;
                    priority = NotificationPriority.HIGH;
                    title = "Recruiter Verification Update";
                    String reason = (event.getRejectionReason() != null && !event.getRejectionReason().isBlank())
                            ? event.getRejectionReason()
                            : "Information provided did not meet verification criteria.";
                    body = "Your verification request was not approved. Reason: \"" + reason + "\". You may update your profile and resubmit.";
                    actionUrl = "/recruiter/verification";
                }
                case SUSPENDED -> {
                    type = NotificationType.RECRUITER_SUSPENDED;
                    priority = NotificationPriority.CRITICAL;
                    title = "Recruiter Account Suspended";
                    String reason = (event.getRejectionReason() != null && !event.getRejectionReason().isBlank())
                            ? event.getRejectionReason()
                            : "Account suspended due to policy violations.";
                    body = "Your recruiter account has been suspended. Reason: \"" + reason + "\". Please contact platform support.";
                    actionUrl = "/about";
                }
                default -> {
                    return;
                }
            }

            notificationService.send(
                    user,
                    type,
                    priority,
                    title,
                    body,
                    actionUrl,
                    event.getRecruiterId(),
                    "RECRUITER_VERIFICATION"
            );

            log.info("Recruiter verification notification [{}] sent to [{}]", type, event.getRecruiterEmail());

        } catch (Exception ex) {
            log.error("Failed to send verification notification for recruiter [{}]: {}",
                    event.getRecruiterEmail(), ex.getMessage(), ex);
        }
    }

    private String formatStatus(String status) {
        String lower = status.toLowerCase().replace('_', ' ');
        return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
    }
}

