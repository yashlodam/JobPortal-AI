package com.jobportal.recruiter.interview.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.ApplicationStatus;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.recruiter.interview.dto.InterviewFeedbackRequest;
import com.jobportal.recruiter.interview.dto.InterviewStatsResponse;
import com.jobportal.recruiter.interview.dto.ScheduleInterviewRequest;
import com.jobportal.recruiter.interview.dto.ScheduledInterviewResponse;
import com.jobportal.recruiter.interview.dto.UpdateInterviewRequest;
import com.jobportal.recruiter.interview.entity.ScheduledInterview;
import com.jobportal.recruiter.interview.enums.ScheduledInterviewStatus;
import com.jobportal.recruiter.interview.mapper.ScheduledInterviewMapper;
import com.jobportal.recruiter.interview.repository.ScheduledInterviewRepository;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.UserRepository;

/**
 * Service for recruiter interview scheduling and management.
 *
 * <h3>Security Model</h3>
 * <ul>
 *   <li>All recruiter-write operations are scoped to the authenticated recruiter.</li>
 *   <li>Only the owning recruiter can update or cancel an interview.</li>
 *   <li>Candidates can only read their own interviews (no internal notes exposed).</li>
 * </ul>
 *
 * <h3>Application Status Sync</h3>
 * When an interview is scheduled, the linked application status is automatically
 * updated to {@code INTERVIEWING} (if currently APPLIED, REVIEWING, or SHORTLISTED).
 */
@Service
@Transactional
public class ScheduledInterviewService {

    private static final Logger log = LoggerFactory.getLogger(ScheduledInterviewService.class);

    private final ScheduledInterviewRepository interviewRepository;
    private final JobApplicationRepository     applicationRepository;
    private final RecruiterRepository          recruiterRepository;
    private final UserRepository               userRepository;
    private final ScheduledInterviewMapper     mapper;
    private final com.jobportal.service.RecruiterAuthorizationService recruiterAuthorizationService;

    public ScheduledInterviewService(
            ScheduledInterviewRepository interviewRepository,
            JobApplicationRepository applicationRepository,
            RecruiterRepository recruiterRepository,
            UserRepository userRepository,
            ScheduledInterviewMapper mapper,
            com.jobportal.service.RecruiterAuthorizationService recruiterAuthorizationService) {
        this.interviewRepository   = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.recruiterRepository   = recruiterRepository;
        this.userRepository        = userRepository;
        this.mapper                = mapper;
        this.recruiterAuthorizationService = recruiterAuthorizationService;
    }

    // ── Recruiter Operations ──────────────────────────────────────────────────

    /**
     * Schedule a new interview for a candidate application.
     *
     * @param recruiterEmail authenticated recruiter's email
     * @param request        schedule details
     */
    public ScheduledInterviewResponse scheduleInterview(
            String recruiterEmail, ScheduleInterviewRequest request) {

        Recruiter recruiter = resolveRecruiter(recruiterEmail);

        JobApplication application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> JobPortalException.notFound(
                        "Application not found: " + request.getApplicationId()));

        // Authorization: application must belong to a job posted by this recruiter
        if (!application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw JobPortalException.forbidden(
                    "You are not authorized to schedule interviews for this application.");
        }

        ScheduledInterview interview = new ScheduledInterview();
        interview.setRecruiter(recruiter);
        interview.setCandidate(application.getApplicant());
        interview.setApplication(application);
        interview.setInterviewMode(request.getInterviewMode());
        interview.setInterviewRound(request.getInterviewRound());
        interview.setInterviewerName(request.getInterviewerName());
        interview.setMeetingPlatform(request.getMeetingPlatform());
        interview.setMeetingLink(request.getMeetingLink());
        interview.setScheduledAt(request.getScheduledAt());
        interview.setEndsAt(resolveEndsAt(request));
        interview.setDurationMinutes(resolveDurationMinutes(request));
        interview.setInternalNotes(request.getInternalNotes());
        interview.setStatus(ScheduledInterviewStatus.SCHEDULED);
        interview.setInviteSent(false);
        interview.setStatusUpdatedAt(LocalDateTime.now());

