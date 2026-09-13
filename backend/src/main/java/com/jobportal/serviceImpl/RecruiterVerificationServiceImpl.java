package com.jobportal.serviceImpl;

import java.time.LocalDateTime;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.RecruiterStatus;
import com.jobportal.dto.request.RecruiterVerificationRequest;
import com.jobportal.dto.response.RecruiterVerificationStatusResponse;
import com.jobportal.entity.Company;
import com.jobportal.entity.Recruiter;
import com.jobportal.event.RecruiterVerificationEvent;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.service.RecruiterVerificationService;

/**
 * Implements recruiter self-service verification operations.
 *
 * <h3>Resubmission state transitions</h3>
 * <pre>
 * PENDING_VERIFICATION + submit  -> PENDING_VERIFICATION (refreshes submittedAt)
 * REJECTED             + submit  -> PENDING_VERIFICATION  (clears reviewedAt, reviewedByUserId;
 *                                                          keeps rejectionReason for context)
 * APPROVED             + submit  -> 400 Bad Request
 * SUSPENDED            + submit  -> 403 Forbidden
 * </pre>
 *
 * <h3>Company persistence</h3>
 * <p>When the recruiter submits verification info containing company data
 * (companyName, companyWebsite, etc.), those fields are immediately persisted
 * to the {@code companies} table and linked to the recruiter. This ensures the
 * employer's Company Profile page is pre-filled after admin approval and the
 * recruiter is never asked to enter company details twice.</p>
 */
@Service
public class RecruiterVerificationServiceImpl implements RecruiterVerificationService {

    private final RecruiterRepository      recruiterRepository;
    private final CompanyRepository        companyRepository;
    private final ApplicationEventPublisher eventPublisher;

    public RecruiterVerificationServiceImpl(
            RecruiterRepository recruiterRepository,
            CompanyRepository companyRepository,
            ApplicationEventPublisher eventPublisher) {
        this.recruiterRepository = recruiterRepository;
        this.companyRepository   = companyRepository;
        this.eventPublisher      = eventPublisher;
    }

    // -- Status View -----------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public RecruiterVerificationStatusResponse getVerificationStatus(String email)
            throws JobPortalException {
        Recruiter recruiter = loadRecruiter(email);
        return buildStatusResponse(recruiter);
    }

    // -- Submit / Resubmit ----------------------------------------------------

    @Override
    @Transactional
    public RecruiterVerificationStatusResponse submitVerification(
            String email, RecruiterVerificationRequest request) throws JobPortalException {

        Recruiter recruiter = loadRecruiter(email);
        RecruiterStatus currentStatus = recruiter.getStatus();

        // Guard: approved recruiters don't need to resubmit
        if (currentStatus == RecruiterStatus.APPROVED) {
            throw JobPortalException.badRequest(
                "Your account is already approved. No verification submission is needed.");
        }

        // Guard: suspended recruiters are fully blocked
        if (currentStatus == RecruiterStatus.SUSPENDED) {
            throw JobPortalException.forbidden(
                "Your account is suspended. Please contact platform support.");
        }

        // Apply designation update from request
        if (request != null && request.getDesignation() != null
                && !request.getDesignation().isBlank()) {
            recruiter.setDesignation(request.getDesignation().trim());
        }

        // ---- CORE FIX: Persist company data to companies table ----------------
        // This ensures the company profile page is pre-filled after approval.
        if (request != null && request.getCompanyName() != null) {
            upsertCompanyFromVerification(recruiter, request);
        }
        // -----------------------------------------------------------------------

        // Set/refresh submission timestamp
        recruiter.setSubmittedAt(LocalDateTime.now());

        // If REJECTED, reset to PENDING and clear review state
        if (currentStatus == RecruiterStatus.REJECTED) {
            recruiter.setStatus(RecruiterStatus.PENDING_VERIFICATION);
            recruiter.setReviewedAt(null);
            recruiter.setReviewedByUserId(null);
            // rejectionReason intentionally preserved for context
        }

        Recruiter saved = recruiterRepository.save(recruiter);

        // Publish event: listener sends VERIFICATION_SUBMITTED notification
        eventPublisher.publishEvent(new RecruiterVerificationEvent(
                this,
                saved.getId(),
                saved.getUser().getId(),
                saved.getUser().getEmail(),
                saved.getUser().getName(),
                RecruiterStatus.PENDING_VERIFICATION,
                null
        ));

        return buildStatusResponse(saved);
    }

    // -- Private Helpers -------------------------------------------------------

    /**
     * Upserts the Company entity from the verification request fields.
     * If the recruiter already has a company linked, updates it in place.
     * If not, creates a new Company and links it to the recruiter.
     */
    private void upsertCompanyFromVerification(Recruiter recruiter, RecruiterVerificationRequest req) {
        Company company = recruiter.getCompany();
        boolean isNew = (company == null);
        if (isNew) {
            company = new Company();
        }

        // Only overwrite if value provided (non-null = was supplied in this submission)
        if (req.getCompanyName() != null) {
            company.setCompanyName(req.getCompanyName());
        }
        if (req.getCompanyWebsite() != null) {
            company.setWebsite(req.getCompanyWebsite());
        }
        if (req.getCompanyLocation() != null) {
            // companyLocation maps to headquarters on the Company entity
            company.setHeadquarters(req.getCompanyLocation());
        }
        if (req.getCompanyDescription() != null) {
            company.setDescription(req.getCompanyDescription());
        }
        if (req.getWorkEmail() != null) {
            company.setEmail(req.getWorkEmail());
        }

        Company saved = companyRepository.save(company);

        if (isNew) {
            recruiter.setCompany(saved);
            // recruiterRepository.save() is called by the caller after this method
        }
    }

    private Recruiter loadRecruiter(String email) throws JobPortalException {
        return recruiterRepository.findByUserEmail(email)
                .orElseThrow(() -> JobPortalException.notFound(
                        "Recruiter profile not found for: " + email));
    }

    /**
     * Converts a Recruiter entity to the self-service status response.
     * The canSubmit flag is true only for PENDING and REJECTED states.
     * Company fields are populated from the linked Company entity if present.
     */
    private RecruiterVerificationStatusResponse buildStatusResponse(Recruiter recruiter) {
        RecruiterStatus status = recruiter.getStatus();
        boolean canSubmit = (status == RecruiterStatus.PENDING_VERIFICATION
                          || status == RecruiterStatus.REJECTED);

        String message = switch (status) {
            case PENDING_VERIFICATION ->
                "Your account is pending admin verification. "
                + "You will be notified once the review is complete.";
            case APPROVED ->
                "Your recruiter account has been approved. You have full access.";
            case REJECTED ->
                "Your account verification was rejected. Please review the reason below, "
                + "update your information, and resubmit.";
            case SUSPENDED ->
                "Your recruiter account has been suspended. "
                + "Please contact platform support for assistance.";
        };

        RecruiterVerificationStatusResponse response = new RecruiterVerificationStatusResponse(
                status,
                message,
                recruiter.getSubmittedAt(),
                recruiter.getReviewedAt(),
                recruiter.getRejectionReason(),
                canSubmit
        );

        // Populate company fields so the dashboard can show submitted info
        response.setDesignation(recruiter.getDesignation());
        Company company = recruiter.getCompany();
        if (company != null) {
            response.setCompanyName(company.getCompanyName());
            response.setCompanyWebsite(company.getWebsite());
            response.setCompanyLocation(company.getHeadquarters());
            response.setCompanyDescription(company.getDescription());
        }

        return response;
    }
}