package com.jobportal.jobmatch.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.jobportal.jobmatch.enums.MatchStatus;

/**
 * Public response DTO representing the complete job match breakdown for recruiters.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobMatchResponse {

    private Long id;
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String candidateName;
    private String candidateEmail;

    private Integer matchPercentage;
    private Integer skillsMatchPercentage;
    private Integer experienceMatchPercentage;
    private Integer educationMatchPercentage;
    private Integer roleMatchPercentage;
    private Integer preferredSkillsMatchPercentage;
    private Integer semanticScore;

    private MatchStatus status;

    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> matchedPreferredSkills;
    private List<String> missingPreferredSkills;

    private String analysisSummary;
    private List<String> strengths;
    private List<String> risksOrGaps;
    private List<String> suggestedInterviewQuestions;
    private String seniorityFit;
    private String evaluationSource;
    private String failureReason;
    private LocalDateTime processedAt;

    public JobMatchResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

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