        ScheduledInterview saved = interviewRepository.save(interview);

        // Auto-progress application status to INTERVIEWING
        autoProgressApplicationStatus(application);

        log.info("Interview scheduled: id=[{}] for application=[{}] by recruiter=[{}]",
                saved.getId(), request.getApplicationId(), recruiterEmail);

        return mapper.toResponse(saved);
    }

    /**
     * List all interviews for the authenticated recruiter with optional status filter.
     *
     * @param statusFilter one of: "upcoming", "completed", "cancelled", "today", or null/empty for all
     */
    @Transactional(readOnly = true)
    public List<ScheduledInterviewResponse> getInterviewsForRecruiter(
            String recruiterEmail, String statusFilter) {

        Recruiter recruiter = resolveRecruiter(recruiterEmail);
        List<ScheduledInterview> interviews;
        LocalDateTime now = LocalDateTime.now();

        if ("upcoming".equalsIgnoreCase(statusFilter)) {
            interviews = interviewRepository.findUpcomingByRecruiterId(recruiter.getId(), now);
        } else if ("completed".equalsIgnoreCase(statusFilter)) {
            interviews = interviewRepository.findByRecruiterIdAndStatus(
                    recruiter.getId(), ScheduledInterviewStatus.COMPLETED);
        } else if ("cancelled".equalsIgnoreCase(statusFilter)) {
            interviews = interviewRepository.findByRecruiterIdAndStatus(
                    recruiter.getId(), ScheduledInterviewStatus.CANCELLED);
        } else if ("today".equalsIgnoreCase(statusFilter)) {
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            LocalDateTime endOfDay   = startOfDay.plusDays(1).minusNanos(1);
            interviews = interviewRepository.findTodaysByRecruiterId(
                    recruiter.getId(), startOfDay, endOfDay);
        } else {
            interviews = interviewRepository.findAllByRecruiterId(recruiter.getId());
        }

        return interviews.stream().map(mapper::toResponse).toList();
    }

    /**
     * Get a single interview by ID — recruiter must own it.
     */
    @Transactional(readOnly = true)
    public ScheduledInterviewResponse getInterview(String recruiterEmail, Long interviewId) {
        Recruiter recruiter = resolveRecruiter(recruiterEmail);
        ScheduledInterview interview = findAndAuthorize(interviewId, recruiter.getId());
        return mapper.toResponse(interview);
    }

    /**
     * Update/reschedule interview details.
     * Not allowed when status = COMPLETED, CANCELLED, or NO_SHOW.
     */
    public ScheduledInterviewResponse updateInterview(
            String recruiterEmail, Long interviewId, UpdateInterviewRequest request) {

        Recruiter recruiter = resolveRecruiter(recruiterEmail);
        ScheduledInterview interview = findAndAuthorize(interviewId, recruiter.getId());

        if (interview.getStatus() == ScheduledInterviewStatus.COMPLETED
                || interview.getStatus() == ScheduledInterviewStatus.CANCELLED
                || interview.getStatus() == ScheduledInterviewStatus.NO_SHOW) {
            throw JobPortalException.badRequest(
                    "Cannot update a " + interview.getStatus() + " interview.");
        }

        boolean wasRescheduled = false;

        if (request.getInterviewRound()  != null) interview.setInterviewRound(request.getInterviewRound());
        if (request.getInterviewMode()   != null) interview.setInterviewMode(request.getInterviewMode());
        if (request.getInterviewerName() != null) interview.setInterviewerName(request.getInterviewerName());
        if (request.getMeetingPlatform() != null) interview.setMeetingPlatform(request.getMeetingPlatform());
        if (request.getMeetingLink()     != null) interview.setMeetingLink(request.getMeetingLink());
        if (request.getInternalNotes()   != null) interview.setInternalNotes(request.getInternalNotes());

        if (request.getScheduledAt() != null) {
            interview.setScheduledAt(request.getScheduledAt());
            wasRescheduled = true;
        }
        if (request.getEndsAt() != null) {
            interview.setEndsAt(request.getEndsAt());
        }
        if (request.getDurationMinutes() != null) {
            interview.setDurationMinutes(request.getDurationMinutes());
        }

        // Recompute endsAt from new scheduledAt + duration if endsAt not explicitly provided
        if (wasRescheduled && request.getEndsAt() == null && request.getDurationMinutes() != null) {
            interview.setEndsAt(request.getScheduledAt().plusMinutes(request.getDurationMinutes()));
        }

        if (wasRescheduled) {
            interview.setStatus(ScheduledInterviewStatus.RESCHEDULED);
            interview.setInviteSent(false);
            interview.setStatusUpdatedAt(LocalDateTime.now());
        }

        ScheduledInterview saved = interviewRepository.save(interview);
        log.info("Interview [{}] updated by recruiter=[{}]", interviewId, recruiterEmail);
        return mapper.toResponse(saved);
    }

    /**
     * Change the lifecycle status of an interview.
     */
    public ScheduledInterviewResponse updateStatus(
            String recruiterEmail, Long interviewId, String newStatusStr) {

        Recruiter recruiter = resolveRecruiter(recruiterEmail);
        ScheduledInterview interview = findAndAuthorize(interviewId, recruiter.getId());

        ScheduledInterviewStatus newStatus;
        try {
            newStatus = ScheduledInterviewStatus.valueOf(newStatusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw JobPortalException.badRequest("Invalid status: " + newStatusStr
                    + ". Valid values: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED");
        }

        validateStatusTransition(interview.getStatus(), newStatus);

        interview.setStatus(newStatus);
        interview.setStatusUpdatedAt(LocalDateTime.now());

        ScheduledInterview saved = interviewRepository.save(interview);
        log.info("Interview [{}] status → {} by recruiter=[{}]", interviewId, newStatus, recruiterEmail);
        return mapper.toResponse(saved);
    }

    /**
     * Submit post-interview feedback and rating. Automatically marks interview as COMPLETED.
     */
    public ScheduledInterviewResponse submitFeedback(
            String recruiterEmail, Long interviewId, InterviewFeedbackRequest request) {

        Recruiter recruiter = resolveRecruiter(recruiterEmail);
        ScheduledInterview interview = findAndAuthorize(interviewId, recruiter.getId());

        if (interview.getStatus() == ScheduledInterviewStatus.CANCELLED) {
            throw JobPortalException.badRequest("Cannot add feedback to a cancelled interview.");
        }

        if (request.getFeedback()        != null) interview.setFeedback(request.getFeedback());
        if (request.getCandidateRating() != null) interview.setCandidateRating(request.getCandidateRating());

        // Auto-complete when feedback submitted
        if (interview.getStatus() != ScheduledInterviewStatus.COMPLETED) {
            interview.setStatus(ScheduledInterviewStatus.COMPLETED);
            interview.setStatusUpdatedAt(LocalDateTime.now());
        }

        ScheduledInterview saved = interviewRepository.save(interview);
        log.info("Feedback submitted for interview=[{}] by recruiter=[{}]", interviewId, recruiterEmail);
        return mapper.toResponse(saved);
    }

    /**
     * Cancel an interview. Sets status to CANCELLED.
     */
    public ScheduledInterviewResponse cancelInterview(String recruiterEmail, Long interviewId) {
        Recruiter recruiter = resolveRecruiter(recruiterEmail);
        ScheduledInterview interview = findAndAuthorize(interviewId, recruiter.getId());

        if (interview.getStatus() == ScheduledInterviewStatus.COMPLETED
                || interview.getStatus() == ScheduledInterviewStatus.CANCELLED) {
            throw JobPortalException.badRequest(
                    "Interview is already " + interview.getStatus() + ".");
        }

        interview.setStatus(ScheduledInterviewStatus.CANCELLED);
        interview.setStatusUpdatedAt(LocalDateTime.now());

        ScheduledInterview saved = interviewRepository.save(interview);
        log.info("Interview [{}] cancelled by recruiter=[{}]", interviewId, recruiterEmail);
        return mapper.toResponse(saved);
    }

    /**
     * Get all interviews linked to a specific job application.
     */
    @Transactional(readOnly = true)
    public List<ScheduledInterviewResponse> getInterviewsByApplication(
            String recruiterEmail, Long applicationId) {
        resolveRecruiter(recruiterEmail);
        return interviewRepository.findByApplicationId(applicationId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Dashboard stats for the recruiter interview management header.
     */
    @Transactional(readOnly = true)
    public InterviewStatsResponse getStats(String recruiterEmail) {
        Recruiter recruiter = resolveRecruiter(recruiterEmail);
        Long rid = recruiter.getId();
        LocalDateTime now        = LocalDateTime.now();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1).minusNanos(1);

        long total     = interviewRepository.countByRecruiterId(rid);
        long upcoming  = interviewRepository.countUpcomingByRecruiterId(rid, now);
        long today     = interviewRepository.findTodaysByRecruiterId(rid, startOfDay, endOfDay).size();
        long completed = interviewRepository.countByRecruiterIdAndStatus(rid, ScheduledInterviewStatus.COMPLETED);
        long cancelled = interviewRepository.countByRecruiterIdAndStatus(rid, ScheduledInterviewStatus.CANCELLED);
        long noShow    = interviewRepository.countByRecruiterIdAndStatus(rid, ScheduledInterviewStatus.NO_SHOW);

        return new InterviewStatsResponse(total, upcoming, today, completed, cancelled, noShow);
    }

    // ── Candidate Operations ──────────────────────────────────────────────────

    /**
     * Get all interviews for the authenticated candidate (read-only, internal notes excluded).
     */
    @Transactional(readOnly = true)
    public List<ScheduledInterviewResponse> getInterviewsForCandidate(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> JobPortalException.notFound("User not found: " + candidateEmail));

        return interviewRepository.findByCandidateId(candidate.getId()).stream()
                .map(si -> mapper.toResponse(si, false)) // excludes internal notes
                .toList();
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private Recruiter resolveRecruiter(String email) {
        return recruiterAuthorizationService.requireApprovedRecruiter(email);
    }

    private ScheduledInterview findAndAuthorize(Long interviewId, Long recruiterId) {
        ScheduledInterview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Interview not found: " + interviewId));
        if (!interview.getRecruiter().getId().equals(recruiterId)) {
            throw JobPortalException.forbidden(
                    "You are not authorized to access this interview.");
        }
        return interview;
    }

    private void autoProgressApplicationStatus(JobApplication application) {
        ApplicationStatus current = application.getStatus();
        if (current == ApplicationStatus.APPLIED
                || current == ApplicationStatus.REVIEWING
                || current == ApplicationStatus.SHORTLISTED) {
            application.setStatus(ApplicationStatus.INTERVIEWING);
            applicationRepository.save(application);
            log.info("Application [{}] auto-updated to INTERVIEWING", application.getId());
        }
    }

    private LocalDateTime resolveEndsAt(ScheduleInterviewRequest request) {
        if (request.getEndsAt() != null) return request.getEndsAt();
        if (request.getDurationMinutes() != null && request.getScheduledAt() != null) {
            return request.getScheduledAt().plusMinutes(request.getDurationMinutes());
        }
        return request.getScheduledAt() != null ? request.getScheduledAt().plusHours(1) : null;
    }

    private Integer resolveDurationMinutes(ScheduleInterviewRequest request) {
        if (request.getDurationMinutes() != null) return request.getDurationMinutes();
        if (request.getScheduledAt() != null && request.getEndsAt() != null) {
            return (int) ChronoUnit.MINUTES.between(request.getScheduledAt(), request.getEndsAt());
        }
        return 60;
    }

    private void validateStatusTransition(
            ScheduledInterviewStatus current, ScheduledInterviewStatus next) {
        if (current == ScheduledInterviewStatus.COMPLETED && next != ScheduledInterviewStatus.COMPLETED) {
            throw JobPortalException.badRequest("Cannot change status of a COMPLETED interview.");
        }
        if (current == ScheduledInterviewStatus.CANCELLED && next != ScheduledInterviewStatus.CANCELLED) {
            throw JobPortalException.badRequest("Cannot reactivate a CANCELLED interview.");
        }
    }
}
