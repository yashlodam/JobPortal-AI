package com.jobportal.entity;

import java.time.LocalDateTime;

import com.jobportal.domain.RecruiterStatus;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Recruiter profile — linked 1:1 to a {@link User} with {@code accountType = EMPLOYER}.
 *
 * <h3>Verification Lifecycle</h3>
 * <ul>
 *   <li>On registration: {@code status = PENDING_VERIFICATION}.</li>
 *   <li>After admin approval: {@code status = APPROVED}.</li>
 *   <li>After admin rejection: {@code status = REJECTED}; recruiter may resubmit.</li>
 *   <li>After resubmission: {@code status = PENDING_VERIFICATION}; previous review fields cleared.</li>
 *   <li>After suspension: {@code status = SUSPENDED}; all active jobs set to CLOSED.</li>
 * </ul>
 *
 * <h3>Audit Fields</h3>
 * <ul>
 *   <li>{@code submittedAt}      — when recruiter submitted verification info.</li>
 *   <li>{@code reviewedAt}       — when admin completed the review decision.</li>
 *   <li>{@code reviewedByUserId} — scalar admin user ID (not a FK — safe from cascade deletes).</li>
 *   <li>{@code rejectionReason}  — admin-provided reason for rejection or suspension.</li>
 * </ul>
 */
@Entity
@Table(
    name = "recruiters",
    indexes = {
        @Index(name = "idx_recruiter_status", columnList = "status"),
        @Index(name = "idx_recruiter_user",   columnList = "user_id")
    }
)
public class Recruiter extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    private String designation;

    // ── Verification Status ───────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RecruiterStatus status = RecruiterStatus.PENDING_VERIFICATION;

    // ── Verification Audit Trail ──────────────────────────────────────────────

    /**
     * When the recruiter submitted (or last resubmitted) their verification
     * information. Null until the recruiter triggers a submission.
     */
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    /**
     * When an admin completed their review (approve / reject / suspend).
     * Null until a decision is made. Cleared to null on resubmission so
     * the admin sees a fresh record with no stale review date.
     */
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    /**
     * Scalar ID of the admin {@link User} who made the last review decision.
     * Stored as a plain Long (not a JPA foreign key) so that deleting an admin
     * account does not cascade to or nullify recruiter audit records.
     * Cleared to null on resubmission.
     */
    @Column(name = "reviewed_by_user_id")
    private Long reviewedByUserId;

    /**
     * Admin-supplied reason for rejection or suspension.
     * Shown to the recruiter so they know what to correct before resubmitting.
     * Preserved across resubmissions (kept for the recruiter to see history).
     * Cleared only when the status transitions to APPROVED.
     */
    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    public Recruiter() {}

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public RecruiterStatus getStatus() { return status; }
    public void setStatus(RecruiterStatus status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public Long getReviewedByUserId() { return reviewedByUserId; }
    public void setReviewedByUserId(Long reviewedByUserId) { this.reviewedByUserId = reviewedByUserId; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}