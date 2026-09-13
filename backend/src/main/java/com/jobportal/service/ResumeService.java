package com.jobportal.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.jobportal.dto.request.ResumeUpdateRequest;
import com.jobportal.dto.response.ResumeResponse;
import com.jobportal.entity.Resume;
import com.jobportal.exception.JobPortalException;

public interface ResumeService {

    ResumeResponse uploadResume(MultipartFile file, String resumeName, Boolean isDefault, String email) throws Exception;

    List<ResumeResponse> getMyResumes(String email) throws JobPortalException;

    ResumeResponse getResumeById(Long id, String email) throws JobPortalException;

    ResumeResponse updateResume(Long id, ResumeUpdateRequest request, String email) throws JobPortalException;

    void deleteResume(Long id, String email) throws JobPortalException;

    ResumeResponse setDefaultResume(Long id, String email) throws JobPortalException;

    ResumeResponse toResponse(Resume resume);
}
