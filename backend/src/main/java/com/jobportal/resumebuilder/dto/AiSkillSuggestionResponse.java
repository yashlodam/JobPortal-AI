package com.jobportal.resumebuilder.dto;

import java.util.List;

/**
 * AI Structured output response for skill recommendations.
 */
public class AiSkillSuggestionResponse {

    private List<String> recommendedSkills;
    private List<String> missingCategorySkills;

    public AiSkillSuggestionResponse() {}

    public AiSkillSuggestionResponse(List<String> recommendedSkills, List<String> missingCategorySkills) {
        this.recommendedSkills = recommendedSkills;
        this.missingCategorySkills = missingCategorySkills;
    }

    public List<String> getRecommendedSkills() { return recommendedSkills; }
    public void setRecommendedSkills(List<String> recommendedSkills) { this.recommendedSkills = recommendedSkills; }

    public List<String> getMissingCategorySkills() { return missingCategorySkills; }
    public void setMissingCategorySkills(List<String> missingCategorySkills) { this.missingCategorySkills = missingCategorySkills; }
}
