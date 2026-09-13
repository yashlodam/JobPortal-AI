package com.jobportal.resumeanalysis.scoring.calculators;

import org.springframework.stereotype.Component;

/**
 * Calculates Completeness score (0–100) based on presence of essential contact details
 * (email, phone, LinkedIn/GitHub links) and key resume sections.
 */
@Component
public class CompletenessScoreCalculator {

    public int calculate(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }

        String lower = text.toLowerCase();
        int score = 0;

        if (lower.contains("@")) {
            score += 30;
        }
        if (lower.contains("linkedin.com") || lower.contains("github.com")) {
            score += 30;
        }
        if (lower.contains("phone") || lower.contains("+91") || lower.contains("mobile") || lower.matches(".*\\b\\d{10}\\b.*")) {
            score += 20;
        }
        if (lower.contains("experience") || lower.contains("education") || lower.contains("skills")) {
            score += 20;
        }

        return Math.min(100, Math.max(0, score));
    }
}
