package com.jobportal.recruiter.interview.mapper;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Component;

import com.jobportal.entity.User;
import com.jobportal.recruiter.interview.dto.ScheduledInterviewResponse;
import com.jobportal.recruiter.interview.entity.ScheduledInterview;
import com.jobportal.recruiter.interview.enums.ScheduledInterviewStatus;

/**
 * Mapper for converting {@link ScheduledInterview} entities to response DTOs.
 */
@Component
public class ScheduledInterviewMapper {

    /**
     * Maps a {@link ScheduledInterview} entity to a full {@link ScheduledInterviewResponse}.
     *
     * @param si           the interview entity (must have candidate and recruiter loaded)
     * @param includeNotes whether to include internal recruiter notes (false for candidate view)
     */
    public ScheduledInterviewResponse toResponse(ScheduledInterview si, boolean includeNotes) {
        ScheduledInterviewResponse r = new ScheduledInterviewResponse();

        r.setId(si.getId());
        r.setStatus(si.getStatus());
        r.setStatusLabel(resolveStatusLabel(si.getStatus()));
        r.setInterviewRound(si.getInterviewRound());
        r.setInterviewMode(si.getInterviewMode());
        r.setInterviewerName(si.getInterviewerName());
        r.setMeetingPlatform(si.getMeetingPlatform());
        r.setMeetingLink(si.getMeetingLink());
        r.setScheduledAt(si.getScheduledAt());
        r.setEndsAt(si.getEndsAt());
        r.setDurationMinutes(computeDuration(si));
        r.setInviteSent(si.getInviteSent());
        r.setFeedback(si.getFeedback());
        r.setCandidateRating(si.getCandidateRating());
        r.setCreatedAt(si.getCreatedAt());
        r.setStatusUpdatedAt(si.getStatusUpdatedAt());
        r.setJoinable(isJoinable(si));

        if (includeNotes) {
            r.setInternalNotes(si.getInternalNotes());
        }

        // Candidate info
        User candidate = si.getCandidate();
        if (candidate != null) {
            r.setCandidateId(candidate.getId());
            r.setCandidateName(candidate.getName());
            r.setCandidateEmail(candidate.getEmail());
            if (candidate.getProfile() != null) {
                r.setCandidateProfileImage(candidate.getProfile().getProfileImage());
            }
        }

        // Job / Application info
        if (si.getApplication() != null) {
            r.setApplicationId(si.getApplication().getId());
            if (si.getApplication().getJob() != null) {
                r.setJobId(si.getApplication().getJob().getId());
                r.setJobTitle(si.getApplication().getJob().getJobTitle());
                if (si.getApplication().getJob().getCompany() != null) {
                    r.setCompanyName(si.getApplication().getJob().getCompany().getCompanyName());
                    r.setCompanyLogo(si.getApplication().getJob().getCompany().getLogo());
                }
            }
        }

        // Recruiter info
        if (si.getRecruiter() != null && si.getRecruiter().getUser() != null) {
            r.setRecruiterId(si.getRecruiter().getId());
            r.setRecruiterName(si.getRecruiter().getUser().getName());
        }

        return r;
    }

    /** Convenience overload with includeNotes = true (recruiter view). */
    public ScheduledInterviewResponse toResponse(ScheduledInterview si) {
        return toResponse(si, true);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private int computeDuration(ScheduledInterview si) {
        if (si.getDurationMinutes() != null) return si.getDurationMinutes();
        if (si.getScheduledAt() != null && si.getEndsAt() != null) {
            return (int) ChronoUnit.MINUTES.between(si.getScheduledAt(), si.getEndsAt());
        }
        return 60; // default 1-hour session
    }

    /**
     * An interview is joinable if:
     * - It has a meeting link
     * - Status is SCHEDULED, RESCHEDULED or IN_PROGRESS
     * - Current time is within 15 minutes before start or any time after start (before end)
     */
    private boolean isJoinable(ScheduledInterview si) {
        if (si.getMeetingLink() == null || si.getMeetingLink().isBlank()) return false;
        ScheduledInterviewStatus status = si.getStatus();
        if (status == ScheduledInterviewStatus.CANCELLED
                || status == ScheduledInterviewStatus.COMPLETED
                || status == ScheduledInterviewStatus.NO_SHOW) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime joinFrom = si.getScheduledAt() != null
                ? si.getScheduledAt().minusMinutes(15)
                : null;
        if (joinFrom == null) return false;
        LocalDateTime endAt = si.getEndsAt() != null ? si.getEndsAt() : si.getScheduledAt().plusHours(2);
        return now.isAfter(joinFrom) && now.isBefore(endAt);
    }

    private String resolveStatusLabel(ScheduledInterviewStatus status) {
        if (status == null) return "Unknown";
        return switch (status) {
            case SCHEDULED    -> "Scheduled";
            case IN_PROGRESS  -> "In Progress";
            case COMPLETED    -> "Completed";
            case CANCELLED    -> "Cancelled";
            case NO_SHOW      -> "No Show";
            case RESCHEDULED  -> "Rescheduled";
        };
    }
}
