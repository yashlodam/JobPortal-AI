package com.jobportal.serviceImpl;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.AccountType;
import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.dto.response.UserResponse;
import com.jobportal.entity.Otp;
import com.jobportal.entity.Profile;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.event.PasswordResetEvent;
import com.jobportal.event.UserRegisteredEvent;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.OtpRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.UserService;
import com.jobportal.utility.Utilities;


import java.time.LocalDateTime;

import com.jobportal.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Locale;

/**
 * User service implementation.
 *
 * <h3>Notifications (event-driven)</h3>
 * <ul>
 *   <li>{@link UserRegisteredEvent} — fired after registration.
 *       The listener sends a welcome {@code ACCOUNT} notification.</li>
 *   <li>{@link PasswordResetEvent} — fired after a successful OTP-verified password reset.
 *       The listener sends a {@code SECURITY} alert notification.</li>
 * </ul>
 */
@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository           userRepository;
    private final PasswordEncoder          passwordEncoder;
    private final EmailService             emailService;
    private final OtpRepository            otpRepository;
    private final ApplicationEventPublisher eventPublisher;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            OtpRepository otpRepository,
            ApplicationEventPublisher eventPublisher) {
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService    = emailService;
        this.otpRepository   = otpRepository;
        this.eventPublisher  = eventPublisher;
    }

    @Override
    @Transactional
    public UserResponse registerUser(RegisterRequest request) throws JobPortalException {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw JobPortalException.conflict(
                    "User already exists with email: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAccountType(request.getAccountType());

        if (request.getAccountType() == AccountType.APPLICANT) {
            Profile profile = new Profile();
            profile.setUser(user);
            user.setProfile(profile);
        } else if (request.getAccountType() == AccountType.EMPLOYER) {
            Recruiter recruiter = new Recruiter();
            recruiter.setUser(user);
            recruiter.setStatus(com.jobportal.domain.RecruiterStatus.PENDING_VERIFICATION);
            user.setRecruiter(recruiter);
        }
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // ── Publish event: listener sends ACCOUNT welcome notification ────────
        eventPublisher.publishEvent(new UserRegisteredEvent(
                this, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getAccountType()));

        return toUserResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) throws JobPortalException {
        String cleanEmail = email != null ? email.trim().toLowerCase(Locale.ROOT) : "";
        User user = userRepository.findByEmail(cleanEmail)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> JobPortalException.notFound("User not found with email: " + email));
        return toUserResponse(user);
    }

    @Override
    @Transactional
    public boolean sendOtp(String email) throws Exception {
        String cleanEmail = email != null ? email.trim().toLowerCase(Locale.ROOT) : "";
        User user = userRepository.findByEmail(cleanEmail)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> JobPortalException.notFound("No account found with email: " + email));

        String generatedOtp = Utilities.generateOtp();

        otpRepository.findByEmail(cleanEmail).ifPresent(otpRepository::delete);
        if (!cleanEmail.equals(email)) {
            otpRepository.findByEmail(email).ifPresent(otpRepository::delete);
        }

        Otp otp = new Otp();
        otp.setEmail(cleanEmail);
        otp.setOtpCode(generatedOtp);
        otp.setCreationTime(LocalDateTime.now());
        otp.setExpiryTime(LocalDateTime.now().plusMinutes(10));
        otp.setVerified(false);
        otpRepository.save(otp);

        emailService.sendOtpEmail(user.getName(), cleanEmail, generatedOtp);

        return true;
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String otp) throws JobPortalException {
        String cleanEmail = email != null ? email.trim().toLowerCase(Locale.ROOT) : "";
        Otp otpEntity = otpRepository.findByEmail(cleanEmail)
                .or(() -> otpRepository.findByEmail(email))
                .orElseThrow(() -> JobPortalException.notFound("No verification code requested for: " + email));

        if (LocalDateTime.now().isAfter(otpEntity.getExpiryTime())) {
            throw JobPortalException.badRequest("Verification code has expired. Please request a new one.");
        }

        String inputOtp = otp != null ? otp.trim() : "";
        if (!otpEntity.getOtpCode().equals(inputOtp)) {
            throw JobPortalException.badRequest("Invalid verification code. Please check and try again.");
        }

        otpEntity.setVerified(true);
        otpRepository.save(otpEntity);
        return true;
    }

    @Override
    @Transactional
    public boolean resetPassword(String email, String newPassword) throws JobPortalException {
        String cleanEmail = email != null ? email.trim().toLowerCase(Locale.ROOT) : "";
        User user = userRepository.findByEmail(cleanEmail)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> JobPortalException.notFound("User not found"));

        Otp otp = otpRepository.findByEmail(cleanEmail)
                .or(() -> otpRepository.findByEmail(email))
                .orElseThrow(() -> JobPortalException.badRequest(
                        "Verification code required before resetting password."));

        if (!otp.isVerified()) {
            throw JobPortalException.forbidden("Verification code has not been verified yet.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpRepository.delete(otp);

        // ── Publish event: listener sends SECURITY alert notification ─────────
        eventPublisher.publishEvent(new PasswordResetEvent(this, user.getId(), user.getEmail()));

        return true;
    }

    // ── Private Helpers ─────────────────────────────────────────────────────

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setAccountType(user.getAccountType());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());

        if (user.getProfile() != null) {
            response.setProfileId(user.getProfile().getId());
            response.setProfileImage(user.getProfile().getProfileImage());
            response.setBannerImage(user.getProfile().getBannerImage());
        }
        if (user.getRecruiter() != null) {
            response.setRecruiterId(user.getRecruiter().getId());
        }
        return response;
    }

    
}