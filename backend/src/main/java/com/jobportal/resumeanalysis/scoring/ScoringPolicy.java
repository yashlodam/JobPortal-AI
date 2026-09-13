package com.jobportal.resumeanalysis.scoring;

import java.math.BigDecimal;

/**
 * Centralized scoring policy containing authoritative weights and version tracking.
 * Prevents scattered magic numbers throughout the codebase.
 */
public final class ScoringPolicy {

    private ScoringPolicy() {}

    // ── Version Metadata ─────────────────────────────────────────────────────
    public static final String ANALYSIS_VERSION = "RESUME_ANALYSIS_V1";
    public static final String SCORING_VERSION  = "RESUME_HEALTH_V1";
    public static final String PROMPT_VERSION   = "RESUME_AI_PROMPT_V1";

    // ── Deterministic Health Component Weights (Sums to 1.00) ────────────────
    public static final BigDecimal WEIGHT_ATS_STRUCTURE = new BigDecimal("0.15");
    public static final BigDecimal WEIGHT_KEYWORDS      = new BigDecimal("0.20");
    public static final BigDecimal WEIGHT_SKILLS        = new BigDecimal("0.20");
    public static final BigDecimal WEIGHT_EXPERIENCE    = new BigDecimal("0.20");
    public static final BigDecimal WEIGHT_EDUCATION     = new BigDecimal("0.10");
    public static final BigDecimal WEIGHT_FORMATTING    = new BigDecimal("0.10");
    public static final BigDecimal WEIGHT_COMPLETENESS  = new BigDecimal("0.05");

    // ── Final Authoritative Aggregation Weights (Deterministic vs AI) ─────────
    public static final BigDecimal WEIGHT_DETERMINISTIC_ENGINE = new BigDecimal("0.75");
    public static final BigDecimal WEIGHT_AI_SEMANTIC           = new BigDecimal("0.25");
}
