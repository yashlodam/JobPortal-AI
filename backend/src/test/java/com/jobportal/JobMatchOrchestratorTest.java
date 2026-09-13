package com.jobportal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Profile;
import com.jobportal.entity.User;
import com.jobportal.jobmatch.dto.JobMatchAiResponse;
import com.jobportal.jobmatch.entity.JobMatchAnalysis;
import com.jobportal.jobmatch.enums.MatchStatus;
import com.jobportal.jobmatch.repository.JobMatchAnalysisRepository;
import com.jobportal.jobmatch.service.AiJobMatchService;
import com.jobportal.jobmatch.service.DeterministicJobMatcher;
import com.jobportal.jobmatch.service.JobMatchOrchestratorService;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.resumebuilder.repository.ResumeDocumentRepository;

class JobMatchOrchestratorTest {

    private JobApplicationRepository applicationRepository;
    private JobMatchAnalysisRepository matchRepository;
    private ProfileRepository profileRepository;
    private ResumeDocumentRepository resumeDocumentRepository;
    private DeterministicJobMatcher deterministicMatcher;
    private AiJobMatchService aiJobMatchService;
    private JobMatchOrchestratorService orchestratorService;

    @BeforeEach
    void setUp() {
        applicationRepository = mock(JobApplicationRepository.class);
        matchRepository = mock(JobMatchAnalysisRepository.class);
        profileRepository = mock(ProfileRepository.class);
        resumeDocumentRepository = mock(ResumeDocumentRepository.class);
        deterministicMatcher = mock(DeterministicJobMatcher.class);
        aiJobMatchService = mock(AiJobMatchService.class);

        orchestratorService = new JobMatchOrchestratorService(
                applicationRepository,
                matchRepository,
                profileRepository,
                resumeDocumentRepository,
                deterministicMatcher,
                aiJobMatchService
        );
    }

