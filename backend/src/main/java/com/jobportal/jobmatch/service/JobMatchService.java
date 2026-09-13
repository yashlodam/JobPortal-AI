package com.jobportal.jobmatch.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jobportal.exception.JobPortalException;
import com.jobportal.jobmatch.dto.CandidateMatchSummaryDTO;
import com.jobportal.jobmatch.dto.JobMatchResponse;

public interface JobMatchService {

    /** Returns full match analysis breakdown for a job application after validating recruiter ownership. */
    JobMatchResponse getMatchAnalysis(Long applicationId, String recruiterEmail) throws JobPortalException;

    /** Triggers an immediate recalculation of the match score. */
    JobMatchResponse recalculateMatch(Long applicationId, String recruiterEmail) throws JobPortalException;

    /** Returns paged candidate applications with match percentage and status for a recruiter's job. */
    Page<CandidateMatchSummaryDTO> getCandidateMatchesForJob(Long jobId, String recruiterEmail, Pageable pageable) throws JobPortalException;

    /** Returns paged candidate applications with match percentage across ALL jobs for a recruiter. */
    Page<CandidateMatchSummaryDTO> getAllCandidateMatchesForRecruiter(String recruiterEmail, Pageable pageable) throws JobPortalException;
}
