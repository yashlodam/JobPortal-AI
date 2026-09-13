package com.jobportal.serviceImpl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.AccountType;
import com.jobportal.domain.RecruiterStatus;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.RecruiterAuthorizationService;

/**
 * Implements the recruiter status authorization policy.
 *
 * <h3>Status → access mapping</h3>
 * <pre>
 * PENDING_VERIFICATION:
 *   ✅ View own profile, status, rejection reason
 *   ✅ Create/update/delete own company profile (needed to fill verification data)
 *   ✅ Continue EXISTING conversations they are a member of
 *   ❌ Create jobs
 *   ❌ View candidate applications
 *   ❌ Update application status
 *   ❌ Initiate new conversations
 *
 * APPROVED:
 *   ✅ All recruiter functionality
 *
 * REJECTED:
 *   ✅ View own status and rejection reason
 *   ✅ Update company profile (to fix rejection reason)
 *   ✅ Resubmit verification
 *   ✅ Continue existing conversations
 *   ❌ Create/update/delete jobs
 *   ❌ View applications, update status
 *   ❌ Initiate new conversations
 *
 * SUSPENDED:
 *   ✅ View own status
 *   ❌ Everything else
 *   ❌ All chat (no read-only carve-out in this implementation)
 * </pre>
 *
 * <p>All methods load the recruiter by email (from JWT subject) using a
 * JOIN FETCH with the User to avoid a second round-trip to the DB.</p>
 */
@Service
@Transactional
public class RecruiterAuthorizationServiceImpl implements RecruiterAuthorizationService {

    private final RecruiterRepository recruiterRepository;
    private final UserRepository      userRepository;

    public RecruiterAuthorizationServiceImpl(RecruiterRepository recruiterRepository) {
        this(recruiterRepository, null);
    }

    @Autowired
    public RecruiterAuthorizationServiceImpl(
            RecruiterRepository recruiterRepository,
            @Autowired(required = false) UserRepository userRepository) {
        this.recruiterRepository = recruiterRepository;
        this.userRepository      = userRepository;
    }

    // ── Interface Implementation ──────────────────────────────────────────────

    @Override
    public Recruiter requireApprovedRecruiter(String email) throws JobPortalException {
        Recruiter recruiter = loadRecruiterByEmail(email);
        enforceApproved(recruiter);
        return recruiter;
    }

    @Override
    public Recruiter requireApprovedOrPendingRecruiter(String email) throws JobPortalException {
        Recruiter recruiter = loadRecruiterByEmail(email);
        enforceApprovedOrPending(recruiter);
        return recruiter;
    }

    @Override
    public Recruiter getRecruiter(String email) throws JobPortalException {
        return loadRecruiterByEmail(email);
    }

    @Override
    public void requireCanInitiateConversation(String email) throws JobPortalException {
        Recruiter recruiter = loadRecruiterByEmail(email);
        enforceApproved(recruiter);
    }

    // ── Policy Enforcement ────────────────────────────────────────────────────

    /**
     * Throws 403 if the recruiter is not {@link RecruiterStatus#APPROVED}.
     * Messages are crafted to be actionable — the recruiter knows what to do next.
     */
    private void enforceApproved(Recruiter recruiter) throws JobPortalException {
        RecruiterStatus status = recruiter.getStatus();
        if (status == RecruiterStatus.APPROVED) return;

        String message = switch (status) {
            case PENDING_VERIFICATION ->
                "Your recruiter account is pending verification. "
                + "Please wait for admin review before accessing this feature.";
            case REJECTED ->
                "Your recruiter account has been rejected. "
                + "Please review the rejection reason and resubmit your verification "
                + "via GET /api/recruiter/verification/status.";
            case SUSPENDED ->
                "Your recruiter account has been suspended. "
                + "Please contact platform support for assistance.";
            default ->
                "Your recruiter account is not approved for this action.";
        };

        throw JobPortalException.forbidden(message);
    }

    /**
     * Allows APPROVED and PENDING_VERIFICATION recruiters through.
     * REJECTED and SUSPENDED are blocked (they cannot even update company info
     * after being rejected — they must resubmit, not quietly edit).
     *
     * <p>Design note: REJECTED recruiters CAN update company info because they
     * need to fix the very data that caused rejection. So REJECTED is also allowed
     * for company management operations.</p>
     */
    private void enforceApprovedOrPending(Recruiter recruiter) throws JobPortalException {
        RecruiterStatus status = recruiter.getStatus();
        if (status == RecruiterStatus.APPROVED
                || status == RecruiterStatus.PENDING_VERIFICATION
                || status == RecruiterStatus.REJECTED) return;

        // Only SUSPENDED is blocked here
        if (status == RecruiterStatus.SUSPENDED) {
            throw JobPortalException.forbidden(
                "Your recruiter account has been suspended. "
                + "Please contact platform support for assistance.");
        }

        throw JobPortalException.forbidden("Access denied for current account status: " + status);
    }

    // ── Repository Access ─────────────────────────────────────────────────────

    /**
     * Loads the recruiter by user email with a JOIN FETCH on the User entity
     * (single query instead of N+1). If no recruiter record exists yet for an
     * EMPLOYER or ADMIN user, automatically provisions one to ensure persistent
     * profile access.
     */
    @Transactional
    protected Recruiter loadRecruiterByEmail(String email) throws JobPortalException {
        Optional<Recruiter> recruiterOpt = recruiterRepository.findByUserEmail(email);
        if (recruiterOpt.isPresent()) {
            return recruiterOpt.get();
        }

        // Auto-provision Recruiter entity for EMPLOYER or ADMIN users if missing
        if (userRepository != null) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getAccountType() == AccountType.EMPLOYER || user.getAccountType() == AccountType.ADMIN) {
                    Recruiter recruiter = new Recruiter();
                    recruiter.setUser(user);
                    recruiter.setStatus(user.getAccountType() == AccountType.ADMIN
                            ? RecruiterStatus.APPROVED
                            : RecruiterStatus.PENDING_VERIFICATION);
                    user.setRecruiter(recruiter);
                    return recruiterRepository.save(recruiter);
                }
            }
        }

        throw JobPortalException.notFound("Recruiter profile not found for: " + email);
    }
}
