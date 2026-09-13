package com.jobportal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import com.jobportal.domain.ApplicationStatus;
import com.jobportal.domain.RecruiterStatus;
import com.jobportal.dto.request.JobApplicationRequest;
import com.jobportal.dto.request.UpdateApplicationStatusRequest;
import com.jobportal.dto.response.JobApplicationResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Profile;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.Resume;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.service.RecruiterAuthorizationService;
import com.jobportal.service.ResumeService;
import com.jobportal.serviceImpl.JobApplicationServiceImpl;

class JobApplicationServiceTest {

    private JobApplicationRepository applicationRepository;
    private JobRepository jobRepository;
    private UserRepository userRepository;
    private RecruiterRepository recruiterRepository;
    private ResumeRepository resumeRepository;
    private ProfileRepository profileRepository;
    private ResumeService resumeService;
    private ApplicationEventPublisher eventPublisher;
    private RecruiterAuthorizationService recruiterAuthorizationService;
    private com.jobportal.jobmatch.repository.JobMatchAnalysisRepository jobMatchAnalysisRepository;
    private com.jobportal.chat.repository.ConversationRepository conversationRepository;

    private JobApplicationServiceImpl applicationService;

    @BeforeEach
    void setUp() {
        applicationRepository = mock(JobApplicationRepository.class);
        jobRepository = mock(JobRepository.class);
        userRepository = mock(UserRepository.class);
        recruiterRepository = mock(RecruiterRepository.class);
        resumeRepository = mock(ResumeRepository.class);
        profileRepository = mock(ProfileRepository.class);
        resumeService = mock(ResumeService.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        recruiterAuthorizationService = mock(RecruiterAuthorizationService.class);
        jobMatchAnalysisRepository = mock(com.jobportal.jobmatch.repository.JobMatchAnalysisRepository.class);
        conversationRepository = mock(com.jobportal.chat.repository.ConversationRepository.class);

        applicationService = new JobApplicationServiceImpl(
                applicationRepository,
                jobRepository,
                userRepository,
                recruiterRepository,
                resumeRepository,
                profileRepository,
                resumeService,
                eventPublisher,
                recruiterAuthorizationService,
                jobMatchAnalysisRepository,
                conversationRepository
        );
    }

    @Test
    @DisplayName("Apply to job invokes atomic incrementApplicantCount")
    void testApplyToJobSuccess() throws Exception {
        String email = "applicant@example.com";
        Long jobId = 100L;

        User applicant = new User();
        applicant.setId(1L);
        applicant.setEmail(email);
        applicant.setName("Applicant");
        applicant.setAccountType(AccountType.APPLICANT);

        User recruiterUser = new User();
        recruiterUser.setId(2L);
        recruiterUser.setName("Recruiter");

        Recruiter recruiter = new Recruiter();
        recruiter.setId(5L);
        recruiter.setUser(recruiterUser);

        Job job = new Job();
        job.setId(jobId);
        job.setJobTitle("Software Engineer");
        job.setRecruiter(recruiter);
        job.setTotalApplicants(5);

        Profile profile = new Profile();
        profile.setId(10L);
        profile.setUser(applicant);

        Resume resume = new Resume();
        resume.setId(20L);
        resume.setProfile(profile);

        JobApplicationRequest request = new JobApplicationRequest();
        request.setResumeId(20L);
        request.setCoverLetter("Looking forward to working with you.");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(applicant));
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByApplicantIdAndJobId(1L, jobId)).thenReturn(false);
        when(resumeRepository.findById(20L)).thenReturn(Optional.of(resume));

        JobApplication savedApp = new JobApplication();
        savedApp.setId(500L);
        savedApp.setJob(job);
        savedApp.setApplicant(applicant);
        savedApp.setResume(resume);
        savedApp.setStatus(ApplicationStatus.APPLIED);

        when(applicationRepository.save(any(JobApplication.class))).thenReturn(savedApp);

        JobApplicationResponse response = applicationService.applyToJob(jobId, request, email);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        verify(jobRepository).incrementApplicantCount(jobId);
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    @DisplayName("Apply throws conflict when duplicate application exists")
    void testApplyDuplicateThrowsConflict() {
        String email = "applicant@example.com";
        Long jobId = 100L;

        User applicant = new User();
        applicant.setId(1L);
        applicant.setEmail(email);
        applicant.setAccountType(AccountType.APPLICANT);

        Job job = new Job();
        job.setId(jobId);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(applicant));
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(applicationRepository.existsByApplicantIdAndJobId(1L, jobId)).thenReturn(true);

