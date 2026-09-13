package com.jobportal.resumeanalysis.scoring.calculators;

import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Calculates Keyword Match score (0–100) based on domain key phrases, section headers,
 * and detected skills density.
 */
@Component
public class KeywordScoreCalculator {

    private static final Pattern KEYWORD_PATTERNS = Pattern.compile(
            "\\b(developer|engineer|architecture|framework|api|database|cloud|microservices|agile|ci/cd|rest|fullstack|backend|frontend|testing|security|optimization|performance|system|design)\\b",
            Pattern.CASE_INSENSITIVE
    );

    public int calculate(String text, List<String> detectedSkills) {
        if (text == null || text.isBlank()) {
            return 0;
        }

        String lower = text.toLowerCase();
        int skillCount = (detectedSkills != null) ? detectedSkills.size() : 0;

        var matcher = KEYWORD_PATTERNS.matcher(lower);
        int keywordMatches = 0;
        while (matcher.find()) {
            keywordMatches++;
        }

        if (keywordMatches == 0 && skillCount == 0) {
            return 0;
        }

        int score = (keywordMatches * 5) + (skillCount * 4);
        return Math.min(100, Math.max(0, score));
    }
}
