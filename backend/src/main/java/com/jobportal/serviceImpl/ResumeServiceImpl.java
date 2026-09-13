package com.jobportal.serviceImpl;

import java.util.List;


import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.dto.request.ResumeUpdateRequest;
import com.jobportal.dto.response.ResumeResponse;
import com.jobportal.entity.Profile;
import com.jobportal.entity.Resume;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.resumeanalysis.repository.ResumeAnalysisRepository;
import com.jobportal.service.ResumeService;
import com.jobportal.utility.FileStorageService;

/**
 * Service implementation for managing applicant resumes.
 * Supports multi-resume uploads, default resume toggling, and metadata management.
 */
@Service
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final ProfileRepository profileRepository;
    private final FileStorageService fileStorageService;
    private final ResumeAnalysisRepository analysisRepository;
    private final JobApplicationRepository applicationRepository;
    private final JdbcTemplate jdbcTemplate;

    public ResumeServiceImpl(
            ResumeRepository resumeRepository,
            ProfileRepository profileRepository,
            FileStorageService fileStorageService,
            ResumeAnalysisRepository analysisRepository,
            JobApplicationRepository applicationRepository,
            JdbcTemplate jdbcTemplate) {
        this.resumeRepository = resumeRepository;
        this.profileRepository = profileRepository;
        this.fileStorageService = fileStorageService;
        this.analysisRepository = analysisRepository;
        this.applicationRepository = applicationRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public ResumeResponse uploadResume(MultipartFile file, String resumeName, Boolean isDefault, String email)
            throws Exception {
        if (file == null || file.isEmpty()) {
            throw JobPortalException.badRequest("Please select a valid file to upload.");
        }

        Profile profile = findProfileByEmail(email);
        String originalFileName = file.getOriginalFilename();

        String name = (resumeName != null && !resumeName.isBlank())
                ? resumeName.trim()
                : originalFileName;

        // ── Deduplication: Check if any resumes with the same fileName already exist for this profile ──
        List<Resume> existingList = resumeRepository.findByProfileIdAndFileNameOrderByIdDesc(profile.getId(), originalFileName);

        if (!existingList.isEmpty()) {
            Resume existing = existingList.get(0); // newest resume

            // If there were multiple pre-existing duplicate rows, clean them up
            if (existingList.size() > 1) {
                for (int i = 1; i < existingList.size(); i++) {
                    Resume duplicate = existingList.get(i);
                    fileStorageService.delete(duplicate.getResumeUrl());
                    applicationRepository.nullifyResumeReference(duplicate.getId());
                    cleanResumeAnalysisData(duplicate.getId());
                    resumeRepository.delete(duplicate);
                }
            }

            // Delete old physical file of the main record
            fileStorageService.delete(existing.getResumeUrl());

            // Clear old resume analysis so fresh analysis will be generated for the updated file
            cleanResumeAnalysisData(existing.getId());

            // Store new physical file on disk
            String newPath = fileStorageService.store(file, "resume");

            existing.setResumeName(name);
            existing.setResumeUrl(newPath);
            existing.setFileSizeBytes(file.getSize());
            existing.setContentType(file.getContentType());

            if (Boolean.TRUE.equals(isDefault) && !Boolean.TRUE.equals(existing.getIsDefault())) {
                resumeRepository.unsetDefaultResumesForProfile(profile.getId());
                existing.setIsDefault(true);
            }

            Resume updated = resumeRepository.save(existing);
            return toResponse(updated);
        }

        // ── New Resume Upload ──
        long existingCount = resumeRepository.countByProfileId(profile.getId());
        boolean shouldBeDefault = Boolean.TRUE.equals(isDefault) || existingCount == 0;

        if (shouldBeDefault && existingCount > 0) {
            resumeRepository.unsetDefaultResumesForProfile(profile.getId());
        }

        String path = fileStorageService.store(file, "resume");

        Resume resume = new Resume();
        resume.setProfile(profile);
        resume.setResumeName(name);
        resume.setFileName(originalFileName);
        resume.setResumeUrl(path);
        resume.setFileSizeBytes(file.getSize());
        resume.setContentType(file.getContentType());
        resume.setIsDefault(shouldBeDefault);

        Resume saved = resumeRepository.save(resume);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeResponse> getMyResumes(String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        return resumeRepository.findByProfileIdOrderByIsDefaultDescCreatedAtDesc(profile.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeResponse getResumeById(Long id, String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Resume resume = findResumeByIdAndValidateOwnership(id, profile.getId());
        return toResponse(resume);
    }

    @Override
    @Transactional
    public ResumeResponse updateResume(Long id, ResumeUpdateRequest request, String email)
            throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Resume resume = findResumeByIdAndValidateOwnership(id, profile.getId());

        if (request.getResumeName() != null && !request.getResumeName().isBlank()) {
            resume.setResumeName(request.getResumeName().trim());
        }

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(resume.getIsDefault())) {
            resumeRepository.unsetDefaultResumesForProfile(profile.getId());
            resume.setIsDefault(true);
        }

        Resume updated = resumeRepository.save(resume);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteResume(Long id, String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Resume resume = findResumeByIdAndValidateOwnership(id, profile.getId());

        boolean wasDefault = Boolean.TRUE.equals(resume.getIsDefault());

        // 1. Delete physical file on disk
        fileStorageService.delete(resume.getResumeUrl());

        // 2. Disassociate past job applications referencing this resume
        applicationRepository.nullifyResumeReference(resume.getId());

        // 3. Clean up resume_analysis rows and legacy foreign key tables
        cleanResumeAnalysisData(resume.getId());

        // 4. Delete the resume entity itself
        resumeRepository.delete(resume);
        resumeRepository.flush();

        if (wasDefault) {
            List<Resume> remaining = resumeRepository.findByProfileIdOrderByIsDefaultDescCreatedAtDesc(profile.getId());
            if (!remaining.isEmpty()) {
                Resume newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                resumeRepository.save(newDefault);
            }
        }
    }

    @Override
    @Transactional
    public ResumeResponse setDefaultResume(Long id, String email) throws JobPortalException {
        Profile profile = findProfileByEmail(email);
        Resume resume = findResumeByIdAndValidateOwnership(id, profile.getId());

        if (!Boolean.TRUE.equals(resume.getIsDefault())) {
            resumeRepository.unsetDefaultResumesForProfile(profile.getId());
            resume.setIsDefault(true);
            resume = resumeRepository.save(resume);
        }

        return toResponse(resume);
    }

    @Override
    public ResumeResponse toResponse(Resume resume) {
        if (resume == null) return null;
        ResumeResponse response = new ResumeResponse();
        response.setId(resume.getId());
        response.setResumeName(resume.getResumeName());
        response.setFileName(resume.getFileName());
        response.setFileUrl(resume.getResumeUrl());
        response.setFileSize(resume.getFileSizeBytes());
        response.setContentType(resume.getContentType());
        response.setIsDefault(resume.getIsDefault());
        response.setCreatedAt(resume.getCreatedAt());
        response.setUpdatedAt(resume.getUpdatedAt());
        return response;
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private void cleanResumeAnalysisData(Long resumeId) {
        // Only delete from legacy child tables if they still physically exist in the DB.
        // Attempting DELETE on a non-existent table throws an exception that aborts
        // the entire PostgreSQL transaction (SQLState 25P02), breaking all subsequent statements.
        String[] legacyTables = {
            "resume_analysis_suggested_roles",
            "resume_analysis_suggested_job_roles",
            "resume_analysis_detected_skills",
            "resume_analysis_strengths",
            "resume_analysis_improvements",
            "resume_analysis_missing_skills"
        };
        for (String t : legacyTables) {
            Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?)",
                Boolean.class, t);
            if (Boolean.TRUE.equals(exists)) {
                jdbcTemplate.update(
                    "DELETE FROM " + t + " WHERE resume_analysis_id IN (SELECT id FROM resume_analysis WHERE resume_id = ?)",
                    resumeId);
            }
        }
        analysisRepository.deleteByResumeId(resumeId);
    }

    private Profile findProfileByEmail(String email) throws JobPortalException {
        return profileRepository.findByUserEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("Profile not found for email: " + email));
    }

    private Resume findResumeByIdAndValidateOwnership(Long resumeId, Long profileId)
            throws JobPortalException {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));

        if (!resume.getProfile().getId().equals(profileId)) {
            throw JobPortalException.forbidden("You are not authorized to access this resume.");
        }
        return resume;
    }
}