        JobApplicationRequest request = new JobApplicationRequest();

        JobPortalException ex = assertThrows(JobPortalException.class, () ->
                applicationService.applyToJob(jobId, request, email));

        assertEquals(HttpStatus.CONFLICT, ex.getHttpStatus());
    }

    @Test
    @DisplayName("Withdraw application invokes atomic decrementApplicantCount")
    void testWithdrawApplicationSuccess() throws Exception {
        String email = "applicant@example.com";
        Long appId = 500L;
        Long jobId = 100L;

        User applicant = new User();
        applicant.setId(1L);
        applicant.setEmail(email);
        applicant.setName("Applicant");

        User recruiterUser = new User();
        recruiterUser.setId(2L);

        Recruiter recruiter = new Recruiter();
        recruiter.setId(5L);
        recruiter.setUser(recruiterUser);

        Job job = new Job();
        job.setId(jobId);
        job.setJobTitle("Engineer");
        job.setRecruiter(recruiter);
        job.setTotalApplicants(5);

        JobApplication app = new JobApplication();
        app.setId(appId);
        app.setApplicant(applicant);
        app.setJob(job);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(applicant));
        when(applicationRepository.findByIdWithDetails(appId)).thenReturn(Optional.of(app));

        applicationService.withdrawApplication(appId, email);

        verify(jobRepository).decrementApplicantCount(jobId);
        verify(conversationRepository).detachJobApplication(appId);
        verify(jobMatchAnalysisRepository).deleteByJobApplicationId(appId);
        verify(applicationRepository).delete(app);
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    @DisplayName("Status update validates valid lifecycle transitions")
    void testUpdateStatusValidTransition() throws Exception {
        String recruiterEmail = "recruiter@company.com";
        Long appId = 500L;

        Recruiter recruiter = new Recruiter();
        recruiter.setId(5L);
        recruiter.setStatus(RecruiterStatus.APPROVED);

        User applicant = new User();
        applicant.setId(1L);
        applicant.setName("Candidate");
        applicant.setEmail("cand@example.com");

        Job job = new Job();
        job.setId(100L);
        job.setJobTitle("DevOps");
        job.setRecruiter(recruiter);

        JobApplication app = new JobApplication();
        app.setId(appId);
        app.setApplicant(applicant);
        app.setJob(job);
        app.setStatus(ApplicationStatus.APPLIED);

        when(recruiterAuthorizationService.requireApprovedRecruiter(recruiterEmail)).thenReturn(recruiter);
        when(applicationRepository.findByIdWithDetails(appId)).thenReturn(Optional.of(app));
        when(applicationRepository.save(any(JobApplication.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateApplicationStatusRequest req = new UpdateApplicationStatusRequest();
        req.setStatus(ApplicationStatus.REVIEWING);

        JobApplicationResponse response = applicationService.updateApplicationStatus(appId, req, recruiterEmail);

        assertNotNull(response);
        assertEquals(ApplicationStatus.REVIEWING, response.getStatus());
    }

    @Test
    @DisplayName("Status update throws bad request for invalid transition")
    void testUpdateStatusInvalidTransition() {
        String recruiterEmail = "recruiter@company.com";
        Long appId = 500L;

        Recruiter recruiter = new Recruiter();
        recruiter.setId(5L);
        recruiter.setStatus(RecruiterStatus.APPROVED);

        Job job = new Job();
        job.setId(100L);
        job.setRecruiter(recruiter);

        JobApplication app = new JobApplication();
        app.setId(appId);
        app.setJob(job);
        app.setStatus(ApplicationStatus.APPLIED);

        when(recruiterAuthorizationService.requireApprovedRecruiter(recruiterEmail)).thenReturn(recruiter);
        when(applicationRepository.findByIdWithDetails(appId)).thenReturn(Optional.of(app));

        UpdateApplicationStatusRequest req = new UpdateApplicationStatusRequest();
        // APPLIED cannot jump straight to ACCEPTED
        req.setStatus(ApplicationStatus.ACCEPTED);

        JobPortalException ex = assertThrows(JobPortalException.class, () ->
                applicationService.updateApplicationStatus(appId, req, recruiterEmail));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getHttpStatus());
    }
}