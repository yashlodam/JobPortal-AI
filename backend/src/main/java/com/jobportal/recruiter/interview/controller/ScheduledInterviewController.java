package com.jobportal.recruiter.interview.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.recruiter.interview.dto.InterviewFeedbackRequest;
import com.jobportal.recruiter.interview.dto.InterviewStatsResponse;
import com.jobportal.recruiter.interview.dto.ScheduleInterviewRequest;
import com.jobportal.recruiter.interview.dto.ScheduledInterviewResponse;
import com.jobportal.recruiter.interview.dto.UpdateInterviewRequest;
import com.jobportal.recruiter.interview.service.ScheduledInterviewService;

import jakarta.validation.Valid;

/**
 * REST controller for Recruiter Interview Management.
 *
 * <h3>Base URL: {@code /api/recruiter/interviews}</h3>
 *
 * <table border="1">
 *   <thead><tr><th>Method</th><th>URL</th><th>Description</th></tr></thead>
 *   <tbody>
 *     <tr><td>POST</td>   <td>/api/recruiter/interviews</td>                            <td>Schedule new interview</td></tr>
 *     <tr><td>GET</td>    <td>/api/recruiter/interviews</td>                            <td>List all interviews (with optional ?filter=upcoming|completed|cancelled|today)</td></tr>
 *     <tr><td>GET</td>    <td>/api/recruiter/interviews/stats</td>                      <td>Dashboard statistics</td></tr>
 *     <tr><td>GET</td>    <td>/api/recruiter/interviews/{id}</td>                       <td>Get single interview</td></tr>
 *     <tr><td>PUT</td>    <td>/api/recruiter/interviews/{id}</td>                       <td>Update/Reschedule interview</td></tr>
 *     <tr><td>PATCH</td>  <td>/api/recruiter/interviews/{id}/status</td>               <td>Change status</td></tr>
 *     <tr><td>POST</td>   <td>/api/recruiter/interviews/{id}/feedback</td>             <td>Submit feedback + complete</td></tr>
 *     <tr><td>DELETE</td> <td>/api/recruiter/interviews/{id}</td>                       <td>Cancel interview</td></tr>
 *     <tr><td>GET</td>    <td>/api/recruiter/interviews/by-application/{appId}</td>    <td>All interviews for an application</td></tr>
 *     <tr><td>GET</td>    <td>/api/candidate/interviews</td>                            <td>Candidate's own interviews</td></tr>
 *   </tbody>
 * </table>
 */
@RestController
public class ScheduledInterviewController {

    private final ScheduledInterviewService service;

    public ScheduledInterviewController(ScheduledInterviewService service) {
        this.service = service;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RECRUITER ENDPOINTS  (/api/recruiter/interviews/*)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/recruiter/interviews
     * Schedule a new interview for a job application.
     */
    @PostMapping("/api/recruiter/interviews")
    public ResponseEntity<ScheduledInterviewResponse> scheduleInterview(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody ScheduleInterviewRequest request) {

        ScheduledInterviewResponse response = service.scheduleInterview(
                principal.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/recruiter/interviews?filter=upcoming|completed|cancelled|today|all
     * List all interviews for the recruiter with optional status filter.
     */
    @GetMapping("/api/recruiter/interviews")
    public ResponseEntity<List<ScheduledInterviewResponse>> getInterviews(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false, defaultValue = "all") String filter) {

        List<ScheduledInterviewResponse> interviews =
                service.getInterviewsForRecruiter(principal.getUsername(), filter);
        return ResponseEntity.ok(interviews);
    }

    /**
     * GET /api/recruiter/interviews/stats
     * Dashboard summary statistics for the recruiter.
     */
    @GetMapping("/api/recruiter/interviews/stats")
    public ResponseEntity<InterviewStatsResponse> getStats(
            @AuthenticationPrincipal UserDetails principal) {

        InterviewStatsResponse stats = service.getStats(principal.getUsername());
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/recruiter/interviews/{id}
     * Get a single interview by ID.
     */
    @GetMapping("/api/recruiter/interviews/{id}")
    public ResponseEntity<ScheduledInterviewResponse> getInterview(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {

        ScheduledInterviewResponse interview = service.getInterview(principal.getUsername(), id);
        return ResponseEntity.ok(interview);
    }

    /**
     * PUT /api/recruiter/interviews/{id}
     * Update or reschedule an existing interview.
     */
    @PutMapping("/api/recruiter/interviews/{id}")
    public ResponseEntity<ScheduledInterviewResponse> updateInterview(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateInterviewRequest request) {

        ScheduledInterviewResponse updated = service.updateInterview(
                principal.getUsername(), id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * PATCH /api/recruiter/interviews/{id}/status
     * Change the lifecycle status of an interview.
     * Body: { "status": "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW" }
     */
    @PatchMapping("/api/recruiter/interviews/{id}/status")
    public ResponseEntity<ScheduledInterviewResponse> updateStatus(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        ScheduledInterviewResponse updated = service.updateStatus(
                principal.getUsername(), id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/recruiter/interviews/{id}/feedback
     * Submit post-interview feedback and rating. Automatically marks interview COMPLETED.
     */
    @PostMapping("/api/recruiter/interviews/{id}/feedback")
    public ResponseEntity<ScheduledInterviewResponse> submitFeedback(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody InterviewFeedbackRequest request) {

        ScheduledInterviewResponse updated = service.submitFeedback(
                principal.getUsername(), id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/recruiter/interviews/{id}
     * Cancel an interview. Sets status to CANCELLED.
     */
    @DeleteMapping("/api/recruiter/interviews/{id}")
    public ResponseEntity<ScheduledInterviewResponse> cancelInterview(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {

        ScheduledInterviewResponse cancelled = service.cancelInterview(
                principal.getUsername(), id);
        return ResponseEntity.ok(cancelled);
    }

    /**
     * GET /api/recruiter/interviews/by-application/{applicationId}
     * Get all interviews linked to a specific job application.
     */
    @GetMapping("/api/recruiter/interviews/by-application/{applicationId}")
    public ResponseEntity<List<ScheduledInterviewResponse>> getByApplication(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long applicationId) {

        List<ScheduledInterviewResponse> interviews = service.getInterviewsByApplication(
                principal.getUsername(), applicationId);
        return ResponseEntity.ok(interviews);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CANDIDATE ENDPOINT  (/api/candidate/interviews)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/candidate/interviews
     * Candidate's own scheduled interviews (no internal notes returned).
     */
    @GetMapping("/api/candidate/interviews")
    public ResponseEntity<List<ScheduledInterviewResponse>> getCandidateInterviews(
            @AuthenticationPrincipal UserDetails principal) {

        List<ScheduledInterviewResponse> interviews =
                service.getInterviewsForCandidate(principal.getUsername());
        return ResponseEntity.ok(interviews);
    }
}
