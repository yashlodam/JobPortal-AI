package com.jobportal.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jobportal.dto.request.JobApplicationRequest;
import com.jobportal.dto.request.UpdateApplicationStatusRequest;
import com.jobportal.dto.response.JobApplicationResponse;
import com.jobportal.exception.JobPortalException;

public interface JobApplicationService {

    JobApplicationResponse applyToJob(Long jobId, JobApplicationRequest request, String email)
            throws JobPortalException;

    void withdrawApplication(Long applicationId, String email) throws JobPortalException;

    Page<JobApplicationResponse> getMyApplications(String email, Pageable pageable)
            throws JobPortalException;

    Page<JobApplicationResponse> getJobApplications(Long jobId, String email, Pageable pageable)
            throws JobPortalException;

    Page<JobApplicationResponse> getAllRecruiterApplications(String email, Pageable pageable)
            throws JobPortalException;

    JobApplicationResponse updateApplicationStatus(Long applicationId,
            UpdateApplicationStatusRequest request, String email) throws JobPortalException;

    com.jobportal.dto.response.RecruiterDashboardStatsResponse getRecruiterDashboardStats(String email)
            throws JobPortalException;
}
