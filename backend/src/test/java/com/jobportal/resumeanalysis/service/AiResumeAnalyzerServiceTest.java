package com.jobportal.resumeanalysis.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;

import com.jobportal.exception.JobPortalException;
import com.jobportal.resumeanalysis.dto.AiAnalysisResult;

class AiResumeAnalyzerServiceTest {

    private ChatClient.Builder chatClientBuilder;
    private ChatClient chatClient;
    private AiResumeAnalyzerService service;

    @BeforeEach
    void setUp() {
        chatClientBuilder = mock(ChatClient.Builder.class);
        chatClient = mock(ChatClient.class);
        when(chatClientBuilder.build()).thenReturn(chatClient);
        service = new AiResumeAnalyzerService(chatClientBuilder);
    }

    @Test
    @DisplayName("Should throw bad request when resume text is null or blank")
    void shouldThrowWhenResumeTextIsBlank() {
        assertThrows(JobPortalException.class, () -> service.analyze(null));
        assertThrows(JobPortalException.class, () -> service.analyze("   "));
    }

    @Test
    @DisplayName("Should return structured fallback analysis when AI remote call fails")
    void shouldReturnHeuristicFallbackWhenRemoteAiFails() {
        when(chatClient.prompt()).thenThrow(new RuntimeException("404: model not found"));

        String resumeText = "Yash Lodam\nFull Stack Developer | Java & Spring Boot\nEmail: yashlodam03@gmail.com\n\nExperience:\nSoftware Engineer at TechCorp (2023 - Present)\n- Developed scalable REST APIs using Java, Spring Boot, and PostgreSQL.\n- Built responsive UI dashboards using React, TypeScript, and Tailwind CSS.\n- Deployed containerized microservices using Docker and AWS.\n\nEducation:\nBachelor of Engineering in Computer Science (2020 - 2024)\n\nSkills:\nJava, Spring Boot, React, PostgreSQL, Docker, AWS, Git, REST APIs";

        AiAnalysisResult result = service.analyze(resumeText);

        assertNotNull(result);
        assertTrue(result.getOverallScore() >= 60 && result.getOverallScore() <= 100);
        assertTrue(result.getAtsScore() >= 60 && result.getAtsScore() <= 100);
        assertNotNull(result.getSkills());
        assertFalse(result.getSkills().isEmpty());
        assertTrue(result.getSkills().contains("Java"));
        assertTrue(result.getSkills().contains("Spring Boot"));
        assertTrue(result.getSkills().contains("React"));
        assertNotNull(result.getStrengths());
        assertFalse(result.getStrengths().isEmpty());
        assertNotNull(result.getImprovements());
        assertFalse(result.getImprovements().isEmpty());
        assertNotNull(result.getRecommendedJobs());
        assertFalse(result.getRecommendedJobs().isEmpty());
        assertNotNull(result.getSummary());
        assertFalse(result.getSummary().isBlank());
    }
}