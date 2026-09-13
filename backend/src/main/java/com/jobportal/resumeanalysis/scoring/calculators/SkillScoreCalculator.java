package com.jobportal.resumeanalysis.scoring.calculators;

import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Calculates Skill score (0–100) based on detected technical skills count and variety.
 */
@Component
public class SkillScoreCalculator {

    public int calculate(List<String> detectedSkills) {
        if (detectedSkills == null || detectedSkills.isEmpty()) {
            return 0;
        }

        int skillCount = detectedSkills.size();
        int score = skillCount * 8;
        return Math.min(100, Math.max(0, score));
    }
}
