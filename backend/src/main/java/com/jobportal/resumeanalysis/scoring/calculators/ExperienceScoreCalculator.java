package com.jobportal.resumeanalysis.scoring.calculators;

import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Calculates Experience & Impact score (0–100) based on work history presence,
 * strong action verbs, and quantified metric impact.
 */
@Component
public class ExperienceScoreCalculator {

    private static final Pattern ACTION_VERBS = Pattern.compile(
            "\\b(built|designed|developed|implemented|engineered|spearheaded|optimized|architected|led|managed|created|scaled|refactored|automated|reduced|increased|delivered)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern METRICS = Pattern.compile(
            "(\\b\\d+(\\.\\d+)?%|\\b\\d+\\s*(ms|s|sec|users|clients|million|k|req/s|fps)\\b|\\b(reduced|improved|increased|boosted|grew)\\s+by\\s+\\d+)",
            Pattern.CASE_INSENSITIVE
    );

    public int calculate(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }

        String lower = text.toLowerCase();
        int score = 0;

        boolean hasExpSection = lower.contains("experience") || lower.contains("employment") || lower.contains("work history") || lower.contains("projects");
        if (hasExpSection) {
            score += 40;
        }

        int verbCount = countMatches(ACTION_VERBS, lower);
        int metricCount = countMatches(METRICS, lower);

        score += Math.min(30, verbCount * 5);
        score += Math.min(30, metricCount * 6);

        return Math.min(100, Math.max(0, score));
    }

    private int countMatches(Pattern pattern, String text) {
        var matcher = pattern.matcher(text);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }
}
