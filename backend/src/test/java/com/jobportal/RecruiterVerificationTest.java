package com.jobportal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;

import com.jobportal.domain.AccountType;
import com.jobportal.domain.RecruiterStatus;
import com.jobportal.dto.request.AdminReviewRequest;
import com.jobportal.dto.request.RecruiterVerificationRequest;
import com.jobportal.dto.response.RecruiterAdminSummaryResponse;
import com.jobportal.dto.response.RecruiterVerificationStatusResponse;
import com.jobportal.entity.Company;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.serviceImpl.AdminRecruiterServiceImpl;
import com.jobportal.serviceImpl.RecruiterAuthorizationServiceImpl;
import com.jobportal.serviceImpl.RecruiterVerificationServiceImpl;

class RecruiterVerificationTest {

    private RecruiterRepository recruiterRepository;
    private UserRepository userRepository;
    private JobRepository jobRepository;
    private CompanyRepository companyRepository;
    private ApplicationEventPublisher eventPublisher;
    private AdminRecruiterServiceImpl adminRecruiterService;
    private RecruiterAuthorizationServiceImpl recruiterAuthorizationService;
    private RecruiterVerificationServiceImpl verificationService;

    @BeforeEach
    void setUp() {
        recruiterRepository = mock(RecruiterRepository.class);
        userRepository = mock(UserRepository.class);
        jobRepository = mock(JobRepository.class);
        companyRepository = mock(CompanyRepository.class);
        eventPublisher = mock(ApplicationEventPublisher.class);

        adminRecruiterService = new AdminRecruiterServiceImpl(
                recruiterRepository,
                userRepository,
                jobRepository,
                eventPublisher
        );

        recruiterAuthorizationService = new RecruiterAuthorizationServiceImpl(
                recruiterRepository
        );

        verificationService = new RecruiterVerificationServiceImpl(
                recruiterRepository,
                companyRepository,
                eventPublisher
        );
    }

    @Test
    @DisplayName("Admin approving a pending recruiter transitions status to APPROVED")
    void testApproveRecruiter() throws Exception {
        Long recruiterId = 10L;
        String adminEmail = "admin@jobportal.com";

        User adminUser = new User();
        adminUser.setId(99L);
        adminUser.setEmail(adminEmail);
        adminUser.setAccountType(AccountType.ADMIN);

        User recruiterUser = new User();
        recruiterUser.setId(5L);
        recruiterUser.setName("Recruiter Name");
        recruiterUser.setEmail("recruiter@tech.com");

        Recruiter recruiter = new Recruiter();
        recruiter.setId(recruiterId);
        recruiter.setUser(recruiterUser);
        recruiter.setStatus(RecruiterStatus.PENDING_VERIFICATION);

        when(userRepository.findByEmail(adminEmail)).thenReturn(Optional.of(adminUser));
        when(recruiterRepository.findByIdWithDetails(recruiterId)).thenReturn(Optional.of(recruiter));
        when(recruiterRepository.save(any(Recruiter.class))).thenAnswer(inv -> inv.getArgument(0));

        AdminReviewRequest req = new AdminReviewRequest();
        req.setReason("Verification docs verified.");

        RecruiterAdminSummaryResponse res = adminRecruiterService.approveRecruiter(recruiterId, adminEmail, req);

        assertNotNull(res);
        assertEquals(RecruiterStatus.APPROVED, res.getStatus());
        verify(recruiterRepository).save(recruiter);
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    @DisplayName("RecruiterAuthorizationService throws 403 FORBIDDEN for PENDING_VERIFICATION recruiter")
    void testRequireApprovedRecruiterPendingThrowsForbidden() {
        String email = "pending@tech.com";

        Recruiter recruiter = new Recruiter();
        recruiter.setId(10L);
        recruiter.setStatus(RecruiterStatus.PENDING_VERIFICATION);

        when(recruiterRepository.findByUserEmail(email)).thenReturn(Optional.of(recruiter));

        JobPortalException ex = assertThrows(JobPortalException.class, () ->
                recruiterAuthorizationService.requireApprovedRecruiter(email));

        assertEquals(HttpStatus.FORBIDDEN, ex.getHttpStatus());
    }

    @Test
    @DisplayName("RecruiterAuthorizationService returns Recruiter when status is APPROVED")
    void testRequireApprovedRecruiterSuccess() throws Exception {
        String email = "approved@tech.com";

        Recruiter recruiter = new Recruiter();
        recruiter.setId(10L);
        recruiter.setStatus(RecruiterStatus.APPROVED);

        when(recruiterRepository.findByUserEmail(email)).thenReturn(Optional.of(recruiter));

        Recruiter result = recruiterAuthorizationService.requireApprovedRecruiter(email);

        assertNotNull(result);
        assertEquals(10L, result.getId());
    }

    // =========================================================================
    // NEW: Verify submitVerification persists company data to companies table
    // =========================================================================

    @Test
    @DisplayName("submitVerification creates a linked Company entity in the DB")
    void testSubmitVerificationAlsoCreatesCompany() throws Exception {
        String email = "employer@techcorp.com";

        User user = new User();
        user.setId(20L);
        user.setEmail(email);
        user.setName("Tech Corp HR");
        user.setAccountType(AccountType.EMPLOYER);

        Recruiter recruiter = new Recruiter();
        recruiter.setId(5L);
        recruiter.setUser(user);
        recruiter.setStatus(RecruiterStatus.PENDING_VERIFICATION);
        // No company linked yet
        recruiter.setCompany(null);

        Company savedCompany = new Company();
        savedCompany.setId(100L);
        savedCompany.setCompanyName("TechCorp Solutions");
        savedCompany.setWebsite("https://techcorp.com");
        savedCompany.setHeadquarters("San Francisco, CA");
        savedCompany.setDescription("A leading AI company.");

        when(recruiterRepository.findByUserEmail(email)).thenReturn(Optional.of(recruiter));
        when(companyRepository.save(any(Company.class))).thenReturn(savedCompany);
        when(recruiterRepository.save(any(Recruiter.class))).thenAnswer(inv -> inv.getArgument(0));

        RecruiterVerificationRequest request = new RecruiterVerificationRequest();
        request.setDesignation("Head of Talent");
        request.setCompanyName("TechCorp Solutions");
        request.setCompanyWebsite("https://techcorp.com");
        request.setCompanyLocation("San Francisco, CA");
        request.setCompanyDescription("A leading AI company.");
        request.setWorkEmail("hr@techcorp.com");

        RecruiterVerificationStatusResponse response = verificationService.submitVerification(email, request);

        assertNotNull(response);
        assertEquals(RecruiterStatus.PENDING_VERIFICATION, response.getStatus());
        // Verify company was saved
        verify(companyRepository).save(any(Company.class));
        // Verify recruiter was saved (with company linked + designation set)
        verify(recruiterRepository).save(any(Recruiter.class));
        assertEquals("Head of Talent", recruiter.getDesignation());
    }
}