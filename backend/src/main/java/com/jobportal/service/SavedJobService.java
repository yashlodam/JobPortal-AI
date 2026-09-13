package com.jobportal.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jobportal.dto.response.SavedJobResponse;
import com.jobportal.exception.JobPortalException;

public interface SavedJobService {

    SavedJobResponse saveJob(Long jobId, String email) throws JobPortalException;

    void unsaveJob(Long jobId, String email) throws JobPortalException;

    Page<SavedJobResponse> getMySavedJobs(String email, Pageable pageable) throws JobPortalException;

    boolean isJobSaved(Long jobId, String email) throws JobPortalException;
}
