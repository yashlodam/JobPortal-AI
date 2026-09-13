package com.jobportal.interview.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.response.ApiResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.interview.dto.AnswerEvaluationResponse;
import com.jobportal.interview.dto.InterviewReportResponse;
import com.jobportal.interview.dto.InterviewSessionResponse;
import com.jobportal.interview.dto.QuestionResponse;
import com.jobportal.interview.dto.StartInterviewRequest;
import com.jobportal.interview.dto.SubmitAnswerRequest;
import com.jobportal.interview.service.InterviewService;

import jakarta.validation.Valid;

/**
 * REST Controller exposing AI Mock Interview endpoints.
 */
@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    /**
     * Starts a new AI Mock Interview session.
     */
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<InterviewSessionResponse>> startInterview(
            @Valid @RequestBody StartInterviewRequest request,
            Authentication authentication) throws JobPortalException {

        InterviewSessionResponse response = interviewService.startInterview(request, authentication.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview session created successfully", response));
    }

    /**
     * Generates or retrieves the next question for an active interview session.
     */
    @PostMapping("/{sessionId}/next-question")
    public ResponseEntity<ApiResponse<QuestionResponse>> getNextQuestion(
            @PathVariable Long sessionId,
            Authentication authentication) throws JobPortalException {

        QuestionResponse response = interviewService.getNextQuestion(sessionId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Next question generated successfully", response));
    }

    /**
     * Submits a candidate's answer and evaluates it using AI.
     */
    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<ApiResponse<AnswerEvaluationResponse>> submitAnswer(
            @PathVariable Long sessionId,
            @Valid @RequestBody SubmitAnswerRequest request,
            Authentication authentication) throws JobPortalException {

        AnswerEvaluationResponse response = interviewService.submitAnswer(sessionId, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Answer evaluated successfully", response));
    }

    /**
     * Retrieves session details and current progress.
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<InterviewSessionResponse>> getSessionDetails(
            @PathVariable Long sessionId,
            Authentication authentication) throws JobPortalException {

        InterviewSessionResponse response = interviewService.getSessionDetails(sessionId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Retrieves paginated interview history for the authenticated user.
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<InterviewSessionResponse>>> getUserHistory(
            Pageable pageable,
            Authentication authentication) throws JobPortalException {

        Page<InterviewSessionResponse> history = interviewService.getUserHistory(authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    /**
     * Returns the complete AI evaluation report for an interview session.
     */
    @GetMapping("/{sessionId}/report")
    public ResponseEntity<ApiResponse<InterviewReportResponse>> getInterviewReport(
            @PathVariable Long sessionId,
            Authentication authentication) throws JobPortalException {

        InterviewReportResponse report = interviewService.getInterviewReport(sessionId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    /**
     * Deletes an interview session and its records.
     */
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<String>> deleteSession(
            @PathVariable Long sessionId,
            Authentication authentication) throws JobPortalException {

        interviewService.deleteSession(sessionId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Interview session deleted successfully"));
    }
}
