package com.jobportal.resumeanalysis.scoring.calculators;

import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Calculates Education & Credentials score (0–100) based on degree mentions,
 * university/college details, GPA/CGPA, and certifications.
 */
@Component
public class EducationScoreCalculator {

    private static final Pattern DEGREES = Pattern.compile(
            "\\b(bachelor|master|b\\.tech|m\\.tech|b\\.e|m\\.e|b\\.sc|m\\.sc|phd|diploma|degree|computer science|information technology|engineering)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CERTIFICATIONS = Pattern.compile(
            "\\b(aws|azure|gcp|certified|certification|oracle|spring|scrum|agile|coursera|udemy|leetcode)\\b",
            Pattern.CASE_INSENSITIVE
    );

    public int calculate(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }

        String lower = text.toLowerCase();
        int score = 0;

        if (countMatches(DEGREES, lower) > 0) {
            score += 50;
        }
        if (countMatches(CERTIFICATIONS, lower) > 0) {
            score += 30;
        }
        if (lower.contains("gpa") || lower.contains("cgpa") || lower.contains("%") || lower.contains("percentage") || lower.contains("university") || lower.contains("college")) {
            score += 20;
        }

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
