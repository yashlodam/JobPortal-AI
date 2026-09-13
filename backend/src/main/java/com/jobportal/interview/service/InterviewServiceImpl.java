package com.jobportal.interview.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.entity.Job;
import com.jobportal.entity.Resume;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.interview.dto.AiEvaluationResult;
import com.jobportal.interview.dto.AiQuestionResult;
import com.jobportal.interview.dto.AnswerEvaluationResponse;
import com.jobportal.interview.dto.InterviewReportResponse;
import com.jobportal.interview.dto.InterviewSessionResponse;
import com.jobportal.interview.dto.QuestionResponse;
import com.jobportal.interview.dto.StartInterviewRequest;
import com.jobportal.interview.dto.SubmitAnswerRequest;
import com.jobportal.interview.entity.InterviewAnswer;
import com.jobportal.interview.entity.InterviewQuestion;
import com.jobportal.interview.entity.InterviewSession;
import com.jobportal.interview.enums.InterviewStatus;
import com.jobportal.interview.enums.InterviewTrack;
import com.jobportal.interview.mapper.InterviewMapper;
import com.jobportal.interview.repository.InterviewAnswerRepository;
import com.jobportal.interview.repository.InterviewQuestionRepository;
import com.jobportal.interview.repository.InterviewSessionRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.resumeanalysis.service.ResumeParserService;

/**
 * Service implementation for the AI Mock Interview engine.
 */
@Service
public class InterviewServiceImpl implements InterviewService {

    private static final Logger log = LoggerFactory.getLogger(InterviewServiceImpl.class);

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final ResumeParserService resumeParserService;
    private final AiInterviewService aiInterviewService;
    private final InterviewMapper interviewMapper;

