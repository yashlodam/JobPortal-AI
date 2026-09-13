package com.jobportal.jobmatch.dto;

import java.util.List;

/**
 * Structured response mapped automatically by Spring AI {@code ChatClient.entity(JobMatchAiResponse.class)}.
 */
public class JobMatchAiResponse {

    private Integer semanticScore;
    private Integer roleRelevanceScore;
    private Integer technicalRelevanceScore;
    private Integer educationRelevanceScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private String reasoning;
    private List<String> strengths;
    private List<String> risksOrGaps;
    private List<String> suggestedInterviewQuestions;
    private String seniorityFit;

    public JobMatchAiResponse() {}

    public Integer getSemanticScore() { return semanticScore; }
    public void setSemanticScore(Integer semanticScore) { this.semanticScore = semanticScore; }

    public Integer getRoleRelevanceScore() { return roleRelevanceScore; }
    public void setRoleRelevanceScore(Integer roleRelevanceScore) { this.roleRelevanceScore = roleRelevanceScore; }

    public Integer getTechnicalRelevanceScore() { return technicalRelevanceScore; }
    public void setTechnicalRelevanceScore(Integer technicalRelevanceScore) { this.technicalRelevanceScore = technicalRelevanceScore; }

    public Integer getEducationRelevanceScore() { return educationRelevanceScore; }
    public void setEducationRelevanceScore(Integer educationRelevanceScore) { this.educationRelevanceScore = educationRelevanceScore; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getRisksOrGaps() { return risksOrGaps; }
    public void setRisksOrGaps(List<String> risksOrGaps) { this.risksOrGaps = risksOrGaps; }

    public List<String> getSuggestedInterviewQuestions() { return suggestedInterviewQuestions; }
    public void setSuggestedInterviewQuestions(List<String> suggestedInterviewQuestions) { this.suggestedInterviewQuestions = suggestedInterviewQuestions; }

    public String getSeniorityFit() { return seniorityFit; }
    public void setSeniorityFit(String seniorityFit) { this.seniorityFit = seniorityFit; }
}
