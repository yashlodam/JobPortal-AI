package com.jobportal.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.RecruiterStatus;
import com.jobportal.dto.request.AdminReviewRequest;
import com.jobportal.dto.response.RecruiterAdminSummaryResponse;
import com.jobportal.dto.response.RecruiterVerificationStatusResponse;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.event.RecruiterVerificationEvent;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.AdminRecruiterService;

/**
 * Admin recruiter management service implementation.
 *
 * <h3>Status transition rules enforced here</h3>
 * <ul>
 *   <li>Approve: from PENDING_VERIFICATION only → APPROVED. Clears rejection reason.</li>
 *   <li>Reject:  from PENDING_VERIFICATION only → REJECTED. Reason is required.</li>
 *   <li>Suspend: from ANY status → SUSPENDED. Reason is required.
 *       Closes all recruiter's OPEN jobs atomically in one UPDATE.</li>
 * </ul>
 *
 * <h3>Audit trail</h3>
 * Every decision is recorded in the {@link Recruiter} entity:
 * {@code reviewedAt}, {@code reviewedByUserId}, {@code rejectionReason}.
 *
 * <h3>Notifications</h3>
 * Publishes {@link RecruiterVerificationEvent} after each decision.
 * {@link com.jobportal.listener.NotificationEventListener#onRecruiterVerificationChanged}
 * handles the event and sends the appropriate in-app notification AFTER commit.
 */
@Service
public class AdminRecruiterServiceImpl implements AdminRecruiterService {

    private static final Logger log = LoggerFactory.getLogger(AdminRecruiterServiceImpl.class);

    private final RecruiterRepository      recruiterRepository;
    private final UserRepository           userRepository;
    private final JobRepository            jobRepository;
    private final ApplicationEventPublisher eventPublisher;

    public AdminRecruiterServiceImpl(
            RecruiterRepository recruiterRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationEventPublisher eventPublisher) {
        this.recruiterRepository = recruiterRepository;
        this.userRepository      = userRepository;
        this.jobRepository       = jobRepository;
        this.eventPublisher      = eventPublisher;
    }

