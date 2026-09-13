package com.jobportal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import com.jobportal.domain.AccountType;
import com.jobportal.domain.RecruiterStatus;
import com.jobportal.dto.CompanyRequestDTO;
import com.jobportal.dto.CompanyResponseDTO;
import com.jobportal.entity.Company;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.mapper.JobMapper;
import com.jobportal.repository.CompanyRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.RecruiterAuthorizationService;
import com.jobportal.serviceImpl.CompanyServiceImpl;

class CompanyServiceTest {

    private UserRepository userRepository;
    private RecruiterRepository recruiterRepository;
    private CompanyRepository companyRepository;
    private JobRepository jobRepository;
    private JobMapper jobMapper;
    private ApplicationEventPublisher eventPublisher;
    private RecruiterAuthorizationService recruiterAuthorizationService;
    private CompanyServiceImpl companyService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        recruiterRepository = mock(RecruiterRepository.class);
        companyRepository = mock(CompanyRepository.class);
        jobRepository = mock(JobRepository.class);
        jobMapper = mock(JobMapper.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        recruiterAuthorizationService = mock(RecruiterAuthorizationService.class);

        companyService = new CompanyServiceImpl(
                userRepository,
                recruiterRepository,
                companyRepository,
                jobRepository,
                jobMapper,
                "target/uploads",
                eventPublisher,
                recruiterAuthorizationService
        );
    }

    @Test
    @DisplayName("getMyCompany returns null when recruiter has no company linked yet")
    void testGetMyCompanyReturnsNullWhenNotSet() throws Exception {
        String email = "recruiter@tech.com";
        Recruiter recruiter = new Recruiter();
        recruiter.setId(1L);
        recruiter.setStatus(RecruiterStatus.APPROVED);
        recruiter.setCompany(null);

        when(recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email)).thenReturn(recruiter);

        CompanyResponseDTO res = companyService.getMyCompany(email);
        assertNull(res, "Should return null without throwing 404 when no company is linked");
    }

    @Test
    @DisplayName("createCompany creates new company and links to recruiter")
    void testCreateCompanySuccess() throws Exception {
        String email = "employer@tech.com";
        User user = new User();
        user.setId(2L);
        user.setEmail(email);
        user.setAccountType(AccountType.EMPLOYER);

        Recruiter recruiter = new Recruiter();
        recruiter.setId(1L);
        recruiter.setUser(user);
        recruiter.setStatus(RecruiterStatus.APPROVED);

        when(recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email)).thenReturn(recruiter);
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> {
            Company c = inv.getArgument(0);
            c.setId(100L);
            return c;
        });

        CompanyRequestDTO dto = new CompanyRequestDTO();
        dto.setCompanyName("Acme Corp");
        dto.setIndustry("Technology");
        dto.setWebsite("https://acme.com");

        CompanyResponseDTO res = companyService.createCompany(dto, email);

        assertNotNull(res);
        assertEquals("Acme Corp", res.getCompanyName());
        assertEquals("Technology", res.getIndustry());
        assertNotNull(recruiter.getCompany());
        assertEquals(100L, recruiter.getCompany().getId());
    }

    @Test
    @DisplayName("createCompany is idempotent: updates existing company instead of throwing 409 Conflict")
    void testCreateCompanyIdempotentUpsert() throws Exception {
        String email = "employer@tech.com";
        User user = new User();
        user.setId(2L);
        user.setEmail(email);
        user.setAccountType(AccountType.EMPLOYER);

        Company existing = new Company();
        existing.setId(50L);
        existing.setCompanyName("Old Name");

        Recruiter recruiter = new Recruiter();
        recruiter.setId(1L);
        recruiter.setUser(user);
        recruiter.setCompany(existing);
        recruiter.setStatus(RecruiterStatus.APPROVED);

        when(recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email)).thenReturn(recruiter);
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> inv.getArgument(0));

        CompanyRequestDTO dto = new CompanyRequestDTO();
        dto.setCompanyName("Updated Name");
        dto.setIndustry("FinTech");

        CompanyResponseDTO res = companyService.createCompany(dto, email);

        assertNotNull(res);
        assertEquals("Updated Name", res.getCompanyName());
        assertEquals("FinTech", res.getIndustry());
        assertEquals(50L, res.getId());
    }

    @Test
    @DisplayName("updateCompany is idempotent: creates company if recruiter does not have one yet")
    void testUpdateCompanyIdempotentUpsert() throws Exception {
        String email = "employer@tech.com";
        User user = new User();
        user.setId(2L);
        user.setEmail(email);
        user.setAccountType(AccountType.EMPLOYER);

        Recruiter recruiter = new Recruiter();
        recruiter.setId(1L);
        recruiter.setUser(user);
        recruiter.setCompany(null);
        recruiter.setStatus(RecruiterStatus.PENDING_VERIFICATION);

        when(recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email)).thenReturn(recruiter);
        when(companyRepository.save(any(Company.class))).thenAnswer(inv -> {
            Company c = inv.getArgument(0);
            c.setId(88L);
            return c;
        });

        CompanyRequestDTO dto = new CompanyRequestDTO();
        dto.setCompanyName("Brand New Co");
        dto.setIndustry("Healthcare");

        CompanyResponseDTO res = companyService.updateCompany(dto, email);

        assertNotNull(res);
        assertEquals("Brand New Co", res.getCompanyName());
        assertEquals(88L, res.getId());
        assertNotNull(recruiter.getCompany());
    }
}
