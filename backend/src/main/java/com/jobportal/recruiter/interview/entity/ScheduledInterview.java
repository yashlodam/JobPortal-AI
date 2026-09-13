package com.jobportal.recruiter.interview.entity;

import java.time.LocalDateTime;

import com.jobportal.entity.Auditable;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.recruiter.interview.enums.InterviewMode;
import com.jobportal.recruiter.interview.enums.InterviewRound;
import com.jobportal.recruiter.interview.enums.ScheduledInterviewStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * A recruiter-scheduled interview for a specific candidate and job application.
 *
 * <p>Completely separate from the {@code interview_sessions} table which is used
 * for AI mock interviews (candidate-facing). This entity lives in
 * {@code scheduled_interviews} table and is recruiter-owned.
 *
 * <h3>Relationships</h3>
 * <ul>
 *   <li>{@code recruiter}   — the recruiter who scheduled this interview</li>
 *   <li>{@code candidate}   — the applicant being interviewed</li>
 *   <li>{@code application} — the job application this interview is tied to (nullable
 *       to allow ad-hoc interviews without a formal application)</li>
 * </ul>
 */
@Entity
@Table(
    name = "scheduled_interviews",
    indexes = {
        @Index(name = "idx_si_recruiter",    columnList = "recruiter_id"),
        @Index(name = "idx_si_candidate",    columnList = "candidate_id"),
        @Index(name = "idx_si_application",  columnList = "application_id"),
        @Index(name = "idx_si_status",       columnList = "status"),
        @Index(name = "idx_si_scheduled_at", columnList = "scheduled_at")
    }
)
public class ScheduledInterview extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Ownership & Participants ──────────────────────────────────────────────

    /** Recruiter who created and owns this interview. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private Recruiter recruiter;

    /** The candidate (User) being interviewed. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    /**
     * The job application this interview belongs to.
     * Nullable to allow scheduling without a formal application (e.g. sourced candidates).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private JobApplication application;

    // ── Interview Details ─────────────────────────────────────────────────────

    /** Name/email of the person conducting the interview (internal interviewer). */
    @Column(name = "interviewer_name", length = 200)
    private String interviewerName;

    /** Type of round: SCREENING, TECHNICAL, HR, FINAL, etc. */
    @Enumerated(EnumType.STRING)
    @Column(name = "interview_round", length = 30)
    private InterviewRound interviewRound = InterviewRound.SCREENING;

    /** Format: VIDEO_CALL, PHONE, IN_PERSON, etc. */
    @Enumerated(EnumType.STRING)
    @Column(name = "interview_mode", length = 30, nullable = false)
    private InterviewMode interviewMode = InterviewMode.VIDEO_CALL;

    /** Meeting platform display label: e.g. "Google Meet", "Zoom", "MS Teams". */
    @Column(name = "meeting_platform", length = 100)
    private String meetingPlatform;

    /** Full meeting join URL: https://meet.google.com/xxx or Zoom link. */
    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    /** When the interview is scheduled to start. */
    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    /** When the interview is expected to end. */
    @Column(name = "ends_at")
    private LocalDateTime endsAt;

    /** Duration in minutes (derived from scheduled_at → ends_at, stored for quick reads). */
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    /** Current lifecycle status. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduledInterviewStatus status = ScheduledInterviewStatus.SCHEDULED;

    // ── Feedback & Notes ─────────────────────────────────────────────────────

    /** Internal notes visible only to the recruiter team. */
    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    /**
     * Post-interview feedback / result (e.g. "Strong candidate. Recommend for final round.").
     * Filled after status → COMPLETED.
     */
    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    /**
     * Overall candidate rating after the interview (1–5 scale).
     * Null until interview is completed.
     */
    @Column(name = "candidate_rating")
    private Integer candidateRating;

    /** Whether a calendar invite was sent to the candidate. */
    @Column(name = "invite_sent", nullable = false)
    private Boolean inviteSent = false;

    /** When the status was last updated. */
    @Column(name = "status_updated_at")
    private LocalDateTime statusUpdatedAt;

    public ScheduledInterview() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Recruiter getRecruiter() { return recruiter; }
    public void setRecruiter(Recruiter recruiter) { this.recruiter = recruiter; }

    public User getCandidate() { return candidate; }
    public void setCandidate(User candidate) { this.candidate = candidate; }

    public JobApplication getApplication() { return application; }
    public void setApplication(JobApplication application) { this.application = application; }

    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }

    public InterviewRound getInterviewRound() { return interviewRound; }
    public void setInterviewRound(InterviewRound interviewRound) { this.interviewRound = interviewRound; }

    public InterviewMode getInterviewMode() { return interviewMode; }
    public void setInterviewMode(InterviewMode interviewMode) { this.interviewMode = interviewMode; }

    public String getMeetingPlatform() { return meetingPlatform; }
    public void setMeetingPlatform(String meetingPlatform) { this.meetingPlatform = meetingPlatform; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public LocalDateTime getEndsAt() { return endsAt; }
    public void setEndsAt(LocalDateTime endsAt) { this.endsAt = endsAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public ScheduledInterviewStatus getStatus() { return status; }
    public void setStatus(ScheduledInterviewStatus status) { this.status = status; }

    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Integer getCandidateRating() { return candidateRating; }
    public void setCandidateRating(Integer candidateRating) { this.candidateRating = candidateRating; }

    public Boolean getInviteSent() { return inviteSent; }
    public void setInviteSent(Boolean inviteSent) { this.inviteSent = inviteSent; }

    public LocalDateTime getStatusUpdatedAt() { return statusUpdatedAt; }
    public void setStatusUpdatedAt(LocalDateTime statusUpdatedAt) { this.statusUpdatedAt = statusUpdatedAt; }
}
