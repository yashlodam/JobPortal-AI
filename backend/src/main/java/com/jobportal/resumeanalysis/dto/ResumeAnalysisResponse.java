package com.jobportal.resumeanalysis.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO returned by the AI Resume Analyzer.
 * Contains structured analysis data & deterministic score breakdown.
 */
public class ResumeAnalysisResponse {

    private Long id;
    private Long resumeId;
    private String resumeName;

    private Integer overallScore;
    private Integer atsScore;
    private ScoreBreakdown scoreBreakdown;

    private String analysisVersion = "v1.0";
    private String scoringVersion = "v1.0";

    private List<String> strengths;
    private List<String> improvements;
    private List<String> skills;
    private List<String> missingSkills;
    private List<String> recommendedJobs;
    private String summary;

    // ── NEW AI Intelligence Fields ──────────────────────────────────────────────

    /** Detected seniority level: "Fresher", "Junior", "Mid-Level", "Senior", "Lead/Principal", "Executive" */
    private String careerLevel;

    /** Detected specialization domain: "Backend Engineering", "Cybersecurity", "Data Science", etc. */
    private String industryDomain;

    /** 3-5 targeted interview questions for this candidate */
    private List<String> interviewQuestions;

    /** 3-5 concrete resume bullet rewrite suggestions (BEFORE → AFTER format) */
    private List<String> resumeRewriteTips;

    /** 2-3 ATS-optimized resume bullet point examples ready to copy-paste */
    private List<String> atsBulletPoints;

    // ─────────────────────────────────────────────────────────────────────────

    private LocalDateTime analyzedAt;
    private boolean fromCache;

    public ResumeAnalysisResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public String getResumeName() { return resumeName; }
    public void setResumeName(String resumeName) { this.resumeName = resumeName; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public ScoreBreakdown getScoreBreakdown() { return scoreBreakdown; }
    public void setScoreBreakdown(ScoreBreakdown scoreBreakdown) { this.scoreBreakdown = scoreBreakdown; }

    public String getAnalysisVersion() { return analysisVersion; }
    public void setAnalysisVersion(String analysisVersion) { this.analysisVersion = analysisVersion; }

    public String getScoringVersion() { return scoringVersion; }
    public void setScoringVersion(String scoringVersion) { this.scoringVersion = scoringVersion; }

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

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }

    public boolean isFromCache() { return fromCache; }
    public void setFromCache(boolean fromCache) { this.fromCache = fromCache; }
}

