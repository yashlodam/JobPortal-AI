package com.jobportal.jobmatch.entity;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;

import com.jobportal.entity.Auditable;
import com.jobportal.entity.JobApplication;
import com.jobportal.jobmatch.enums.MatchStatus;
import com.jobportal.resumeanalysis.converter.StringListConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Stores the hybrid (deterministic + AI semantic) match score and breakdown
 * for a specific candidate's {@link JobApplication}.
 */
@Entity
@Table(
    name = "job_match_analyses",
    indexes = {
        @Index(name = "idx_job_match_application", columnList = "job_application_id"),
        @Index(name = "idx_job_match_status",      columnList = "status"),
        @Index(name = "idx_job_match_percentage",  columnList = "match_percentage")
    }
)
public class JobMatchAnalysis extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * One-to-one relationship with the application.
     * Each job application has exactly one analysis record.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_application_id", nullable = false, unique = true)
    private JobApplication jobApplication;

    /** Total composite match percentage (0–100). */
    @Column(name = "match_percentage")
    private Integer matchPercentage = 0;

    /** Required skills match score (0–100). */
    @Column(name = "skills_match_percentage")
    private Integer skillsMatchPercentage = 0;

    /** Experience duration/range match score (0–100). */
    @Column(name = "experience_match_percentage")
    private Integer experienceMatchPercentage = 0;

    /** Education degree/qualification match score (0–100). */
    @Column(name = "education_match_percentage")
    private Integer educationMatchPercentage = 0;

    /** Role and domain alignment score (0–100). */
    @Column(name = "role_match_percentage")
    private Integer roleMatchPercentage = 0;

    /** Preferred/nice-to-have skills match score (0–100). */
    @Column(name = "preferred_skills_match_percentage")
    private Integer preferredSkillsMatchPercentage = 0;

    /** AI semantic relevance score (0–100). */
    @Column(name = "semantic_score")
    private Integer semanticScore = 0;

    /** Processing status of the analysis. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MatchStatus status = MatchStatus.PENDING;

    /**
     * Matched required skills (e.g. ["Java", "Spring Boot", "PostgreSQL"]).
     * Stored as JSON array text via StringListConverter.
     */
    @Convert(converter = StringListConverter.class)
    @Column(name = "matched_skills", columnDefinition = "TEXT")
    private List<String> matchedSkills = new ArrayList<>();

    /** Missing required skills (e.g. ["Kafka", "AWS"]). */
    @Convert(converter = StringListConverter.class)
    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private List<String> missingSkills = new ArrayList<>();

    /** Matched preferred / optional skills. */
    @Convert(converter = StringListConverter.class)
    @Column(name = "matched_preferred_skills", columnDefinition = "TEXT")
    private List<String> matchedPreferredSkills = new ArrayList<>();

    /** Missing preferred / optional skills. */
    @Convert(converter = StringListConverter.class)
    @Column(name = "missing_preferred_skills", columnDefinition = "TEXT")
    private List<String> missingPreferredSkills = new ArrayList<>();

    /** AI-generated plain-English summary of candidate-job alignment. */
    @Column(name = "analysis_summary", columnDefinition = "TEXT")
    private String analysisSummary;

    /** Key candidate strengths identified by AI. */
    @Convert(converter = StringListConverter.class)
    @Column(name = "strengths", columnDefinition = "TEXT")
    private List<String> strengths = new ArrayList<>();

    /** Potential skill gaps, risks, or red flags identified by AI. */
    @Convert(converter = StringListConverter.class)
    @Column(name = "risks_or_gaps", columnDefinition = "TEXT")
    private List<String> risksOrGaps = new ArrayList<>();

    /** Tailored screening interview questions recommended for the recruiter. */
    @Convert(converter = StringListConverter.class)
    @Column(name = "suggested_interview_questions", columnDefinition = "TEXT")
    private List<String> suggestedInterviewQuestions = new ArrayList<>();

    /** Seniority fit assessment: STRONG_FIT, GOOD_FIT, GROWTH_CANDIDATE, OVERQUALIFIED, UNALIGNED. */
    @Column(name = "seniority_fit", length = 50)
    private String seniorityFit;

    /** Evaluation mode: AI_POWERED vs DETERMINISTIC_RULES. */
    @Column(name = "evaluation_source", length = 50)
    private String evaluationSource = "AI_POWERED";

    /** Safe error message if AI matching failed. */
    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    /** Timestamp when the match calculation completed. */
    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public JobMatchAnalysis() {}

    // ── Getters & Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public JobApplication getJobApplication() { return jobApplication; }
    public void setJobApplication(JobApplication jobApplication) { this.jobApplication = jobApplication; }

    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }

    public Integer getSkillsMatchPercentage() { return skillsMatchPercentage; }
    public void setSkillsMatchPercentage(Integer skillsMatchPercentage) { this.skillsMatchPercentage = skillsMatchPercentage; }

    public Integer getExperienceMatchPercentage() { return experienceMatchPercentage; }
    public void setExperienceMatchPercentage(Integer experienceMatchPercentage) { this.experienceMatchPercentage = experienceMatchPercentage; }

    public Integer getEducationMatchPercentage() { return educationMatchPercentage; }
    public void setEducationMatchPercentage(Integer educationMatchPercentage) { this.educationMatchPercentage = educationMatchPercentage; }

    public Integer getRoleMatchPercentage() { return roleMatchPercentage; }
    public void setRoleMatchPercentage(Integer roleMatchPercentage) { this.roleMatchPercentage = roleMatchPercentage; }

    public Integer getPreferredSkillsMatchPercentage() { return preferredSkillsMatchPercentage; }
    public void setPreferredSkillsMatchPercentage(Integer preferredSkillsMatchPercentage) { this.preferredSkillsMatchPercentage = preferredSkillsMatchPercentage; }

    public Integer getSemanticScore() { return semanticScore; }
    public void setSemanticScore(Integer semanticScore) { this.semanticScore = semanticScore; }

    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getMatchedPreferredSkills() { return matchedPreferredSkills; }
    public void setMatchedPreferredSkills(List<String> matchedPreferredSkills) { this.matchedPreferredSkills = matchedPreferredSkills; }

    public List<String> getMissingPreferredSkills() { return missingPreferredSkills; }
    public void setMissingPreferredSkills(List<String> missingPreferredSkills) { this.missingPreferredSkills = missingPreferredSkills; }

    public String getAnalysisSummary() { return analysisSummary; }
    public void setAnalysisSummary(String analysisSummary) { this.analysisSummary = analysisSummary; }

    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }

    public List<String> getRisksOrGaps() { return risksOrGaps; }
    public void setRisksOrGaps(List<String> risksOrGaps) { this.risksOrGaps = risksOrGaps; }

    public List<String> getSuggestedInterviewQuestions() { return suggestedInterviewQuestions; }
    public void setSuggestedInterviewQuestions(List<String> suggestedInterviewQuestions) { this.suggestedInterviewQuestions = suggestedInterviewQuestions; }

    public String getSeniorityFit() { return seniorityFit; }
    public void setSeniorityFit(String seniorityFit) { this.seniorityFit = seniorityFit; }

    public String getEvaluationSource() { return evaluationSource; }
    public void setEvaluationSource(String evaluationSource) { this.evaluationSource = evaluationSource; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}
