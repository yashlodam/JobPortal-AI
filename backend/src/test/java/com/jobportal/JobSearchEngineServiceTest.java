package com.jobportal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;
import com.jobportal.entity.Job;
import com.jobportal.repository.JobRepository;
import com.jobportal.service.JobSearchEngineService;
import com.jobportal.service.JobSearchEngineService.SearchIntent;

class JobSearchEngineServiceTest {

    private JobRepository jobRepository;
    private JobSearchEngineService searchEngineService;

    @BeforeEach
    void setUp() {
        jobRepository = mock(JobRepository.class);
        searchEngineService = new JobSearchEngineService(jobRepository);
    }

    @Test
    @DisplayName("Should extract city and clean keywords from 'in <city>' queries")
    void testExtractIntentCity() {
        SearchIntent intent = searchEngineService.parseQuery("Software Engineer in Pune");
        assertNotNull(intent);
        assertEquals("Pune", intent.getExtractedCity());
        assertTrue(intent.getCleanedKeyword().toLowerCase().contains("software engineer"));
    }

    @Test
    @DisplayName("Should detect remote/wfh intent from query")
    void testExtractIntentRemote() {
        SearchIntent intent = searchEngineService.parseQuery("Remote React Developer");
        assertNotNull(intent);
        assertEquals(WorkingMode.REMOTE, intent.getExtractedMode());
        assertTrue(intent.getCleanedKeyword().toLowerCase().contains("react developer"));
    }

    @Test
    @DisplayName("Should detect internship intent from query")
    void testExtractIntentInternship() {
        SearchIntent intent = searchEngineService.parseQuery("Python Intern");
        assertNotNull(intent);
        assertEquals(JobType.INTERNSHIP, intent.getExtractedJobType());
    }

    @Test
    @DisplayName("Should detect experience level from query")
    void testExtractIntentExperience() {
        SearchIntent intent = searchEngineService.parseQuery("Senior Java Developer");
        assertNotNull(intent);
        assertEquals(ExperienceLevel.SENIOR_LEVEL, intent.getExtractedExperience());
    }

    @Test
    @DisplayName("Should map tech synonyms like k8s -> kubernetes, react -> reactjs")
    void testSynonymExpansion() {
        SearchIntent intent = searchEngineService.parseQuery("k8s react developer");
        assertTrue(intent.getSynonyms().contains("kubernetes"));
        assertTrue(intent.getSynonyms().contains("reactjs"));
    }

    @Test
    @DisplayName("Exact title match must score significantly higher than description-only match")
    void testRelevanceScoringTitleVsDescription() {
        SearchIntent intent = searchEngineService.parseQuery("java developer");

        Job titleMatchJob = new Job();
        titleMatchJob.setId(1L);
        titleMatchJob.setJobTitle("Senior Java Developer");
        titleMatchJob.setSkillsRequired(Arrays.asList("Java", "Spring Boot", "Microservices"));
        titleMatchJob.setDescription("Build enterprise banking applications.");

        Job descMatchJob = new Job();
        descMatchJob.setId(2L);
        descMatchJob.setJobTitle("Office Coordinator");
        descMatchJob.setSkillsRequired(Arrays.asList("Administration"));
        descMatchJob.setDescription("Coordinate with our java developer team.");

        double scoreTitleMatch = searchEngineService.calculateRelevanceScore(
                titleMatchJob, "java developer", intent.getTokens(), intent.getSynonyms());
        double scoreDescMatch = searchEngineService.calculateRelevanceScore(
                descMatchJob, "java developer", intent.getTokens(), intent.getSynonyms());

        assertTrue(scoreTitleMatch > scoreDescMatch,
                "Title match score (" + scoreTitleMatch + ") must be higher than description match score (" + scoreDescMatch + ")");
        assertTrue(scoreTitleMatch >= 70.0, "Title match should score high (>70)");
    }
}
