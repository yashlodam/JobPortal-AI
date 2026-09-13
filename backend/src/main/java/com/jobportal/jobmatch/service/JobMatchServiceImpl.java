package com.jobportal.jobmatch.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.jobmatch.dto.CandidateMatchSummaryDTO;
import com.jobportal.jobmatch.dto.JobMatchResponse;
import com.jobportal.jobmatch.entity.JobMatchAnalysis;
import com.jobportal.jobmatch.repository.JobMatchAnalysisRepository;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.UserRepository;

@Service
public class JobMatchServiceImpl implements JobMatchService {

    private static final Logger log = LoggerFactory.getLogger(JobMatchServiceImpl.class);

    private final JobMatchAnalysisRepository matchRepository;
    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final RecruiterRepository recruiterRepository;
    private final UserRepository userRepository;
    private final JobMatchOrchestratorService orchestratorService;
    private final com.jobportal.service.RecruiterAuthorizationService recruiterAuthorizationService;

    public JobMatchServiceImpl(
            JobMatchAnalysisRepository matchRepository,
            JobApplicationRepository applicationRepository,
            JobRepository jobRepository,
            RecruiterRepository recruiterRepository,
            UserRepository userRepository,
            JobMatchOrchestratorService orchestratorService,
            com.jobportal.service.RecruiterAuthorizationService recruiterAuthorizationService) {
        this.matchRepository = matchRepository;
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.recruiterRepository = recruiterRepository;
        this.userRepository = userRepository;
        this.orchestratorService = orchestratorService;
        this.recruiterAuthorizationService = recruiterAuthorizationService;
    }

    @Override
    @Transactional
    public JobMatchResponse getMatchAnalysis(Long applicationId, String recruiterEmail) throws JobPortalException {
        Recruiter recruiter = findRecruiterByEmail(recruiterEmail);

        JobMatchAnalysis analysis = matchRepository.findByApplicationIdAndRecruiterId(applicationId, recruiter.getId())
                .orElse(null);

        if (analysis == null) {
            // Check if application exists
            JobApplication app = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> JobPortalException.notFound("Job application not found with id: " + applicationId));

            if (!app.getJob().getRecruiter().getId().equals(recruiter.getId())) {
                throw JobPortalException.forbidden("You are not authorized to view match analysis for this candidate.");
            }

            // If not analyzed yet, run analysis synchronously
            analysis = orchestratorService.processMatchAnalysis(applicationId);
        }

        return toResponse(analysis);
    }

    @Override
    @Transactional
    public JobMatchResponse recalculateMatch(Long applicationId, String recruiterEmail) throws JobPortalException {
        Recruiter recruiter = findRecruiterByEmail(recruiterEmail);

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> JobPortalException.notFound("Job application not found with id: " + applicationId));

        if (!app.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw JobPortalException.forbidden("You are not authorized to recalculate match for this job application.");
        }

        JobMatchAnalysis analysis = orchestratorService.processMatchAnalysis(applicationId);
        return toResponse(analysis);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CandidateMatchSummaryDTO> getCandidateMatchesForJob(Long jobId, String recruiterEmail, Pageable pageable) throws JobPortalException {
        Recruiter recruiter = findRecruiterByEmail(recruiterEmail);

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> JobPortalException.notFound("Job not found with id: " + jobId));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw JobPortalException.forbidden("You can only view candidates for jobs posted by your organization.");
        }

        return matchRepository.findCandidatesByJobIdAndRecruiterId(jobId, recruiter.getId(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CandidateMatchSummaryDTO> getAllCandidateMatchesForRecruiter(String recruiterEmail, Pageable pageable) throws JobPortalException {
        Recruiter recruiter = findRecruiterByEmail(recruiterEmail);
        return matchRepository.findAllCandidatesByRecruiterId(recruiter.getId(), pageable);
    }

    // ── Helper Methods ────────────────────────────────────────────────────────

    private Recruiter findRecruiterByEmail(String email) throws JobPortalException {
        return recruiterAuthorizationService.requireApprovedOrPendingRecruiter(email);
    }

    private JobMatchResponse toResponse(JobMatchAnalysis entity) {
        if (entity == null) return null;

        JobMatchResponse dto = new JobMatchResponse();
        dto.setId(entity.getId());
        dto.setStatus(entity.getStatus());
        dto.setMatchPercentage(entity.getMatchPercentage());
        dto.setSkillsMatchPercentage(entity.getSkillsMatchPercentage());
        dto.setExperienceMatchPercentage(entity.getExperienceMatchPercentage());
        dto.setEducationMatchPercentage(entity.getEducationMatchPercentage());
        dto.setRoleMatchPercentage(entity.getRoleMatchPercentage());
        dto.setPreferredSkillsMatchPercentage(entity.getPreferredSkillsMatchPercentage());
        dto.setSemanticScore(entity.getSemanticScore());

        dto.setMatchedSkills(entity.getMatchedSkills());
        dto.setMissingSkills(entity.getMissingSkills());
        dto.setMatchedPreferredSkills(entity.getMatchedPreferredSkills());
        dto.setMissingPreferredSkills(entity.getMissingPreferredSkills());

        dto.setAnalysisSummary(entity.getAnalysisSummary());
        dto.setStrengths(entity.getStrengths());
        dto.setRisksOrGaps(entity.getRisksOrGaps());
        dto.setSuggestedInterviewQuestions(entity.getSuggestedInterviewQuestions());
        dto.setSeniorityFit(entity.getSeniorityFit());
        dto.setEvaluationSource(entity.getEvaluationSource());
        dto.setFailureReason(entity.getFailureReason());
        dto.setProcessedAt(entity.getProcessedAt());

        if (entity.getJobApplication() != null) {
            dto.setApplicationId(entity.getJobApplication().getId());
            if (entity.getJobApplication().getJob() != null) {
                dto.setJobId(entity.getJobApplication().getJob().getId());
                dto.setJobTitle(entity.getJobApplication().getJob().getJobTitle());
            }
            if (entity.getJobApplication().getApplicant() != null) {
                dto.setCandidateName(entity.getJobApplication().getApplicant().getName());
                dto.setCandidateEmail(entity.getJobApplication().getApplicant().getEmail());
            }
        }

        return dto;
    }
}
