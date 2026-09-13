package com.jobportal.resumeanalysis.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.jobportal.exception.JobPortalException;
import com.jobportal.resumeanalysis.dto.AiAnalysisResult;
import com.jobportal.resumeanalysis.scoring.ResumeHealthScoreAggregator;
import com.jobportal.resumeanalysis.scoring.calculators.AtsStructureCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.CompletenessScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.EducationScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.ExperienceScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.FormattingScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.KeywordScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.SkillScoreCalculator;
import com.jobportal.resumeanalysis.util.ResumeDocumentValidator;
import com.jobportal.resumeanalysis.util.ResumeTextNormalizer;

class ResumeHealthScoreEngineTest {

    private ResumeScoringEngine scoringEngine;
    private ResumeHealthScoreAggregator aggregator;

    @BeforeEach
    void setUp() {
        aggregator = new ResumeHealthScoreAggregator(
                new AtsStructureCalculator(),
                new KeywordScoreCalculator(),
                new SkillScoreCalculator(),
                new ExperienceScoreCalculator(),
                new EducationScoreCalculator(),
                new FormattingScoreCalculator(),
                new CompletenessScoreCalculator()
        );
        scoringEngine = new ResumeScoringEngine(aggregator);
    }

    @Test
    @DisplayName("5-Run Reproducibility Test: Identical input MUST produce 100% identical scores across 5 repeated runs")
    void testScoreReproducibilityAcrossFiveRuns() {
        String sampleResumeText = """
                Yash Lodam
                Full Stack Software Engineer | Java & React
                Email: yashlodam03@gmail.com | Phone: +91-9876543210
                LinkedIn: linkedin.com/in/yashlodam | GitHub: github.com/yashlodam
                
                SUMMARY
                Innovative Software Engineer with 3+ years experience designing, building, and deploying microservices and React web applications.
                
                EXPERIENCE
                Senior Software Developer - Tech Corp (2022 - Present)
                - Spearheaded design and implementation of Spring Boot REST APIs handling 5,000 req/s.
                - Reduced page render time by 45% by optimizing React virtual DOM rendering and Redux state tree.
                - Architected Docker containerized microservices and automated CI/CD deployment pipelines on AWS.
                
                EDUCATION
                Bachelor of Engineering in Computer Science - Pune University (2018 - 2022) | CGPA: 8.9/10
                
                SKILLS
                Java, Spring Boot, React, TypeScript, PostgreSQL, Docker, AWS, Git, REST APIs, Microservices
                
                CERTIFICATIONS
                AWS Certified Solutions Architect, Oracle Certified Java Professional
                """;

        AiAnalysisResult aiResult = new AiAnalysisResult();
        aiResult.setOverallScore(85);
        aiResult.setAtsScore(88);
        aiResult.setSkills(List.of("Java", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Docker", "AWS"));

        // Run 1
        ResumeScoringEngine.EvaluationResult run1 = scoringEngine.evaluate(sampleResumeText, aiResult);

        // Run 2 to 5
        for (int i = 2; i <= 5; i++) {
            ResumeScoringEngine.EvaluationResult runN = scoringEngine.evaluate(sampleResumeText, aiResult);
            assertEquals(run1.getOverallScore(), runN.getOverallScore(), "Run " + i + " overallScore mismatch");
            assertEquals(run1.getAtsScore(), runN.getAtsScore(), "Run " + i + " atsScore mismatch");
            assertEquals(run1.getDeterministicScore(), runN.getDeterministicScore(), "Run " + i + " deterministicScore mismatch");
            assertEquals(run1.getSemanticScore(), runN.getSemanticScore(), "Run " + i + " semanticScore mismatch");

            // Verify breakdown component scores match identically
            assertEquals(run1.getBreakdown().getAtsStructure(), runN.getBreakdown().getAtsStructure());
            assertEquals(run1.getBreakdown().getKeywords(), runN.getBreakdown().getKeywords());
            assertEquals(run1.getBreakdown().getSkills(), runN.getBreakdown().getSkills());
            assertEquals(run1.getBreakdown().getExperience(), runN.getBreakdown().getExperience());
            assertEquals(run1.getBreakdown().getEducation(), runN.getBreakdown().getEducation());
            assertEquals(run1.getBreakdown().getFormatting(), runN.getBreakdown().getFormatting());
            assertEquals(run1.getBreakdown().getCompleteness(), runN.getBreakdown().getCompleteness());
        }
    }

    @Test
    @DisplayName("Text Normalization Test: Whitespace, newlines, and control chars produce identical SHA-256 hash")
    void testTextNormalizationAndHashReproducibility() {
        String raw1 = "  Yash  Lodam \r\n Full Stack Engineer \n\n Skills: Java , Spring Boot  ";
        String raw2 = "Yash Lodam\nFull Stack Engineer\n\nSkills: Java , Spring Boot";

        String norm1 = ResumeTextNormalizer.normalize(raw1);
        String norm2 = ResumeTextNormalizer.normalize(raw2);

        assertEquals(norm1, norm2);

        String hash1 = ResumeTextNormalizer.computeSha256Hash(raw1);
        String hash2 = ResumeTextNormalizer.computeSha256Hash(raw2);

        assertEquals(hash1, hash2);
        assertEquals(64, hash1.length());
    }

    @Test
    @DisplayName("Weighted Aggregation Test: 75% Deterministic + 25% Semantic math check")
    void testWeightedAggregationMath() {
        String resumeText = "Yash Lodam\nSoftware Engineer\nEmail: yash@example.com\nExperience: Built Java app.\nEducation: B.Tech Computer Science\nSkills: Java, React";

        AiAnalysisResult aiResult = new AiAnalysisResult();
        aiResult.setOverallScore(90); // AI Semantic Score = 90

        ResumeScoringEngine.EvaluationResult result = scoringEngine.evaluate(resumeText, aiResult);

        assertNotNull(result);
        int detScore = result.getDeterministicScore();
        int semScore = result.getSemanticScore();

        // Authoritative Math: round(0.75 * detScore + 0.25 * semScore)
        int expectedAuthoritative = (int) Math.round((0.75 * detScore) + (0.25 * semScore));
        assertEquals(expectedAuthoritative, result.getOverallScore());
    }

    @Test
    @DisplayName("Non-Resume Document Validation: Non-resume text throws JobPortalException")
    void testNonResumeDocumentRejection() {
        String invoiceText = "INVOICE #1092\nBill To: John Doe\nTotal Due: $500.00\nPayment due upon receipt.\nTax ID: 99-8877665";
        assertThrows(JobPortalException.class, () -> ResumeDocumentValidator.validateResumeContent(invoiceText));

        String shortText = "Hello world, this is a random note.";
        assertThrows(JobPortalException.class, () -> ResumeDocumentValidator.validateResumeContent(shortText));
    }

    @Test
    @DisplayName("Zero Component Scores for Non-Resume Text: Missing sections return 0 points")
    void testZeroComponentScoresForNonResumeText() {
        String randomText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

        ResumeHealthScoreAggregator.AggregationResult result = aggregator.aggregate(randomText, null);
        assertEquals(0, result.getBreakdown().getAtsStructure());
        assertEquals(0, result.getBreakdown().getSkills());
        assertEquals(0, result.getBreakdown().getExperience());
        assertEquals(0, result.getBreakdown().getEducation());
        assertEquals(0, result.getBreakdown().getCompleteness());
        assertTrue(result.getDeterministicScore() <= 10);
    }
}
