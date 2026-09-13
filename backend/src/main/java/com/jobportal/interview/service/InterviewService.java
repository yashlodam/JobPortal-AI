package com.jobportal.interview.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jobportal.exception.JobPortalException;
import com.jobportal.interview.dto.AnswerEvaluationResponse;
import com.jobportal.interview.dto.InterviewReportResponse;
import com.jobportal.interview.dto.InterviewSessionResponse;
import com.jobportal.interview.dto.QuestionResponse;
import com.jobportal.interview.dto.StartInterviewRequest;
import com.jobportal.interview.dto.SubmitAnswerRequest;

/**
 * Business service interface for managing AI Mock Interview sessions and flow.
 */
public interface InterviewService {

    /** Starts a new interview session for an authenticated user. */
    InterviewSessionResponse startInterview(StartInterviewRequest request, String email) throws JobPortalException;

    /** Generates or retrieves the next question for an active interview session. */
    QuestionResponse getNextQuestion(Long sessionId, String email) throws JobPortalException;

    /** Submits a candidate's answer and evaluates it using AI. */
    AnswerEvaluationResponse submitAnswer(Long sessionId, SubmitAnswerRequest request, String email) throws JobPortalException;

    /** Retrieves session details and current status. */
    InterviewSessionResponse getSessionDetails(Long sessionId, String email) throws JobPortalException;

    /** Retrieves paginated interview history for the user. */
    Page<InterviewSessionResponse> getUserHistory(String email, Pageable pageable) throws JobPortalException;

    /** Generates the final complete report for a completed or active interview session. */
    InterviewReportResponse getInterviewReport(Long sessionId, String email) throws JobPortalException;

    /** Deletes an interview session and all associated questions and answers. */
    void deleteSession(Long sessionId, String email) throws JobPortalException;
}