    public InterviewServiceImpl(
            InterviewSessionRepository sessionRepository,
            InterviewQuestionRepository questionRepository,
            InterviewAnswerRepository answerRepository,
            UserRepository userRepository,
            ResumeRepository resumeRepository,
            JobRepository jobRepository,
            ResumeParserService resumeParserService,
            AiInterviewService aiInterviewService,
            InterviewMapper interviewMapper) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.jobRepository = jobRepository;
        this.resumeParserService = resumeParserService;
        this.aiInterviewService = aiInterviewService;
        this.interviewMapper = interviewMapper;
    }

    @Override
    @Transactional
    public InterviewSessionResponse startInterview(StartInterviewRequest request, String email)
            throws JobPortalException {
        User user = findUserByEmail(email);

        // Track validation: RESUME_BASED requires valid resumeId
        if (request.getInterviewTrack() == InterviewTrack.RESUME_BASED) {
            if (request.getResumeId() == null) {
                throw JobPortalException.badRequest("Resume ID is required for RESUME_BASED interview track.");
            }
            validateResumeOwnership(request.getResumeId(), user.getProfile().getId());
        }

        // Track validation: JOB_DESCRIPTION_BASED requires valid jobId
        if (request.getInterviewTrack() == InterviewTrack.JOB_DESCRIPTION_BASED) {
            if (request.getJobId() == null) {
                throw JobPortalException.badRequest("Job ID is required for JOB_DESCRIPTION_BASED interview track.");
            }
            validateJobExists(request.getJobId());
        }

        InterviewSession session = new InterviewSession();
        session.setUser(user);
        session.setInterviewTrack(request.getInterviewTrack());
        session.setInterviewType(request.getInterviewType());
        session.setDifficulty(request.getDifficulty());
        session.setTotalQuestions(request.getTotalQuestions());
        session.setCurrentQuestion(0);
        session.setStatus(InterviewStatus.IN_PROGRESS);
        session.setTrackTitle(request.getTrackTitle());
        session.setTrackId(request.getTrackId());
        session.setResumeId(request.getResumeId());
        session.setJobId(request.getJobId());
        session.setStartedAt(LocalDateTime.now());

        InterviewSession saved = sessionRepository.save(session);
        log.info("Started new interview session id=[{}] for user=[{}] track=[{}] difficulty=[{}]",
                saved.getId(), email, saved.getInterviewTrack(), saved.getDifficulty());

        return interviewMapper.toSessionResponse(saved);
    }

    @Override
    @Transactional
    public QuestionResponse getNextQuestion(Long sessionId, String email) throws JobPortalException {
        InterviewSession session = findSessionAndValidateOwnership(sessionId, email);

        if (session.getStatus() == InterviewStatus.COMPLETED) {
            throw JobPortalException.badRequest("This interview session has already been completed.");
        }

        int targetOrder = session.getCurrentQuestion() + 1;

        if (targetOrder > session.getTotalQuestions()) {
            throw JobPortalException.badRequest("All questions for this interview session have been asked.");
        }

        // Check if question for this order number already exists in DB
        InterviewQuestion existing = questionRepository
                .findBySessionIdAndOrderNumber(sessionId, targetOrder)
                .orElse(null);

        if (existing != null) {
            return interviewMapper.toQuestionResponse(existing);
        }

        // Gather context info for AI (resume text, job description, or general topic)
        String contextInfo = buildContextInfo(session);

        // Gather list of previously asked questions to avoid duplication
        List<String> previousQuestions = questionRepository
                .findBySessionIdOrderByOrderNumberAsc(sessionId)
                .stream()
                .map(InterviewQuestion::getQuestion)
                .toList();

        // Call Spring AI to generate question
        AiQuestionResult aiResult = aiInterviewService.generateQuestion(session, contextInfo, previousQuestions);

        InterviewQuestion question = new InterviewQuestion();
        question.setSession(session);
        question.setQuestion(aiResult.getQuestion());
        question.setExpectedAnswer(aiResult.getExpectedAnswer());
        question.setDifficulty(session.getDifficulty());
        question.setOrderNumber(targetOrder);

        InterviewQuestion savedQuestion = questionRepository.save(question);

        // Update session current question count
        session.setCurrentQuestion(targetOrder);
        sessionRepository.save(session);

        log.info("Generated question [{}/{}] for sessionId=[{}]", targetOrder, session.getTotalQuestions(), sessionId);

        return interviewMapper.toQuestionResponse(savedQuestion);
    }

    @Override
    @Transactional
    public AnswerEvaluationResponse submitAnswer(Long sessionId, SubmitAnswerRequest request, String email)
            throws JobPortalException {
        InterviewSession session = findSessionAndValidateOwnership(sessionId, email);

        InterviewQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> JobPortalException.notFound("Question not found with id: " + request.getQuestionId()));

        if (!question.getSession().getId().equals(sessionId)) {
            throw JobPortalException.badRequest("Question does not belong to this interview session.");
        }

        // Check if answer already submitted for this question
        if (answerRepository.findByQuestionId(question.getId()).isPresent()) {
            throw JobPortalException.badRequest("An answer has already been submitted for this question.");
        }

        // Call Spring AI to evaluate answer
        AiEvaluationResult aiEvaluation = aiInterviewService.evaluateAnswer(question, request.getUserAnswer(), session.getInterviewTrack());

        InterviewAnswer answer = new InterviewAnswer();
        answer.setSession(session);
        answer.setQuestion(question);
        answer.setUserAnswer(request.getUserAnswer());
        answer.setAiFeedback(aiEvaluation.getFeedback());
        answer.setScore(aiEvaluation.getScore());
        answer.setStrengths(aiEvaluation.getStrengths());
        answer.setWeaknesses(aiEvaluation.getWeaknesses());
        answer.setSuggestions(aiEvaluation.getSuggestions());
        answer.setSubmittedAt(LocalDateTime.now());

        InterviewAnswer savedAnswer = answerRepository.save(answer);

        // Always calculate and update running overallScore after every answer submission
        Double avgScore = answerRepository.getAverageScoreForSession(sessionId);
        session.setOverallScore(avgScore != null ? (int) Math.round(avgScore) : 0);

        int totalAnswered = answerRepository.countBySessionId(sessionId);
        if (totalAnswered >= session.getTotalQuestions()) {
            session.setStatus(InterviewStatus.COMPLETED);
            session.setCompletedAt(LocalDateTime.now());
            log.info("Completed interview session id=[{}] — final overallScore=[{}]", sessionId, session.getOverallScore());
        }

        sessionRepository.save(session);
        return interviewMapper.toAnswerEvaluationResponse(savedAnswer);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewSessionResponse getSessionDetails(Long sessionId, String email) throws JobPortalException {
        InterviewSession session = findSessionAndValidateOwnership(sessionId, email);
        return interviewMapper.toSessionResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InterviewSessionResponse> getUserHistory(String email, Pageable pageable) throws JobPortalException {
        User user = findUserByEmail(email);
        return sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId(), pageable)
                .map(interviewMapper::toSessionResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewReportResponse getInterviewReport(Long sessionId, String email) throws JobPortalException {
        InterviewSession session = findSessionAndValidateOwnership(sessionId, email);
        List<InterviewAnswer> answers = answerRepository.findBySessionIdOrderBySubmittedAtAsc(sessionId);
        return interviewMapper.toReportResponse(session, answers);
    }

    @Override
    @Transactional
    public void deleteSession(Long sessionId, String email) throws JobPortalException {
        InterviewSession session = findSessionAndValidateOwnership(sessionId, email);

        // Delete child answers and questions first to prevent foreign key constraint violations
        answerRepository.deleteBySessionId(sessionId);
        questionRepository.deleteBySessionId(sessionId);

        sessionRepository.delete(session);
        log.info("Deleted interview session id=[{}] by user=[{}]", sessionId, email);
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    private User findUserByEmail(String email) throws JobPortalException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("User not found for email: " + email));
    }

    private InterviewSession findSessionAndValidateOwnership(Long sessionId, String email) throws JobPortalException {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> JobPortalException.notFound("Interview session not found with id: " + sessionId));

        if (!session.getUser().getEmail().equals(email)) {
            throw JobPortalException.forbidden("You are not authorized to access this interview session.");
        }
        return session;
    }

    private void validateResumeOwnership(Long resumeId, Long profileId) throws JobPortalException {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));

        if (!resume.getProfile().getId().equals(profileId)) {
            throw JobPortalException.forbidden("You do not own the specified resume.");
        }
    }

    private void validateJobExists(Long jobId) throws JobPortalException {
        if (!jobRepository.existsById(jobId)) {
            throw JobPortalException.notFound("Job not found with id: " + jobId);
        }
    }

    private String buildContextInfo(InterviewSession session) {
        if (session.getInterviewTrack() == InterviewTrack.RESUME_BASED && session.getResumeId() != null) {
            Resume resume = resumeRepository.findById(session.getResumeId()).orElse(null);
            if (resume != null) {
                try {
                    return "RESUME CONTENT:\n" + resumeParserService.extractText(resume);
                } catch (Exception e) {
                    log.warn("Could not extract text from resume id=[{}]: {}", session.getResumeId(), e.getMessage());
                }
            }
        }

        if (session.getInterviewTrack() == InterviewTrack.JOB_DESCRIPTION_BASED && session.getJobId() != null) {
            Job job = jobRepository.findById(session.getJobId()).orElse(null);
            if (job != null) {
                return "JOB TITLE: " + job.getJobTitle() + "\nDESCRIPTION: " + job.getDescription();
            }
        }

        return "";
    }
}
