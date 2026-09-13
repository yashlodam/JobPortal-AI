package com.jobportal.resumeanalysis.service;

import org.springframework.stereotype.Service;

import com.jobportal.resumeanalysis.dto.AiAnalysisResult;
import com.jobportal.resumeanalysis.dto.ScoreBreakdown;
import com.jobportal.resumeanalysis.scoring.ResumeHealthScoreAggregator;
import com.jobportal.resumeanalysis.scoring.ResumeHealthScoreAggregator.AggregationResult;

/**
 * 100% Deterministic & Reproducible Resume Scoring Engine facade.
 * Delegates score calculation to {@link ResumeHealthScoreAggregator}.
 */
@Service
public class ResumeScoringEngine {

    private final ResumeHealthScoreAggregator aggregator;

    public ResumeScoringEngine(ResumeHealthScoreAggregator aggregator) {
        this.aggregator = aggregator;
    }

    public static class EvaluationResult {
        private final int overallScore;
        private final int atsScore;
        private final int deterministicScore;
        private final int semanticScore;
        private final ScoreBreakdown breakdown;

        public EvaluationResult(
                int overallScore,
                int atsScore,
                int deterministicScore,
                int semanticScore,
                ScoreBreakdown breakdown) {
            this.overallScore = overallScore;
            this.atsScore = atsScore;
            this.deterministicScore = deterministicScore;
            this.semanticScore = semanticScore;
            this.breakdown = breakdown;
        }

        public EvaluationResult(int overallScore, int atsScore, ScoreBreakdown breakdown) {
            this(overallScore, atsScore, breakdown.getDeterministicScore(), breakdown.getSemanticScore(), breakdown);
        }

        public int getOverallScore() { return overallScore; }
        public int getAtsScore() { return atsScore; }
        public int getDeterministicScore() { return deterministicScore; }
        public int getSemanticScore() { return semanticScore; }
        public ScoreBreakdown getBreakdown() { return breakdown; }
    }

    /**
     * Computes authoritative score using 75% deterministic engine + 25% AI semantic evaluation.
     */
    public EvaluationResult evaluate(String rawText, AiAnalysisResult aiResult) {
        AggregationResult res = aggregator.aggregate(rawText, aiResult);
        return new EvaluationResult(
                res.getAuthoritativeScore(),
                res.getAtsScore(),
                res.getDeterministicScore(),
                res.getSemanticScore(),
                res.getBreakdown()
        );
    }
}
