package com.jobportal.serviceImpl;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.AccountType;
import com.jobportal.dto.request.JobApplicationRequest;
import com.jobportal.dto.request.UpdateApplicationStatusRequest;
import com.jobportal.dto.response.JobApplicationResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.Resume;
import com.jobportal.entity.User;
import com.jobportal.event.ApplicationStatusChangedEvent;
import com.jobportal.event.ApplicationSubmittedEvent;
import com.jobportal.event.ApplicationWithdrawnEvent;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.JobApplicationService;

/**
 * Implements job-application business logic.
 *
 * <h3>Notification decoupling</h3>
 * <p>This service no longer depends on {@link com.jobportal.service.NotificationService}
 * directly. Instead, it publishes domain events via {@link ApplicationEventPublisher}.
 * The {@link com.jobportal.listener.NotificationEventListener} handles these events
 * and creates notifications independently, which:
 * <ul>
 *   <li>Eliminates tight coupling between the Application module and the Notification module.</li>
 *   <li>Ensures notifications are only sent AFTER the business transaction commits
 *       (via {@code @TransactionalEventListener(AFTER_COMMIT)}).</li>
 *   <li>Makes it easy to add other listeners in the future (e.g. email, WebSocket push)
 *       without modifying this class.</li>
 * </ul>
 * </p>
 */
