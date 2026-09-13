package com.jobportal.resumeanalysis.scoring;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Component;

import com.jobportal.resumeanalysis.dto.AiAnalysisResult;
import com.jobportal.resumeanalysis.dto.ScoreBreakdown;
import com.jobportal.resumeanalysis.scoring.calculators.AtsStructureCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.CompletenessScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.EducationScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.ExperienceScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.FormattingScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.KeywordScoreCalculator;
import com.jobportal.resumeanalysis.scoring.calculators.SkillScoreCalculator;
import com.jobportal.resumeanalysis.util.ResumeTextNormalizer;

/**
 * Aggregates component scores into a 100% reproducible Authoritative Resume Health Score.
 * Math: Final Health Score = round(0.75 * DeterministicScore + 0.25 * SemanticScore)
 */
@Component
public class ResumeHealthScoreAggregator {

    private final AtsStructureCalculator atsStructureCalculator;
    private final KeywordScoreCalculator keywordScoreCalculator;
    private final SkillScoreCalculator skillScoreCalculator;
    private final ExperienceScoreCalculator experienceScoreCalculator;
    private final EducationScoreCalculator educationScoreCalculator;
    private final FormattingScoreCalculator formattingScoreCalculator;
    private final CompletenessScoreCalculator completenessScoreCalculator;

    public ResumeHealthScoreAggregator(
            AtsStructureCalculator atsStructureCalculator,
            KeywordScoreCalculator keywordScoreCalculator,
            SkillScoreCalculator skillScoreCalculator,
            ExperienceScoreCalculator experienceScoreCalculator,
            EducationScoreCalculator educationScoreCalculator,
            FormattingScoreCalculator formattingScoreCalculator,
            CompletenessScoreCalculator completenessScoreCalculator) {
        this.atsStructureCalculator = atsStructureCalculator;
        this.keywordScoreCalculator = keywordScoreCalculator;
        this.skillScoreCalculator = skillScoreCalculator;
        this.experienceScoreCalculator = experienceScoreCalculator;
        this.educationScoreCalculator = educationScoreCalculator;
        this.formattingScoreCalculator = formattingScoreCalculator;
        this.completenessScoreCalculator = completenessScoreCalculator;
    }

    public static class AggregationResult {
        private final int authoritativeScore;
        private final int atsScore;
        private final int deterministicScore;
        private final int semanticScore;
        private final ScoreBreakdown breakdown;

        public AggregationResult(
                int authoritativeScore,
                int atsScore,
                int deterministicScore,
                int semanticScore,
                ScoreBreakdown breakdown) {
            this.authoritativeScore = authoritativeScore;
            this.atsScore = atsScore;
            this.deterministicScore = deterministicScore;
            this.semanticScore = semanticScore;
            this.breakdown = breakdown;
        }

        public int getAuthoritativeScore() { return authoritativeScore; }
        public int getAtsScore() { return atsScore; }
        public int getDeterministicScore() { return deterministicScore; }
        public int getSemanticScore() { return semanticScore; }
        public ScoreBreakdown getBreakdown() { return breakdown; }
    }

    /**
     * Aggregates sub-scores and produces the authoritative score.
     *
     * @param rawText raw or normalized resume text
     * @param aiResult semantic AI analysis result (can be null for pure deterministic mode)
     * @return AggregationResult
     */
    public AggregationResult aggregate(String rawText, AiAnalysisResult aiResult) {
        String text = ResumeTextNormalizer.normalize(rawText);

        List<String> detectedSkills = aiResult != null && aiResult.getSkills() != null
                ? aiResult.getSkills()
                : List.of();

        // 1. Calculate deterministic component sub-scores (0–100)
        int atsStructure = atsStructureCalculator.calculate(text);
        int keywords     = keywordScoreCalculator.calculate(text, detectedSkills);
        int skills       = skillScoreCalculator.calculate(detectedSkills);
        int experience   = experienceScoreCalculator.calculate(text);
        int education    = educationScoreCalculator.calculate(text);
        int formatting   = formattingScoreCalculator.calculate(text);
        int completeness = completenessScoreCalculator.calculate(text);

        // 2. Compute weighted Deterministic Score using ScoringPolicy weights
        BigDecimal calcDet = BigDecimal.valueOf(atsStructure).multiply(ScoringPolicy.WEIGHT_ATS_STRUCTURE)
                .add(BigDecimal.valueOf(keywords).multiply(ScoringPolicy.WEIGHT_KEYWORDS))
                .add(BigDecimal.valueOf(skills).multiply(ScoringPolicy.WEIGHT_SKILLS))
                .add(BigDecimal.valueOf(experience).multiply(ScoringPolicy.WEIGHT_EXPERIENCE))
                .add(BigDecimal.valueOf(education).multiply(ScoringPolicy.WEIGHT_EDUCATION))
                .add(BigDecimal.valueOf(formatting).multiply(ScoringPolicy.WEIGHT_FORMATTING))
                .add(BigDecimal.valueOf(completeness).multiply(ScoringPolicy.WEIGHT_COMPLETENESS));

        int deterministicScore = calcDet.setScale(0, RoundingMode.HALF_UP).intValue();

        // 3. Extract and bound AI Semantic Score (0–100)
        int rawSemantic = (aiResult != null && aiResult.getOverallScore() != null)
                ? aiResult.getOverallScore()
                : (aiResult != null && aiResult.getAtsScore() != null ? aiResult.getAtsScore() : deterministicScore);
        int semanticScore = Math.min(100, Math.max(0, rawSemantic));

        // 4. Compute Final Authoritative Health Score: 0.75 * Deterministic + 0.25 * Semantic
        BigDecimal calcFinal = BigDecimal.valueOf(deterministicScore).multiply(ScoringPolicy.WEIGHT_DETERMINISTIC_ENGINE)
                .add(BigDecimal.valueOf(semanticScore).multiply(ScoringPolicy.WEIGHT_AI_SEMANTIC));

        int finalAuthoritativeScore = calcFinal.setScale(0, RoundingMode.HALF_UP).intValue();
        finalAuthoritativeScore = Math.min(100, Math.max(0, finalAuthoritativeScore));

        // Compute ATS Score (Structure + Keywords + Completeness weighted)
        BigDecimal calcAts = BigDecimal.valueOf(atsStructure).multiply(new BigDecimal("0.40"))
                .add(BigDecimal.valueOf(keywords).multiply(new BigDecimal("0.40")))
                .add(BigDecimal.valueOf(completeness).multiply(new BigDecimal("0.20")));
        int atsScore = calcAts.setScale(0, RoundingMode.HALF_UP).intValue();

        ScoreBreakdown breakdown = new ScoreBreakdown(
                atsStructure,
                keywords,
                skills,
                experience,
                education,
                formatting,
                completeness,
                semanticScore,
                deterministicScore,
                finalAuthoritativeScore
        );

        return new AggregationResult(
                finalAuthoritativeScore,
                atsScore,
                deterministicScore,
                semanticScore,
                breakdown
        );
    }
}
