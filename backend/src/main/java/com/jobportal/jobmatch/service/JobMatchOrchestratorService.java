package com.jobportal.jobmatch.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Profile;
import com.jobportal.entity.User;
import com.jobportal.jobmatch.dto.JobMatchAiResponse;
import com.jobportal.jobmatch.entity.JobMatchAnalysis;
import com.jobportal.jobmatch.enums.MatchStatus;
import com.jobportal.jobmatch.repository.JobMatchAnalysisRepository;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.resumebuilder.entity.ResumeDocument;
import com.jobportal.resumebuilder.repository.ResumeDocumentRepository;
import com.jobportal.resumeanalysis.entity.ResumeAnalysis;
import com.jobportal.resumeanalysis.repository.ResumeAnalysisRepository;
import com.jobportal.resumeanalysis.service.ResumeParserService;

/**
 * Orchestrates hybrid deterministic + AI semantic match score computation.
 *
 * <p><strong>Transaction Isolation Strategy:</strong>
 * DB reading and marking status as PROCESSING occurs in a fast transaction.
 * The external AI invocation occurs COMPLETELY OUTSIDE the database transaction
 * to prevent database connection pool exhaustion.
 * The final result is then committed in a separate isolated transaction.</p>
 */
@Service
public class JobMatchOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(JobMatchOrchestratorService.class);

    private final JobApplicationRepository applicationRepository;
    private final JobMatchAnalysisRepository matchRepository;
    private final ProfileRepository profileRepository;
    private final ResumeDocumentRepository resumeDocumentRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ResumeParserService resumeParserService;
    private final DeterministicJobMatcher deterministicMatcher;
    private final AiJobMatchService aiJobMatchService;

    public JobMatchOrchestratorService(
            JobApplicationRepository applicationRepository,
            JobMatchAnalysisRepository matchRepository,
            ProfileRepository profileRepository,
            ResumeDocumentRepository resumeDocumentRepository,
            DeterministicJobMatcher deterministicMatcher,
            AiJobMatchService aiJobMatchService) {
        this(applicationRepository, matchRepository, profileRepository, resumeDocumentRepository, null, null, deterministicMatcher, aiJobMatchService);
    }

    @Autowired
    public JobMatchOrchestratorService(
            JobApplicationRepository applicationRepository,
            JobMatchAnalysisRepository matchRepository,
            ProfileRepository profileRepository,
            ResumeDocumentRepository resumeDocumentRepository,
            ResumeAnalysisRepository resumeAnalysisRepository,
            ResumeParserService resumeParserService,
            DeterministicJobMatcher deterministicMatcher,
            AiJobMatchService aiJobMatchService) {
        this.applicationRepository = applicationRepository;
        this.matchRepository = matchRepository;
        this.profileRepository = profileRepository;
        this.resumeDocumentRepository = resumeDocumentRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.resumeParserService = resumeParserService;
        this.deterministicMatcher = deterministicMatcher;
        this.aiJobMatchService = aiJobMatchService;
    }

    /**
     * Executes the hybrid matching workflow with AI invocation outside database transaction.
     */
    public JobMatchAnalysis processMatchAnalysis(Long applicationId) {
        log.info("Starting AI Job Match calculation for Application ID=[{}]", applicationId);

        MatchInputContext context = prepareContextAndMarkProcessing(applicationId);
        if (context == null) {
            return null;
        }

        try {
            // ── 1. Deterministic Scoring Layer (60% weight) — Pure in-memory ───
            Set<String> candidateSkills;
            if (context.resumeRawText != null && !context.resumeRawText.isBlank()) {
                candidateSkills = deterministicMatcher.extractCandidateSkills(
                        context.profile, context.resumeDoc, context.uploadedSkills, context.resumeRawText, context.job);
            } else if (context.uploadedSkills != null && !context.uploadedSkills.isEmpty()) {
                candidateSkills = deterministicMatcher.extractCandidateSkills(
                        context.profile, context.resumeDoc, context.uploadedSkills);
            } else {
                candidateSkills = deterministicMatcher.extractCandidateSkills(
                        context.profile, context.resumeDoc);
            }
            if (candidateSkills == null) {
                candidateSkills = Set.of();
            }

            DeterministicJobMatcher.SkillMatchResult skillResult = deterministicMatcher.evaluateSkills(context.job, candidateSkills);

            int expScore = (context.resumeRawText != null && !context.resumeRawText.isBlank())
                    ? deterministicMatcher.evaluateExperience(context.job, context.profile, context.resumeDoc, context.resumeRawText)
                    : deterministicMatcher.evaluateExperience(context.job, context.profile, context.resumeDoc);

            int eduScore = (context.resumeRawText != null && !context.resumeRawText.isBlank())
                    ? deterministicMatcher.evaluateEducation(context.job, context.profile, context.resumeDoc, context.resumeRawText)
                    : deterministicMatcher.evaluateEducation(context.job, context.profile, context.resumeDoc);

            // Pass detected skills to AI if uploadedSkills was empty so AI has full context
            List<String> aiSkillsContext = (context.uploadedSkills != null && !context.uploadedSkills.isEmpty())
                    ? context.uploadedSkills
                    : new ArrayList<>(candidateSkills);

            // ── 2. AI Semantic Scoring Layer (40% weight) — Outside DB Tx ──────
            JobMatchAiResponse aiResponse;
            if (!aiSkillsContext.isEmpty() || (context.uploadedSummary != null && !context.uploadedSummary.isBlank())) {
                aiResponse = aiJobMatchService.analyzeMatch(
                        context.job, context.profile, context.resumeDoc, aiSkillsContext, context.uploadedSummary);
            } else {
                aiResponse = aiJobMatchService.analyzeMatch(
                        context.job, context.profile, context.resumeDoc);
            }
            if (aiResponse == null) {
                aiResponse = new JobMatchAiResponse();
            }

            int roleScore = aiResponse.getRoleRelevanceScore() != null ? aiResponse.getRoleRelevanceScore() : 80;
            int semanticScore = aiResponse.getSemanticScore() != null ? aiResponse.getSemanticScore() : 80;

            // ── 3. Composite Final Match Score (0–100%) ───────────────────────
            double finalScoreDouble =
                    (skillResult.requiredPercentage() * 0.40) +
                    (skillResult.preferredPercentage() * 0.10) +
                    (expScore * 0.10) +
                    (eduScore * 0.10) +
                    (roleScore * 0.15) +
                    (semanticScore * 0.15);

            int finalScore = (int) Math.min(100, Math.max(0, Math.round(finalScoreDouble)));

            // ── 4. Persist result in dedicated write transaction ───────────────
            return persistMatchSuccess(
                    applicationId,
                    finalScore,
                    skillResult,
                    expScore,
                    eduScore,
                    roleScore,
                    semanticScore,
                    aiResponse.getReasoning(),
                    aiResponse.getStrengths(),
                    aiResponse.getRisksOrGaps(),
                    aiResponse.getSuggestedInterviewQuestions(),
                    aiResponse.getSeniorityFit(),
                    "AI_POWERED");

        } catch (Exception e) {
            log.error("AI Job Match processing error for Application ID=[{}]: {}", applicationId, e.getMessage(), e);
            return persistMatchFailure(applicationId, "Match analysis failed during processing. You may retry analysis.");
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public MatchInputContext prepareContextAndMarkProcessing(Long applicationId) {
        JobApplication application = applicationRepository.findById(applicationId).orElse(null);
        if (application == null) {
            log.error("Cannot process match: JobApplication id=[{}] not found", applicationId);
            return null;
        }

        Job job = application.getJob();
        User applicant = application.getApplicant();

        JobMatchAnalysis analysis = matchRepository.findByJobApplicationId(applicationId)
                .orElseGet(() -> {
                    JobMatchAnalysis newRecord = new JobMatchAnalysis();
                    newRecord.setJobApplication(application);
                    newRecord.setStatus(MatchStatus.PROCESSING);
                    return matchRepository.save(newRecord);
                });

        analysis.setStatus(MatchStatus.PROCESSING);
        matchRepository.save(analysis);

        Profile profile = null;
        if (applicant.getEmail() != null && !applicant.getEmail().isBlank()) {
            profile = profileRepository.findByUserEmail(applicant.getEmail()).orElse(null);
        }
        if (profile == null && applicant.getId() != null) {
            profile = profileRepository.findByUserId(applicant.getId()).orElse(null);
        }
        List<ResumeDocument> userDocs = resumeDocumentRepository.findByUserIdOrderByUpdatedAtDesc(applicant.getId());
        ResumeDocument resumeDoc = userDocs.isEmpty() ? null : userDocs.get(0);

        List<String> uploadedSkills = List.of();
        String uploadedSummary = null;
        String resumeRawText = null;

        if (application.getResume() != null) {
            try {
                if (resumeParserService != null) {
                    resumeRawText = resumeParserService.extractText(application.getResume());
                }

                if (resumeAnalysisRepository != null) {
                    Optional<ResumeAnalysis> analysisOpt = resumeAnalysisRepository.findByResumeId(application.getResume().getId());
                    if (analysisOpt.isPresent()) {
                        ResumeAnalysis ra = analysisOpt.get();
                        if (ra.getDetectedSkills() != null && !ra.getDetectedSkills().isEmpty()) {
                            uploadedSkills = ra.getDetectedSkills();
                        }
                        if (ra.getAiSummary() != null && !ra.getAiSummary().isBlank()) {
                            uploadedSummary = ra.getAiSummary();
                        }
                    }
                }

                if (uploadedSummary == null && resumeRawText != null && !resumeRawText.isBlank()) {
                    // Cap at 1500 chars — AI service further trims to 1000 in prompt context
                    uploadedSummary = resumeRawText.length() > 1500 ? resumeRawText.substring(0, 1500) : resumeRawText;
                }
            } catch (Exception e) {
                log.warn("Could not inspect uploaded resume for application {}: {}", applicationId, e.getMessage());
            }
        }

        return new MatchInputContext(job, profile, resumeDoc, uploadedSkills, uploadedSummary, resumeRawText);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public JobMatchAnalysis persistMatchSuccess(
            Long applicationId,
            int finalScore,
            DeterministicJobMatcher.SkillMatchResult skillResult,
            int expScore,
            int eduScore,
            int roleScore,
            int semanticScore,
            String reasoning) {
        return persistMatchSuccess(
                applicationId,
                finalScore,
                skillResult,
                expScore,
                eduScore,
                roleScore,
                semanticScore,
                reasoning,
                List.of(),
                List.of(),
                List.of(),
                null,
                "DETERMINISTIC_RULES");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public JobMatchAnalysis persistMatchSuccess(
            Long applicationId,
            int finalScore,
            DeterministicJobMatcher.SkillMatchResult skillResult,
            int expScore,
            int eduScore,
            int roleScore,
            int semanticScore,
            String reasoning,
            List<String> strengths,
            List<String> risksOrGaps,
            List<String> suggestedInterviewQuestions,
            String seniorityFit,
            String evaluationSource) {

        JobMatchAnalysis analysis = matchRepository.findByJobApplicationId(applicationId)
                .orElseGet(() -> {
                    JobApplication app = applicationRepository.findById(applicationId).orElse(null);
                    JobMatchAnalysis newRecord = new JobMatchAnalysis();
                    newRecord.setJobApplication(app);
                    return newRecord;
                });

        analysis.setMatchPercentage(finalScore);
        analysis.setSkillsMatchPercentage(skillResult.requiredPercentage());
        analysis.setPreferredSkillsMatchPercentage(skillResult.preferredPercentage());
        analysis.setExperienceMatchPercentage(expScore);
        analysis.setEducationMatchPercentage(eduScore);
        analysis.setRoleMatchPercentage(roleScore);
        analysis.setSemanticScore(semanticScore);

        analysis.setMatchedSkills(skillResult.matchedRequired());
        analysis.setMissingSkills(skillResult.missingRequired());
        analysis.setMatchedPreferredSkills(skillResult.matchedPreferred());
        analysis.setMissingPreferredSkills(skillResult.missingPreferred());

        analysis.setAnalysisSummary(reasoning);
        analysis.setStrengths(strengths != null ? strengths : List.of());
        analysis.setRisksOrGaps(risksOrGaps != null ? risksOrGaps : List.of());
        analysis.setSuggestedInterviewQuestions(suggestedInterviewQuestions != null ? suggestedInterviewQuestions : List.of());
        analysis.setSeniorityFit(seniorityFit);
        analysis.setEvaluationSource(evaluationSource != null ? evaluationSource : "AI_POWERED");

        analysis.setStatus(MatchStatus.COMPLETED);
        analysis.setProcessedAt(LocalDateTime.now());
        analysis.setFailureReason(null);

        JobMatchAnalysis saved = matchRepository.save(analysis);

        log.info("AI Job Match COMPLETED for Application ID=[{}]: TotalScore=[{}%] (Skills=[{}%], Exp=[{}%], Role=[{}%], Seniority=[{}])",
                applicationId, finalScore, skillResult.requiredPercentage(), expScore, roleScore, seniorityFit);

        return saved;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public JobMatchAnalysis persistMatchFailure(Long applicationId, String failureReason) {
        JobMatchAnalysis analysis = matchRepository.findByJobApplicationId(applicationId)
                .orElseGet(() -> {
                    JobApplication app = applicationRepository.findById(applicationId).orElse(null);
                    JobMatchAnalysis newRecord = new JobMatchAnalysis();
                    newRecord.setJobApplication(app);
                    return newRecord;
                });

        analysis.setStatus(MatchStatus.FAILED);
        analysis.setFailureReason(failureReason);
        return matchRepository.save(analysis);
    }

    public record MatchInputContext(
            Job job,
            Profile profile,
            ResumeDocument resumeDoc,
            List<String> uploadedSkills,
            String uploadedSummary,
            String resumeRawText) {}
}
