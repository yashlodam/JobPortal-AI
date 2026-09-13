package com.jobportal.resumeanalysis.scoring.calculators;

import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Calculates ATS Structure score (0–100) based on section header presence,
 * parseability, and standard section layout.
 */
@Component
public class AtsStructureCalculator {

    private static final Pattern SECTION_HEADERS = Pattern.compile(
            "\\b(experience|employment|work history|education|skills|technical skills|projects|summary|profile|certifications|achievements)\\b",
            Pattern.CASE_INSENSITIVE
    );

    public int calculate(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }

        String lower = text.toLowerCase();

        var matcher = SECTION_HEADERS.matcher(lower);
        java.util.Set<String> foundSections = new java.util.HashSet<>();
        while (matcher.find()) {
            foundSections.add(matcher.group().toLowerCase());
        }

        if (foundSections.isEmpty()) {
            return 0;
        }

        int score = foundSections.size() * 15;

        if (lower.contains("experience") || lower.contains("work history")) score += 5;
        if (lower.contains("education")) score += 5;

        return Math.min(100, Math.max(0, score));
    }
}
