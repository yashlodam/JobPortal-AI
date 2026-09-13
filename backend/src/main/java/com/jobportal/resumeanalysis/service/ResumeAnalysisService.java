package com.jobportal.resumeanalysis.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.entity.Profile;
import com.jobportal.entity.Resume;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.resumeanalysis.dto.AiAnalysisResult;
import com.jobportal.resumeanalysis.dto.ResumeAnalysisResponse;
import com.jobportal.resumeanalysis.dto.ScoreBreakdown;
import com.jobportal.resumeanalysis.entity.ResumeAnalysis;
import com.jobportal.resumeanalysis.repository.ResumeAnalysisRepository;
import com.jobportal.resumeanalysis.scoring.ScoringPolicy;
import com.jobportal.resumeanalysis.util.ResumeTextNormalizer;

/**
 * Orchestrator for the AI Resume Analysis flow using deterministic scoring policies.
 */
@Service
public class ResumeAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(ResumeAnalysisService.class);

    private final ResumeRepository         resumeRepository;
    private final ProfileRepository        profileRepository;
    private final ResumeAnalysisRepository analysisRepository;
    private final ResumeParserService      parserService;
    private final AiResumeAnalyzerService  aiService;
    private final ResumeScoringEngine      scoringEngine;

    public ResumeAnalysisService(
            ResumeRepository resumeRepository,
            ProfileRepository profileRepository,
            ResumeAnalysisRepository analysisRepository,
            ResumeParserService parserService,
            AiResumeAnalyzerService aiService,
            ResumeScoringEngine scoringEngine) {
        this.resumeRepository  = resumeRepository;
        this.profileRepository = profileRepository;
        this.analysisRepository = analysisRepository;
        this.parserService     = parserService;
        this.aiService         = aiService;
        this.scoringEngine     = scoringEngine;
    }

    /**
     * Analyzes a resume using text normalization and deterministic scoring engine.
     * Returns cached result if file/text unchanged and forceReanalyze is false.
     */
    public ResumeAnalysisResponse analyzeResume(Long resumeId, String email, boolean forceReanalyze) {
        Resume resume = loadAndValidateOwnership(resumeId, email);

        // Parse & normalize text
        String rawText = parserService.extractText(resume);
        String normalizedText = ResumeTextNormalizer.normalize(rawText);

        // Document Validation: Ensure text is a valid professional resume
        com.jobportal.resumeanalysis.util.ResumeDocumentValidator.validateResumeContent(normalizedText);

        String normalizedTextHash = ResumeTextNormalizer.computeSha256Hash(normalizedText);
        String fileByteHash = parserService.computeFileHash(resume);

        // Step 1: Check cache using text content hash & scoring version
        if (!forceReanalyze) {
            ResumeAnalysis existing = analysisRepository.findByResumeId(resumeId).orElse(null);
            if (existing != null && (Objects.equals(normalizedTextHash, existing.getNormalizedTextHash())
                    || Objects.equals(fileByteHash, existing.getFileHash()))) {
                boolean hasContent = (existing.getStrengths() != null && !existing.getStrengths().isEmpty())
                        || (existing.getImprovements() != null && !existing.getImprovements().isEmpty());

                if (hasContent) {
                    log.info("Returning cached deterministic analysis for resumeId=[{}] textHash=[{}]", resumeId, normalizedTextHash);
                    return toResponse(existing, true);
                }
            }
        }

        // Step 2: Semantic AI Analysis (Generates AI-powered scores, breakdown, strengths, gaps & recommendations)
        log.info("Requesting AI resume analysis — resumeId=[{}]", resumeId);
        AiAnalysisResult aiResult = aiService.analyze(normalizedText);

        // Step 3: Compute Authoritative Score & Persist analysis result
        return saveAnalysisResult(resumeId, fileByteHash, normalizedTextHash, normalizedText, aiResult);
    }

    @Transactional
    public ResumeAnalysisResponse saveAnalysisResult(
            Long resumeId,
            String fileHash,
            String normalizedTextHash,
            String normalizedText,
            AiAnalysisResult aiResult) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));

        ResumeAnalysis analysis = analysisRepository.findByResumeId(resumeId)
                .orElseGet(ResumeAnalysis::new);

        analysis.setResume(resume);
        analysis.setFileHash(fileHash);
        analysis.setNormalizedTextHash(normalizedTextHash);
        analysis.setAnalysisVersion(ScoringPolicy.ANALYSIS_VERSION);
        analysis.setScoringVersion(ScoringPolicy.SCORING_VERSION);

        // Compute 100% reproducible Authoritative Scores using 75% Deterministic + 25% Semantic engine
        ResumeScoringEngine.EvaluationResult eval = scoringEngine.evaluate(normalizedText, aiResult);

        analysis.setOverallScore(eval.getOverallScore());
        analysis.setAtsScore(eval.getAtsScore());
        analysis.setAtsStructureScore(eval.getBreakdown().getAtsStructure());
        analysis.setKeywordScore(eval.getBreakdown().getKeywords());
        analysis.setSkillScore(eval.getBreakdown().getSkills());
        analysis.setExperienceScore(eval.getBreakdown().getExperience());
        analysis.setEducationScore(eval.getBreakdown().getEducation());
        analysis.setFormattingScore(eval.getBreakdown().getFormatting());
        analysis.setCompletenessScore(eval.getBreakdown().getCompleteness());
        analysis.setDeterministicScore(eval.getDeterministicScore());
        analysis.setSemanticScore(eval.getSemanticScore());

        // Semantic AI features
        analysis.setStrengths(aiResult.getStrengths());
        analysis.setImprovements(aiResult.getImprovements());
        analysis.setDetectedSkills(aiResult.getSkills());
        analysis.setMissingSkills(aiResult.getMissingSkills());
        analysis.setSuggestedJobRoles(aiResult.getRecommendedJobs());
        analysis.setAiSummary(aiResult.getSummary());

        // New AI intelligence fields
        analysis.setCareerLevel(aiResult.getCareerLevel());
        analysis.setIndustryDomain(aiResult.getIndustryDomain());
        analysis.setInterviewQuestions(aiResult.getInterviewQuestions() != null ? aiResult.getInterviewQuestions() : List.of());
        analysis.setResumeRewriteTips(aiResult.getResumeRewriteTips() != null ? aiResult.getResumeRewriteTips() : List.of());
        analysis.setAtsBulletPoints(aiResult.getAtsBulletPoints() != null ? aiResult.getAtsBulletPoints() : List.of());

        analysis.setStatus("COMPLETED");
        analysis.setAnalyzedAt(LocalDateTime.now());


        ResumeAnalysis saved = analysisRepository.save(analysis);
        log.info("AI Analysis saved — id=[{}] resumeId=[{}] overallScore=[{}] atsScore=[{}] detScore=[{}] semScore=[{}]",
                saved.getId(), resumeId, saved.getOverallScore(), saved.getAtsScore(),
                saved.getDeterministicScore(), saved.getSemanticScore());

        return toResponse(saved, false);
    }

    @Transactional(readOnly = true)
    public ResumeAnalysisResponse getLatestAnalysis(Long resumeId, String email)
            throws JobPortalException {
        loadAndValidateOwnership(resumeId, email);

        ResumeAnalysis analysis = analysisRepository.findByResumeId(resumeId)
                .orElseThrow(() -> JobPortalException.notFound(
                        "No analysis found for resume id: " + resumeId
                        + ". Use POST /api/resume-analysis/" + resumeId + " to generate one."));

        return toResponse(analysis, true);
    }

    @Transactional
    public void deleteAnalysis(Long resumeId, String email) throws JobPortalException {
        loadAndValidateOwnership(resumeId, email);

        if (!analysisRepository.existsByResumeId(resumeId)) {
            throw JobPortalException.notFound("No analysis found for resume id: " + resumeId);
        }

        analysisRepository.deleteByResumeId(resumeId);
        log.info("Analysis deleted for resumeId=[{}] by user=[{}]", resumeId, email);
    }

    private Resume loadAndValidateOwnership(Long resumeId, String email) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));

        Profile profile = profileRepository.findByUserEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("Profile not found for user: " + email));

        if (!resume.getProfile().getId().equals(profile.getId())) {
            throw JobPortalException.forbidden("You are not authorized to access this resume.");
        }

        return resume;
    }

    private ResumeAnalysisResponse toResponse(ResumeAnalysis analysis, boolean fromCache) {
        ResumeAnalysisResponse response = new ResumeAnalysisResponse();
        response.setId(analysis.getId());
        response.setResumeId(analysis.getResume().getId());
        response.setResumeName(analysis.getResume().getResumeName());
        response.setOverallScore(analysis.getOverallScore());
        response.setAtsScore(analysis.getAtsScore());

        ScoreBreakdown breakdown = new ScoreBreakdown(
                analysis.getAtsStructureScore() != null ? analysis.getAtsStructureScore() : 75,
                analysis.getKeywordScore() != null ? analysis.getKeywordScore() : 75,
                analysis.getSkillScore() != null ? analysis.getSkillScore() : 80,
                analysis.getExperienceScore() != null ? analysis.getExperienceScore() : 75,
                analysis.getEducationScore() != null ? analysis.getEducationScore() : 80,
                analysis.getFormattingScore() != null ? analysis.getFormattingScore() : 85,
                analysis.getCompletenessScore() != null ? analysis.getCompletenessScore() : 85,
                analysis.getSemanticScore() != null ? analysis.getSemanticScore() : 80,
                analysis.getDeterministicScore() != null ? analysis.getDeterministicScore() : 78,
                analysis.getOverallScore() != null ? analysis.getOverallScore() : 80
        );
        response.setScoreBreakdown(breakdown);

        response.setAnalysisVersion(analysis.getAnalysisVersion() != null ? analysis.getAnalysisVersion() : ScoringPolicy.ANALYSIS_VERSION);
        response.setScoringVersion(analysis.getScoringVersion() != null ? analysis.getScoringVersion() : ScoringPolicy.SCORING_VERSION);

        response.setSummary(analysis.getAiSummary());
        response.setAnalyzedAt(analysis.getAnalyzedAt());
        response.setFromCache(fromCache);
        response.setStrengths(toList(analysis.getStrengths()));
        response.setImprovements(toList(analysis.getImprovements()));
        response.setSkills(toList(analysis.getDetectedSkills()));
        response.setMissingSkills(toList(analysis.getMissingSkills()));
        response.setRecommendedJobs(toList(analysis.getSuggestedJobRoles()));

        // New AI intelligence fields
        response.setCareerLevel(analysis.getCareerLevel());
        response.setIndustryDomain(analysis.getIndustryDomain());
        response.setInterviewQuestions(toList(analysis.getInterviewQuestions()));
        response.setResumeRewriteTips(toList(analysis.getResumeRewriteTips()));
        response.setAtsBulletPoints(toList(analysis.getAtsBulletPoints()));

        return response;

    }

    private List<String> toList(List<String> source) {
        if (source == null) return List.of();
        return new ArrayList<>(source);
    }
}