    @Test
    @DisplayName("Hybrid match calculates deterministic + AI score and marks COMPLETED")
    void testProcessMatchAnalysisSuccess() {
        Long appId = 10L;

        User applicant = new User();
        applicant.setId(1L);

        Job job = new Job();
        job.setId(20L);
        job.setJobTitle("Backend Java Engineer");

        JobApplication app = new JobApplication();
        app.setId(appId);
        app.setApplicant(applicant);
        app.setJob(job);

        Profile profile = new Profile();
        profile.setId(30L);
        profile.setUser(applicant);

        JobMatchAnalysis analysis = new JobMatchAnalysis();
        analysis.setId(50L);
        analysis.setJobApplication(app);
        analysis.setStatus(MatchStatus.PROCESSING);

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));
        when(matchRepository.findByJobApplicationId(appId)).thenReturn(Optional.of(analysis));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(resumeDocumentRepository.findByUserIdOrderByUpdatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(matchRepository.save(any(JobMatchAnalysis.class))).thenAnswer(inv -> inv.getArgument(0));

        Set<String> candidateSkills = Set.of("java", "spring boot", "postgresql");
        when(deterministicMatcher.extractCandidateSkills(any(), any())).thenReturn(candidateSkills);

        DeterministicJobMatcher.SkillMatchResult skillResult =
                new DeterministicJobMatcher.SkillMatchResult(100, 80, List.of("java"), List.of(), List.of("spring"), List.of());
        when(deterministicMatcher.evaluateSkills(any(), any())).thenReturn(skillResult);
        when(deterministicMatcher.evaluateExperience(any(), any(), any())).thenReturn(90);
        when(deterministicMatcher.evaluateEducation(any(), any(), any())).thenReturn(85);

        JobMatchAiResponse aiResponse = new JobMatchAiResponse();
        aiResponse.setRoleRelevanceScore(90);
        aiResponse.setSemanticScore(85);
        aiResponse.setReasoning("Strong backend and Spring Boot alignment.");
        when(aiJobMatchService.analyzeMatch(any(), any(), any())).thenReturn(aiResponse);

        JobMatchAnalysis result = orchestratorService.processMatchAnalysis(appId);

        assertNotNull(result);
        assertEquals(MatchStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getMatchPercentage());
    }

    @Test
    @DisplayName("AI failure during match calculation gracefully sets status to FAILED without throwing")
    void testProcessMatchAnalysisAiFailureFallback() {
        Long appId = 10L;

        User applicant = new User();
        applicant.setId(1L);

        Job job = new Job();
        job.setId(20L);

        JobApplication app = new JobApplication();
        app.setId(appId);
        app.setApplicant(applicant);
        app.setJob(job);

        JobMatchAnalysis analysis = new JobMatchAnalysis();
        analysis.setId(50L);
        analysis.setJobApplication(app);
        analysis.setStatus(MatchStatus.PROCESSING);

        when(applicationRepository.findById(appId)).thenReturn(Optional.of(app));
        when(matchRepository.findByJobApplicationId(appId)).thenReturn(Optional.of(analysis));
        when(profileRepository.findByUserId(1L)).thenReturn(Optional.of(new Profile()));
        when(resumeDocumentRepository.findByUserIdOrderByUpdatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(matchRepository.save(any(JobMatchAnalysis.class))).thenAnswer(inv -> inv.getArgument(0));

        when(deterministicMatcher.extractCandidateSkills(any(), any())).thenThrow(new RuntimeException("AI API Timeout"));

        JobMatchAnalysis result = orchestratorService.processMatchAnalysis(appId);

        assertNotNull(result);
        assertEquals(MatchStatus.FAILED, result.getStatus());
    }

    @Test
    @DisplayName("DeterministicJobMatcher extracts all required skills from raw resume text when candidate profile is empty")
    void testDeterministicExtractionFromRawResumeText() {
        DeterministicJobMatcher matcher = new DeterministicJobMatcher();

        Job job = new Job();
        job.setJobTitle("Java Full Stack Developer");
        job.setSkillsRequired(List.of(
                "Core Java",
                "OOP",
                "Collections",
                "Spring Boot",
                "Spring Data JPA",
                "Hibernate",
                "REST APIs",
                "SQL",
                "React.js",
                "Git",
                "Maven",
                "API testing",
                "software development best practices"
        ));
        job.setPreferredSkills(List.of("Docker", "Spring Security", "PostgreSQL"));
        job.setQualification("Bachelor of Engineering in Computer Science or related field");

        String rawResumeText = """
                VITTHAL LODAM
                Java Full Stack Developer | Pune, India
                Passionate Java Full Stack Developer with strong foundation in Object-Oriented Programming (OOP),
                Collections Framework, Spring Boot, Spring Data JPA, Hibernate, and RESTful APIs.
                Hands-on experience building responsive frontends using React.js, JavaScript, and Tailwind CSS.
                Proficient with Git, Apache Maven, SQL queries, PostgreSQL, and API testing using Postman.
                Committed to clean code and software development best practices.

                EDUCATION
                Bachelor of Engineering in Computer Engineering (2020 - 2024)
                Savitribai Phule Pune University
                """;

        Profile emptyProfile = new Profile();
        Set<String> candidateSkills = matcher.extractCandidateSkills(emptyProfile, null, List.of(), rawResumeText, job);

        DeterministicJobMatcher.SkillMatchResult result = matcher.evaluateSkills(job, candidateSkills);

        assertEquals(100, result.requiredPercentage(), "All required skills from resume text must match!");
        assertTrue(result.missingRequired().isEmpty(), "No required skills should be missing!");
        assertEquals(job.getSkillsRequired().size(), result.matchedRequired().size());

        int eduScore = matcher.evaluateEducation(job, emptyProfile, null, rawResumeText);
        assertEquals(100, eduScore, "Computer Engineering degree in resume text must match job qualification at 100%");
    }

    @Test
    @DisplayName("DeterministicJobMatcher matches word boundary accurately when preceded by partial substring")
    void testWordBoundaryMatching() {
        DeterministicJobMatcher matcher = new DeterministicJobMatcher();
        String haystack = "Proficient in JavaScript and also Java backend engineering";
        assertTrue(matcher.isWordBoundaryContained("java", haystack), "Java should match even when preceded by JavaScript");
    }
}