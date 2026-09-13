package com.jobportal.resumeanalysis.scoring.calculators;

import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Calculates Formatting & Document Layout score (0–100) based on section count,
 * optimal word length (250–2500 words), and structural layout.
 */
@Component
public class FormattingScoreCalculator {

    private static final Pattern SECTION_HEADERS = Pattern.compile(
            "\\b(experience|employment|work history|education|skills|technical skills|projects|summary|profile|certifications)\\b",
            Pattern.CASE_INSENSITIVE
    );

    public int calculate(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }

        String lower = text.toLowerCase();
        var matcher = SECTION_HEADERS.matcher(lower);
        int sectionCount = 0;
        while (matcher.find()) {
            sectionCount++;
        }

        if (sectionCount == 0) {
            return 0;
        }

        int score = Math.min(60, sectionCount * 15);

        int wordCount = text.split("\\s+").length;
        if (wordCount >= 200 && wordCount <= 2500) {
            score += 40;
        }

        return Math.min(100, Math.max(0, score));
    }
}
