package com.jobportal.resumeanalysis.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Internal DTO used exclusively to deserialize the structured JSON returned by the AI.
 * Never exposed directly in the API response — mapped to {@link ResumeAnalysisResponse}.
 *
 * <p>{@code @JsonIgnoreProperties(ignoreUnknown = true)} — if the AI adds extra fields,
 * the parser does not throw and the analysis still succeeds.</p>
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiAnalysisResult {

    private Integer overallScore;
    private Integer atsScore;
    private Integer keywordScore;
    private Integer skillScore;
    private Integer experienceScore;
    private Integer educationScore;
    private Integer formattingScore;
    private Integer completenessScore;
    private List<String> strengths;
    private List<String> improvements;
    private List<String> skills;
    private List<String> missingSkills;
    private List<String> recommendedJobs;
    private String summary;

    // ── NEW FIELDS — Senior AI Resume Intelligence ─────────────────────────────

    /**
     * Detected career seniority level.
     * Values: "Fresher", "Junior", "Mid-Level", "Senior", "Lead/Principal", "Executive"
     */
    private String careerLevel;

    /**
     * Detected industry/specialization domain.
     * E.g. "Backend Engineering", "Data Science", "Cybersecurity", "UI/UX Design", "DevOps/Cloud", "FinTech", etc.
     */
    private String industryDomain;

    /**
     * 3-5 targeted interview questions the AI generates for this specific candidate profile.
     * These are role-specific questions a recruiter or hiring manager would ask.
     */
    private List<String> interviewQuestions;

    /**
     * 3-5 concrete resume bullet rewrite suggestions.
     * Each entry is formatted as: "BEFORE: [original] → AFTER: [improved version with metrics]"
     */
    private List<String> resumeRewriteTips;

    /**
     * 2-3 AI-generated ATS-optimized resume bullet examples tailored to this candidate's domain.
     * Ready to copy-paste into the resume.
     */
    private List<String> atsBulletPoints;

    public AiAnalysisResult() {}

    // ── Standard field getters/setters ────────────────────────────────────────

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public Integer getKeywordScore() { return keywordScore; }
    public void setKeywordScore(Integer keywordScore) { this.keywordScore = keywordScore; }

    public Integer getSkillScore() { return skillScore; }
    public void setSkillScore(Integer skillScore) { this.skillScore = skillScore; }

    public Integer getExperienceScore() { return experienceScore; }
    public void setExperienceScore(Integer experienceScore) { this.experienceScore = experienceScore; }

    public Integer getEducationScore() { return educationScore; }
    public void setEducationScore(Integer educationScore) { this.educationScore = educationScore; }

    public Integer getFormattingScore() { return formattingScore; }
    public void setFormattingScore(Integer formattingScore) { this.formattingScore = formattingScore; }

    public Integer getCompletenessScore() { return completenessScore; }
    public void setCompletenessScore(Integer completenessScore) { this.completenessScore = completenessScore; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getImprovements() { return improvements; }
    public void setImprovements(List<String> improvements) { this.improvements = improvements; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getRecommendedJobs() { return recommendedJobs; }
    public void setRecommendedJobs(List<String> recommendedJobs) { this.recommendedJobs = recommendedJobs; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    // ── New field getters/setters ──────────────────────────────────────────────

    public String getCareerLevel() { return careerLevel; }
    public void setCareerLevel(String careerLevel) { this.careerLevel = careerLevel; }

    public String getIndustryDomain() { return industryDomain; }
    public void setIndustryDomain(String industryDomain) { this.industryDomain = industryDomain; }

    public List<String> getInterviewQuestions() { return interviewQuestions; }
    public void setInterviewQuestions(List<String> interviewQuestions) { this.interviewQuestions = interviewQuestions; }

    public List<String> getResumeRewriteTips() { return resumeRewriteTips; }
    public void setResumeRewriteTips(List<String> resumeRewriteTips) { this.resumeRewriteTips = resumeRewriteTips; }

    public List<String> getAtsBulletPoints() { return atsBulletPoints; }
    public void setAtsBulletPoints(List<String> atsBulletPoints) { this.atsBulletPoints = atsBulletPoints; }
}