    // ── List ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<RecruiterAdminSummaryResponse> listRecruiters(
            RecruiterStatus status, Pageable pageable) throws JobPortalException {
        Page<Recruiter> page = (status != null)
                ? recruiterRepository.findByStatus(status, pageable)
                : recruiterRepository.findAll(pageable);
        return page.map(this::toSummary);
    }

    // ── Detail ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public RecruiterVerificationStatusResponse getRecruiterDetail(Long recruiterId)
            throws JobPortalException {
        Recruiter recruiter = loadWithDetails(recruiterId);
        return buildDetailResponse(recruiter);
    }

    // ── Approve ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RecruiterAdminSummaryResponse approveRecruiter(
            Long recruiterId, String adminEmail, AdminReviewRequest request)
            throws JobPortalException {

        Recruiter recruiter = loadWithDetails(recruiterId);

        if (recruiter.getStatus() == RecruiterStatus.APPROVED) {
            throw JobPortalException.badRequest("Recruiter is already approved.");
        }

        Long adminUserId = resolveAdminUserId(adminEmail);

        // ── Transition ────────────────────────────────────────────────────────
        recruiter.setStatus(RecruiterStatus.APPROVED);
        recruiter.setReviewedAt(LocalDateTime.now());
        recruiter.setReviewedByUserId(adminUserId);
        recruiter.setRejectionReason(null);   // clear any previous rejection

        Recruiter saved = recruiterRepository.save(recruiter);

        log.info("[AdminRecruiterService] Recruiter id=[{}] APPROVED by admin=[{}]",
                recruiterId, adminEmail);

        // ── Publish event (scalars captured while session is open) ────────────
        publishEvent(saved, RecruiterStatus.APPROVED, null);

        return toSummary(saved);
    }

    // ── Reject ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RecruiterAdminSummaryResponse rejectRecruiter(
            Long recruiterId, String adminEmail, AdminReviewRequest request)
            throws JobPortalException {

        validateReason(request, "Rejection reason is required so the recruiter knows what to fix.");

        Recruiter recruiter = loadWithDetails(recruiterId);

        if (recruiter.getStatus() != RecruiterStatus.PENDING_VERIFICATION) {
            throw JobPortalException.badRequest(
                "Only PENDING_VERIFICATION recruiters can be rejected. "
                + "Current status: " + recruiter.getStatus());
        }

        Long adminUserId = resolveAdminUserId(adminEmail);

        // ── Transition ────────────────────────────────────────────────────────
        recruiter.setStatus(RecruiterStatus.REJECTED);
        recruiter.setReviewedAt(LocalDateTime.now());
        recruiter.setReviewedByUserId(adminUserId);
        recruiter.setRejectionReason(request.getReason().trim());

        Recruiter saved = recruiterRepository.save(recruiter);

        log.info("[AdminRecruiterService] Recruiter id=[{}] REJECTED by admin=[{}]. Reason: {}",
                recruiterId, adminEmail, request.getReason());

        // ── Publish event ─────────────────────────────────────────────────────
        publishEvent(saved, RecruiterStatus.REJECTED, request.getReason().trim());

        return toSummary(saved);
    }

    // ── Suspend ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RecruiterAdminSummaryResponse suspendRecruiter(
            Long recruiterId, String adminEmail, AdminReviewRequest request)
            throws JobPortalException {

        validateReason(request, "Suspension reason is required for the audit trail.");

        Recruiter recruiter = loadWithDetails(recruiterId);
        Long adminUserId = resolveAdminUserId(adminEmail);

        // ── Close all open jobs atomically before changing status ─────────────
        int closedJobs = jobRepository.closeAllOpenJobsByRecruiterId(recruiterId);
        if (closedJobs > 0) {
            log.info("[AdminRecruiterService] Closed {} open job(s) for suspended recruiter id=[{}]",
                    closedJobs, recruiterId);
        }

        // ── Transition ────────────────────────────────────────────────────────
        recruiter.setStatus(RecruiterStatus.SUSPENDED);
        recruiter.setReviewedAt(LocalDateTime.now());
        recruiter.setReviewedByUserId(adminUserId);
        recruiter.setRejectionReason(request.getReason().trim());

        Recruiter saved = recruiterRepository.save(recruiter);

        log.info("[AdminRecruiterService] Recruiter id=[{}] SUSPENDED by admin=[{}]. Reason: {}",
                recruiterId, adminEmail, request.getReason());

        // ── Publish event ─────────────────────────────────────────────────────
        publishEvent(saved, RecruiterStatus.SUSPENDED, request.getReason().trim());

        return toSummary(saved);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private Recruiter loadWithDetails(Long recruiterId) throws JobPortalException {
        return recruiterRepository.findByIdWithDetails(recruiterId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Recruiter not found with id: " + recruiterId));
    }

    private Long resolveAdminUserId(String adminEmail) throws JobPortalException {
        return userRepository.findByEmail(adminEmail)
                .map(User::getId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Admin user not found: " + adminEmail));
    }

    private void validateReason(AdminReviewRequest request, String errorMessage)
            throws JobPortalException {
        if (request == null
                || request.getReason() == null
                || request.getReason().isBlank()) {
            throw JobPortalException.badRequest(errorMessage);
        }
    }

    /**
     * Publishes {@link RecruiterVerificationEvent} with all scalar fields captured
     * from the loaded entity. Safe to call after the entity is saved but while
     * the current transaction is still open.
     */
    private void publishEvent(Recruiter recruiter, RecruiterStatus status, String reason) {
        eventPublisher.publishEvent(new RecruiterVerificationEvent(
                this,
                recruiter.getId(),
                recruiter.getUser().getId(),
                recruiter.getUser().getEmail(),
                recruiter.getUser().getName(),
                status,
                reason
        ));
    }

    // ── Response Mappers ──────────────────────────────────────────────────────

    private RecruiterAdminSummaryResponse toSummary(Recruiter r) {
        RecruiterAdminSummaryResponse dto = new RecruiterAdminSummaryResponse();
        dto.setRecruiterId(r.getId());

        if (r.getUser() != null) {
            dto.setUserId(r.getUser().getId());
            dto.setRecruiterName(r.getUser().getName());
            dto.setRecruiterEmail(r.getUser().getEmail());
        }

        dto.setDesignation(r.getDesignation());

        if (r.getCompany() != null) {
            dto.setCompanyName(r.getCompany().getCompanyName());
            dto.setCompanyWebsite(r.getCompany().getWebsite());
        }

        dto.setStatus(r.getStatus());
        dto.setSubmittedAt(r.getSubmittedAt());
        dto.setReviewedAt(r.getReviewedAt());
        dto.setRejectionReason(r.getRejectionReason());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }

    private RecruiterVerificationStatusResponse buildDetailResponse(Recruiter r) {
        RecruiterStatus status = r.getStatus();
        boolean canSubmit = (status == RecruiterStatus.PENDING_VERIFICATION
                          || status == RecruiterStatus.REJECTED);
        // Admin-facing detail: include the same structure as self-service status
        return new RecruiterVerificationStatusResponse(
                status,
                "Admin view for recruiter: " + (r.getUser() != null ? r.getUser().getEmail() : r.getId()),
                r.getSubmittedAt(),
                r.getReviewedAt(),
                r.getRejectionReason(),
                canSubmit
        );
    }
}