@Service
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobRepository            jobRepository;
    private final UserRepository           userRepository;
    private final RecruiterRepository      recruiterRepository;
    private final ResumeRepository         resumeRepository;
    private final com.jobportal.repository.ProfileRepository profileRepository;
    private final com.jobportal.service.ResumeService resumeService;
    private final ApplicationEventPublisher eventPublisher;
    private final com.jobportal.service.RecruiterAuthorizationService recruiterAuthorizationService;
    private final com.jobportal.jobmatch.repository.JobMatchAnalysisRepository jobMatchAnalysisRepository;
    private final com.jobportal.chat.repository.ConversationRepository conversationRepository;

    public JobApplicationServiceImpl(
            JobApplicationRepository applicationRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            RecruiterRepository recruiterRepository,
            ResumeRepository resumeRepository,
            com.jobportal.repository.ProfileRepository profileRepository,
            com.jobportal.service.ResumeService resumeService,
            ApplicationEventPublisher eventPublisher,
            com.jobportal.service.RecruiterAuthorizationService recruiterAuthorizationService,
            com.jobportal.jobmatch.repository.JobMatchAnalysisRepository jobMatchAnalysisRepository,
            com.jobportal.chat.repository.ConversationRepository conversationRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository         = jobRepository;
        this.userRepository        = userRepository;
        this.recruiterRepository   = recruiterRepository;
        this.resumeRepository      = resumeRepository;
        this.profileRepository     = profileRepository;
        this.resumeService        = resumeService;
        this.eventPublisher        = eventPublisher;
        this.recruiterAuthorizationService = recruiterAuthorizationService;
        this.jobMatchAnalysisRepository = jobMatchAnalysisRepository;
        this.conversationRepository = conversationRepository;
    }

    // ── Apply ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public JobApplicationResponse applyToJob(Long jobId,
                                              JobApplicationRequest request,
                                              String email)
            throws JobPortalException {
        User applicant = findUserByEmail(email);

        if (applicant.getAccountType() != AccountType.APPLICANT) {
            throw JobPortalException.forbidden("Only applicants can apply for jobs.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Job not found with id: " + jobId));

        if (applicationRepository.existsByApplicantIdAndJobId(applicant.getId(), jobId)) {
            throw JobPortalException.conflict("You have already applied for this job.");
        }

        Resume selectedResume = null;

        if (request.getResumeId() != null) {
            selectedResume = resumeRepository.findById(request.getResumeId())
                    .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + request.getResumeId()));
            if (!selectedResume.getProfile().getUser().getId().equals(applicant.getId())) {
                throw JobPortalException.forbidden("This resume does not belong to you.");
            }
        } else {
            com.jobportal.entity.Profile profile = profileRepository.findByUserEmail(email)
                    .orElseThrow(() -> JobPortalException.notFound("Profile not found."));

            selectedResume = resumeRepository.findByProfileIdAndIsDefaultTrue(profile.getId())
                    .orElseGet(() -> {
                        java.util.List<Resume> userResumes = resumeRepository.findByProfileIdOrderByIsDefaultDescCreatedAtDesc(profile.getId());
                        return userResumes.isEmpty() ? null : userResumes.get(0);
                    });

            if (selectedResume == null) {
                throw JobPortalException.badRequest("Please upload a resume before applying.");
            }
        }

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setApplicant(applicant);
        application.setCoverLetter(request.getCoverLetter());
        application.setResume(selectedResume);

        JobApplication saved = applicationRepository.save(application);

        // Increment applicant count atomically in DB
        jobRepository.incrementApplicantCount(job.getId());

        // ── Capture scalars from loaded entities while session is OPEN ──────
        // All event constructors now take only scalars so AFTER_COMMIT listeners
        // never touch detached proxies.
        User recruiterUser = job.getRecruiter().getUser();
        eventPublisher.publishEvent(new ApplicationSubmittedEvent(
                this,
                saved.getId(),
                applicant.getId(),
                applicant.getName(),
                job.getId(),
                job.getJobTitle(),
                recruiterUser.getId()
        ));

        return toResponse(saved);
    }

    // ── Withdraw ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void withdrawApplication(Long applicationId, String email)
            throws JobPortalException {
        User applicant = findUserByEmail(email);
        JobApplication application = findApplicationById(applicationId);

        if (!application.getApplicant().getId().equals(applicant.getId())) {
            throw JobPortalException.forbidden(
                    "You are not authorized to withdraw this application.");
        }

        Job job = application.getJob();

        // Capture data before deletion — listener runs after commit with these scalars
        String applicantName   = applicant.getName();
        Long   recruiterUserId = job.getRecruiter().getUser().getId();
        String jobTitle        = job.getJobTitle();
        Long   jobId           = job.getId();

        // Decrement applicant count atomically in DB
        jobRepository.decrementApplicantCount(job.getId());

        // ── Clean up dependent child records before deletion ───────────────
        conversationRepository.detachJobApplication(applicationId);
        jobMatchAnalysisRepository.deleteByJobApplicationId(applicationId);

        applicationRepository.delete(application);

        // ── Publish event: listener handles notification creation ──────────
        // Pass only scalars — entity is deleted; listener runs after commit
        eventPublisher.publishEvent(new ApplicationWithdrawnEvent(
                this, applicantName, recruiterUserId, jobTitle, jobId, applicationId));
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationResponse> getMyApplications(String email, Pageable pageable)
            throws JobPortalException {
        User applicant = findUserByEmail(email);
        return applicationRepository.findByApplicantId(applicant.getId(), pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationResponse> getJobApplications(Long jobId,
                                                            String email,
                                                            Pageable pageable)
            throws JobPortalException {
        // ── SECURITY GATE: approved or pending recruiters can view job applications for their jobs ──
        Recruiter recruiter = recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> JobPortalException.notFound("Job not found."));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw JobPortalException.forbidden(
                    "You can only view applications for your own jobs.");
        }

        return applicationRepository.findByJobId(jobId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationResponse> getAllRecruiterApplications(String email, Pageable pageable)
            throws JobPortalException {
        // ── SECURITY GATE: approved or pending recruiters can view all applications for their jobs ──
        Recruiter recruiter = recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email);
        Long recruiterId = recruiter.getId();
        Long userId = recruiter.getUser() != null ? recruiter.getUser().getId() : recruiterId;
        return applicationRepository.findByJobRecruiterIdOrUserId(recruiterId, userId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public com.jobportal.dto.response.RecruiterDashboardStatsResponse getRecruiterDashboardStats(String email)
            throws JobPortalException {
        Recruiter recruiter = recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email);
        Long recruiterId = recruiter.getId();
        Long userId = recruiter.getUser() != null ? recruiter.getUser().getId() : recruiterId;

        long activeJobs = jobRepository.countByRecruiterAndStatus(recruiterId, userId, com.jobportal.domain.JobStatus.OPEN);
        long featuredJobs = jobRepository.countFeaturedByRecruiterAndStatus(recruiterId, userId, com.jobportal.domain.JobStatus.OPEN);

        long totalApps = applicationRepository.countByJobRecruiterIdOrUserId(recruiterId, userId);
        long applied = applicationRepository.countByJobRecruiterIdOrUserIdAndStatus(recruiterId, userId, com.jobportal.domain.ApplicationStatus.APPLIED);
        long reviewing = applicationRepository.countByJobRecruiterIdOrUserIdAndStatus(recruiterId, userId, com.jobportal.domain.ApplicationStatus.REVIEWING);
        long newApps = applied + reviewing;
        long shortlisted = applicationRepository.countByJobRecruiterIdOrUserIdAndStatus(recruiterId, userId, com.jobportal.domain.ApplicationStatus.SHORTLISTED);
        long interviews = applicationRepository.countByJobRecruiterIdOrUserIdAndStatus(recruiterId, userId, com.jobportal.domain.ApplicationStatus.INTERVIEWING);
        long offered = applicationRepository.countByJobRecruiterIdOrUserIdAndStatus(recruiterId, userId, com.jobportal.domain.ApplicationStatus.OFFERED);
        long hired = applicationRepository.countByJobRecruiterIdOrUserIdAndStatus(recruiterId, userId, com.jobportal.domain.ApplicationStatus.ACCEPTED);
        long rejected = applicationRepository.countByJobRecruiterIdOrUserIdAndStatus(recruiterId, userId, com.jobportal.domain.ApplicationStatus.REJECTED);

        return new com.jobportal.dto.response.RecruiterDashboardStatsResponse(
                activeJobs, featuredJobs, totalApps, newApps, shortlisted, interviews, offered, hired, rejected
        );
    }

    // ── Status Update ─────────────────────────────────────────────────────────

    @Override
    @Transactional
    public JobApplicationResponse updateApplicationStatus(Long applicationId,
                                                           UpdateApplicationStatusRequest request,
                                                           String email)
            throws JobPortalException {
        // ── SECURITY GATE: approved or pending recruiters can update application status ──
        Recruiter recruiter = recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email);

        JobApplication application = findApplicationById(applicationId);

        if (!application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw JobPortalException.forbidden(
                    "You are not authorized to update this application.");
        }

        if (application.getStatus() == com.jobportal.domain.ApplicationStatus.WITHDRAWN) {
            throw JobPortalException.badRequest("Cannot update status of a withdrawn application.");
        }
        if (request.getStatus() == com.jobportal.domain.ApplicationStatus.WITHDRAWN) {
            throw JobPortalException.badRequest("Applications can only be withdrawn by the applicant.");
        }

        validateApplicationStatusTransition(application.getStatus(), request.getStatus());

        application.setStatus(request.getStatus());
        JobApplication updated = applicationRepository.save(application);

        // ── Capture all scalars while session is OPEN ─────────────────────
        // The listener runs AFTER_COMMIT in a new transaction.
        // The original session is already closed by then, so any lazy
        // proxy access on the entity would throw LazyInitializationException.
        // We extract everything we need here — safe inside this transaction.
        Long   applicantUserId = updated.getApplicant().getId();
        String applicantName   = updated.getApplicant().getName();
        String applicantEmail  = updated.getApplicant().getEmail();
        String jobTitle        = updated.getJob().getJobTitle();
        Long   jobId           = updated.getJob().getId();
        String companyName     = updated.getJob().getCompany() != null
                ? updated.getJob().getCompany().getCompanyName() : "";

        // ── Publish event: listener maps status → NotificationType ────────
        eventPublisher.publishEvent(new ApplicationStatusChangedEvent(
                this,
                updated.getId(),
                applicantUserId,
                applicantName,
                applicantEmail,
                jobTitle,
                jobId,
                companyName,
                request.getStatus(),
                request.getNote()          // optional recruiter note (may be null)
        ));

        return toResponse(updated);
    }

    private void validateApplicationStatusTransition(com.jobportal.domain.ApplicationStatus current, com.jobportal.domain.ApplicationStatus next) {
        if (current == next) return;
        if (current == com.jobportal.domain.ApplicationStatus.ACCEPTED) {
            throw JobPortalException.badRequest("Cannot change status after offer has been accepted.");
        }
        boolean valid = switch (current) {
            case APPLIED -> next == com.jobportal.domain.ApplicationStatus.REVIEWING || next == com.jobportal.domain.ApplicationStatus.SHORTLISTED || next == com.jobportal.domain.ApplicationStatus.REJECTED;
            case REVIEWING -> next == com.jobportal.domain.ApplicationStatus.SHORTLISTED || next == com.jobportal.domain.ApplicationStatus.INTERVIEWING || next == com.jobportal.domain.ApplicationStatus.REJECTED;
            case SHORTLISTED -> next == com.jobportal.domain.ApplicationStatus.INTERVIEWING || next == com.jobportal.domain.ApplicationStatus.OFFERED || next == com.jobportal.domain.ApplicationStatus.REJECTED;
            case INTERVIEWING -> next == com.jobportal.domain.ApplicationStatus.OFFERED || next == com.jobportal.domain.ApplicationStatus.SHORTLISTED || next == com.jobportal.domain.ApplicationStatus.REJECTED;
            case OFFERED -> next == com.jobportal.domain.ApplicationStatus.ACCEPTED || next == com.jobportal.domain.ApplicationStatus.REJECTED;
            case REJECTED -> next == com.jobportal.domain.ApplicationStatus.REVIEWING || next == com.jobportal.domain.ApplicationStatus.SHORTLISTED;
            default -> false;
        };
        if (!valid) {
            throw JobPortalException.badRequest(
                String.format("Invalid status transition from %s to %s.", current, next));
        }
    }

    // ── Private Helpers ─────────────────────────────────────────────────────

    private User findUserByEmail(String email) throws JobPortalException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("User not found."));
    }

    private JobApplication findApplicationById(Long id) throws JobPortalException {
        return applicationRepository.findByIdWithDetails(id)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Application not found with id: " + id));
    }

    private JobApplicationResponse toResponse(JobApplication app) {
        JobApplicationResponse dto = new JobApplicationResponse();
        dto.setId(app.getId());
        dto.setStatus(app.getStatus());
        dto.setCoverLetter(app.getCoverLetter());
        dto.setAppliedAt(app.getCreatedAt());
        dto.setUpdatedAt(app.getUpdatedAt());

        if (app.getJob() != null) {
            dto.setJobId(app.getJob().getId());
            dto.setJobTitle(app.getJob().getJobTitle());
            // Build location string from city/state/country
            String loc = buildLocation(app.getJob().getCity(), app.getJob().getState(), app.getJob().getCountry());
            dto.setJobLocation(loc);
            if (app.getJob().getWorkingMode() != null) {
                dto.setWorkMode(app.getJob().getWorkingMode().name());
            }
            dto.setMinimumSalary(app.getJob().getMinimumSalary());
            dto.setMaximumSalary(app.getJob().getMaximumSalary());
            if (app.getJob().getCompany() != null) {
                dto.setCompanyName(app.getJob().getCompany().getCompanyName());
                dto.setCompanyLogo(app.getJob().getCompany().getLogo());
            }
        }
        if (app.getApplicant() != null) {
            dto.setApplicantId(app.getApplicant().getId());
            dto.setApplicantName(app.getApplicant().getName());
            dto.setApplicantEmail(app.getApplicant().getEmail());
        }
        if (app.getResume() != null) {
            dto.setResumeUrl(app.getResume().getResumeUrl());
            dto.setResume(resumeService.toResponse(app.getResume()));
        }
        return dto;
    }

    /** Compose a human-readable location string from city, state, country parts. */
    private String buildLocation(String city, String state, String country) {
        StringBuilder sb = new StringBuilder();
        if (city    != null && !city.isBlank())    sb.append(city);
        if (state   != null && !state.isBlank())   { if (sb.length() > 0) sb.append(", "); sb.append(state); }
        if (country != null && !country.isBlank()) { if (sb.length() > 0) sb.append(", "); sb.append(country); }
        return sb.length() > 0 ? sb.toString() : null;
    }
}
