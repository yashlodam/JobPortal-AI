package com.jobportal.resumebuilder.service;

import java.util.List;

import com.jobportal.exception.JobPortalException;
import com.jobportal.resumebuilder.dto.ResumeCreateRequest;
import com.jobportal.resumebuilder.dto.ResumeDocumentResponse;
import com.jobportal.resumebuilder.dto.ResumeUpdateRequest;
import com.jobportal.resumebuilder.dto.SectionReorderRequest;

/**
 * Service interface for structured resume CRUD, duplication, section reordering, and autosave.
 */
public interface ResumeBuilderService {

    ResumeDocumentResponse createResume(ResumeCreateRequest request, String email) throws JobPortalException;

    List<ResumeDocumentResponse> getUserResumes(String email) throws JobPortalException;

    ResumeDocumentResponse getResumeById(Long resumeId, String email) throws JobPortalException;

    ResumeDocumentResponse updateResume(Long resumeId, ResumeUpdateRequest request, String email) throws JobPortalException;

    void deleteResume(Long resumeId, String email) throws JobPortalException;

    ResumeDocumentResponse duplicateResume(Long resumeId, String email) throws JobPortalException;

    ResumeDocumentResponse reorderSection(Long resumeId, SectionReorderRequest request, String email) throws JobPortalException;
}
