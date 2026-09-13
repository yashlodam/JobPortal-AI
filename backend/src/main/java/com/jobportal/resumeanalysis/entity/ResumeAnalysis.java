package com.jobportal.resumeanalysis.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.jobportal.entity.Resume;
import com.jobportal.resumeanalysis.converter.StringListConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Stores the result of a deterministic AI-powered resume analysis.
 */
@Entity
@Table(name = "resume_analysis")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resume_id", nullable = false, unique = true)
    private Resume resume;

    /** File byte MD5 hash. */
    @Column(nullable = false, length = 64)
    private String fileHash;

    /** SHA-256 hash of normalized text content. */
    @Column(name = "normalized_text_hash", length = 64)
    private String normalizedTextHash;

    /** Version tracking. */
    @Column(name = "analysis_version", length = 32)
    private String analysisVersion = "RESUME_ANALYSIS_V1";

    @Column(name = "scoring_version", length = 32)
    private String scoringVersion = "RESUME_HEALTH_V1";

    @Column(name = "prompt_version", length = 32)
    private String promptVersion = "RESUME_AI_PROMPT_V1";

    @Column(name = "model_name", length = 64)
    private String modelName = "openai/gpt-oss-120b";

    /** Overall Score 0-100 (Authoritative Resume Health Score). */
    @Column(nullable = false)
    private Integer overallScore;

    /** ATS Score 0-100. */
    @Column(nullable = false)
    private Integer atsScore;

    /** Component Breakdown Scores (0-100). */
    @Column(name = "ats_structure_score")
    private Integer atsStructureScore = 75;

    @Column(name = "keyword_score")
    private Integer keywordScore = 75;

    @Column(name = "skill_score")
    private Integer skillScore = 80;

    @Column(name = "experience_score")
    private Integer experienceScore = 75;

    @Column(name = "education_score")
    private Integer educationScore = 80;

    @Column(name = "formatting_score")
    private Integer formattingScore = 85;

    @Column(name = "completeness_score")
    private Integer completenessScore = 85;

    @Column(name = "deterministic_score")
    private Integer deterministicScore = 78;

    @Column(name = "semantic_score")
    private Integer semanticScore = 80;

    @Convert(converter = StringListConverter.class)
    @Column(name = "strengths", columnDefinition = "TEXT")
    private List<String> strengths = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "improvements", columnDefinition = "TEXT")
    private List<String> improvements = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "detected_skills", columnDefinition = "TEXT")
    private List<String> detectedSkills = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private List<String> missingSkills = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "suggested_job_roles", columnDefinition = "TEXT")
    private List<String> suggestedJobRoles = new ArrayList<>();

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    /** Detected career seniority level: Fresher / Junior / Mid-Level / Senior / Lead/Principal / Executive */
    @Column(name = "career_level", length = 50)
    private String careerLevel;

    /** Detected industry specialization domain e.g. "Backend Engineering", "Cybersecurity", "Data Science" */
    @Column(name = "industry_domain", length = 100)
    private String industryDomain;

    /** AI-generated targeted interview questions for this candidate's profile */
    @Convert(converter = StringListConverter.class)
    @Column(name = "interview_questions", columnDefinition = "TEXT")
    private List<String> interviewQuestions = new ArrayList<>();

    /** AI-generated concrete resume bullet rewrite suggestions (BEFORE → AFTER format) */
    @Convert(converter = StringListConverter.class)
    @Column(name = "resume_rewrite_tips", columnDefinition = "TEXT")
    private List<String> resumeRewriteTips = new ArrayList<>();

    /** AI-generated ATS-optimized bullet point examples ready to copy-paste */
    @Convert(converter = StringListConverter.class)
    @Column(name = "ats_bullet_points", columnDefinition = "TEXT")
    private List<String> atsBulletPoints = new ArrayList<>();

    @Column(name = "status", length = 20)
    private String status = "COMPLETED";

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(nullable = false)
    private LocalDateTime analyzedAt;

    public ResumeAnalysis() {}


    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }

    public String getFileHash() { return fileHash; }
    public void setFileHash(String fileHash) { this.fileHash = fileHash; }

    public String getNormalizedTextHash() { return normalizedTextHash; }
    public void setNormalizedTextHash(String normalizedTextHash) { this.normalizedTextHash = normalizedTextHash; }

    public String getAnalysisVersion() { return analysisVersion; }
    public void setAnalysisVersion(String analysisVersion) { this.analysisVersion = analysisVersion; }

    public String getScoringVersion() { return scoringVersion; }
    public void setScoringVersion(String scoringVersion) { this.scoringVersion = scoringVersion; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public Integer getAtsStructureScore() { return atsStructureScore; }
    public void setAtsStructureScore(Integer atsStructureScore) { this.atsStructureScore = atsStructureScore; }

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

    public Integer getDeterministicScore() { return deterministicScore; }
    public void setDeterministicScore(Integer deterministicScore) { this.deterministicScore = deterministicScore; }

    public Integer getSemanticScore() { return semanticScore; }
    public void setSemanticScore(Integer semanticScore) { this.semanticScore = semanticScore; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getImprovements() { return improvements; }
    public void setImprovements(List<String> improvements) { this.improvements = improvements; }

    public List<String> getDetectedSkills() { return detectedSkills; }
    public void setDetectedSkills(List<String> detectedSkills) { this.detectedSkills = detectedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getSuggestedJobRoles() { return suggestedJobRoles; }
    public void setSuggestedJobRoles(List<String> suggestedJobRoles) { this.suggestedJobRoles = suggestedJobRoles; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}

