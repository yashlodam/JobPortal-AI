package com.jobportal.serviceImpl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.AccountType;
import com.jobportal.domain.JobStatus;
import com.jobportal.domain.RecruiterStatus;
import com.jobportal.dto.request.UpdateUserStatusRequest;
import com.jobportal.dto.response.AdminPlatformStatsResponse;
import com.jobportal.dto.response.AdminUserResponse;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.AdminDashboardService;

@Service
@Transactional
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final RecruiterRepository recruiterRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CompanyRepository companyRepository;

    public AdminDashboardServiceImpl(
            UserRepository userRepository,
            RecruiterRepository recruiterRepository,
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository,
            CompanyRepository companyRepository) {
        this.userRepository = userRepository;
        this.recruiterRepository = recruiterRepository;
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.companyRepository = companyRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> listUsers(String role, String search, Pageable pageable) {
        AccountType accountType = null;
        if (role != null && !role.isBlank() && !role.equalsIgnoreCase("ALL")) {
            try {
                accountType = AccountType.valueOf(role.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // If invalid role passed, leave accountType as null
            }
        }

        String searchPattern = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<User> users = userRepository.searchUsers(accountType, searchPattern, pageable);
        return users.map(this::toAdminUserResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long userId) throws JobPortalException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> JobPortalException.notFound("User not found with id: " + userId));
        return toAdminUserResponse(user);
    }

    @Override
    public AdminUserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) throws JobPortalException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> JobPortalException.notFound("User not found with id: " + userId));

        if (request != null) {
            String statusStr = request.getStatus();
            Boolean activeFlag = request.getIsActive();

            if (statusStr != null && !statusStr.isBlank()) {
                String normalized = statusStr.trim().toUpperCase();
                if (normalized.equals("SUSPENDED")) {
                    user.setIsActive(false);
                    if (user.getAccountType() == AccountType.EMPLOYER && user.getRecruiter() != null) {
                        user.getRecruiter().setStatus(RecruiterStatus.SUSPENDED);
                        if (request.getReason() != null) {
                            user.getRecruiter().setRejectionReason(request.getReason());
                        }
                        jobRepository.closeAllOpenJobsByRecruiterId(user.getRecruiter().getId());
                    }
                } else if (normalized.equals("INACTIVE") || normalized.equals("DEACTIVATED")) {
                    user.setIsActive(false);
                } else if (normalized.equals("ACTIVE") || normalized.equals("APPROVED")) {
                    user.setIsActive(true);
                    if (user.getAccountType() == AccountType.EMPLOYER && user.getRecruiter() != null) {
                        if (normalized.equals("APPROVED") || user.getRecruiter().getStatus() == RecruiterStatus.SUSPENDED) {
                            user.getRecruiter().setStatus(RecruiterStatus.APPROVED);
                            user.getRecruiter().setRejectionReason(null);
                        }
                    }
                }
            } else if (activeFlag != null) {
                user.setIsActive(activeFlag);
                if (!activeFlag && user.getAccountType() == AccountType.EMPLOYER && user.getRecruiter() != null) {
                    user.getRecruiter().setStatus(RecruiterStatus.SUSPENDED);
                    jobRepository.closeAllOpenJobsByRecruiterId(user.getRecruiter().getId());
                }
            }
        }

        User saved = userRepository.save(user);
        return toAdminUserResponse(saved);
    }

    @Override
    public void deleteUser(Long userId) throws JobPortalException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> JobPortalException.notFound("User not found with id: " + userId));

        // Soft deactivation & suspension
        user.setIsActive(false);
        if (user.getAccountType() == AccountType.EMPLOYER && user.getRecruiter() != null) {
            user.getRecruiter().setStatus(RecruiterStatus.SUSPENDED);
            user.getRecruiter().setRejectionReason("Account deactivated by administrator");
            jobRepository.closeAllOpenJobsByRecruiterId(user.getRecruiter().getId());
        }
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminPlatformStatsResponse getPlatformStats() {
        AdminPlatformStatsResponse stats = new AdminPlatformStatsResponse();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalApplicants(userRepository.countByAccountType(AccountType.APPLICANT));
        stats.setTotalRecruiters(userRepository.countByAccountType(AccountType.EMPLOYER));
        stats.setTotalAdmins(userRepository.countByAccountType(AccountType.ADMIN));
        stats.setActiveUsers(userRepository.countByIsActive(true));

        stats.setTotalJobs(jobRepository.count());
        stats.setActiveJobs(jobRepository.countByStatus(JobStatus.OPEN));
        stats.setClosedJobs(jobRepository.countByStatus(JobStatus.CLOSED));

        stats.setTotalApplications(jobApplicationRepository.count());
        stats.setTotalCompanies(companyRepository.count());

        stats.setPendingVerifications(recruiterRepository.countByStatus(RecruiterStatus.PENDING_VERIFICATION));
        stats.setApprovedRecruiters(recruiterRepository.countByStatus(RecruiterStatus.APPROVED));
        stats.setRejectedRecruiters(recruiterRepository.countByStatus(RecruiterStatus.REJECTED));
        stats.setSuspendedRecruiters(recruiterRepository.countByStatus(RecruiterStatus.SUSPENDED));

        return stats;
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        if (user == null) return null;

        AdminUserResponse dto = new AdminUserResponse();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAccountType(user.getAccountType());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        if (user.getProfile() != null) {
            dto.setProfileId(user.getProfile().getId());
        }

        Recruiter recruiter = user.getRecruiter();
        if (recruiter == null && user.getAccountType() == AccountType.EMPLOYER) {
            recruiter = recruiterRepository.findByUser(user).orElse(null);
        }

        if (recruiter != null) {
            dto.setRecruiterId(recruiter.getId());
            dto.setRecruiterStatus(recruiter.getStatus());
            dto.setStatus(recruiter.getStatus() != null ? recruiter.getStatus().name() : "PENDING");
            dto.setDesignation(recruiter.getDesignation());
            if (recruiter.getCompany() != null) {
                dto.setCompanyName(recruiter.getCompany().getCompanyName());
            }
        } else {
            dto.setStatus(Boolean.TRUE.equals(user.getIsActive()) ? "ACTIVE" : "INACTIVE");
        }

        return dto;
    }
}
