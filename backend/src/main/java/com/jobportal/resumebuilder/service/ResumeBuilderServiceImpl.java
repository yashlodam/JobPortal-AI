package com.jobportal.resumebuilder.service;

import java.util.ArrayList;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.UserRepository;
import com.jobportal.resumebuilder.dto.AchievementDTO;
import com.jobportal.resumebuilder.dto.CertificationDTO;
import com.jobportal.resumebuilder.dto.EducationDTO;
import com.jobportal.resumebuilder.dto.ExperienceDTO;
import com.jobportal.resumebuilder.dto.ProjectDTO;
import com.jobportal.resumebuilder.dto.ResumeCreateRequest;
import com.jobportal.resumebuilder.dto.ResumeDocumentResponse;
import com.jobportal.resumebuilder.dto.ResumeUpdateRequest;
import com.jobportal.resumebuilder.dto.SectionReorderRequest;
import com.jobportal.resumebuilder.entity.ResumeAchievement;
import com.jobportal.resumebuilder.entity.ResumeCertification;
import com.jobportal.resumebuilder.entity.ResumeDocument;
import com.jobportal.resumebuilder.entity.ResumeEducation;
import com.jobportal.resumebuilder.entity.ResumeExperience;
import com.jobportal.resumebuilder.entity.ResumeProject;
import com.jobportal.resumebuilder.mapper.ResumeBuilderMapper;
import com.jobportal.resumebuilder.repository.ResumeDocumentRepository;

/**
 * Production implementation of {@link ResumeBuilderService}.
 */
@Service
public class ResumeBuilderServiceImpl implements ResumeBuilderService {

    private static final Logger log = LoggerFactory.getLogger(ResumeBuilderServiceImpl.class);

    private final ResumeDocumentRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeBuilderMapper mapper;

    public ResumeBuilderServiceImpl(ResumeDocumentRepository resumeRepository,
                                     UserRepository userRepository,
                                     ResumeBuilderMapper mapper) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public ResumeDocumentResponse createResume(ResumeCreateRequest request, String email) throws JobPortalException {
        User user = findUserByEmail(email);

        ResumeDocument doc = new ResumeDocument();
        doc.setUser(user);
        doc.setResumeName(request.getResumeName());
        doc.setProfessionalTitle(request.getProfessionalTitle());
        doc.setFullName(request.getFullName() != null ? request.getFullName() : user.getName());
        doc.setEmail(request.getEmail() != null ? request.getEmail() : user.getEmail());
        doc.setPhone(request.getPhone());
        doc.setLocation(request.getLocation());
        doc.setLinkedinUrl(request.getLinkedinUrl());
        doc.setGithubUrl(request.getGithubUrl());
        doc.setPortfolioUrl(request.getPortfolioUrl());
        doc.setProfessionalSummary(request.getProfessionalSummary());
        if (request.getTemplate() != null) {
            doc.setTemplate(request.getTemplate());
        }

        doc.setCompletionPercentage(calculateCompletionPercentage(doc));
        ResumeDocument saved = resumeRepository.save(doc);

        log.info("Created new structured resume id=[{}] name=[{}] for user=[{}]", saved.getId(), saved.getResumeName(), email);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeDocumentResponse> getUserResumes(String email) throws JobPortalException {
        User user = findUserByEmail(email);
        List<ResumeDocument> list = resumeRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
        return list.stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeDocumentResponse getResumeById(Long resumeId, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        ResumeDocument doc = resumeRepository.findWithAllSectionsByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));

        return mapper.toResponse(doc);
    }

    @Override
    @Transactional
    public ResumeDocumentResponse updateResume(Long resumeId, ResumeUpdateRequest request, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        ResumeDocument doc = resumeRepository.findWithAllSectionsByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));

        doc.setResumeName(request.getResumeName());
        doc.setProfessionalTitle(request.getProfessionalTitle());
        doc.setFullName(request.getFullName());
        doc.setEmail(request.getEmail());
        doc.setPhone(request.getPhone());
        doc.setLocation(request.getLocation());
        doc.setLinkedinUrl(request.getLinkedinUrl());
        doc.setGithubUrl(request.getGithubUrl());
        doc.setPortfolioUrl(request.getPortfolioUrl());
        doc.setProfessionalSummary(request.getProfessionalSummary());
        if (request.getTemplate() != null) {
            doc.setTemplate(request.getTemplate());
        }

        if (request.getSkills() != null) {
            doc.setSkills(new ArrayList<>(request.getSkills()));
        }
        if (request.getLanguages() != null) {
            doc.setLanguages(new ArrayList<>(request.getLanguages()));
        }

        // Update Education section
        if (request.getEducationList() != null) {
            doc.getEducationList().clear();
            for (EducationDTO dto : request.getEducationList()) {
                ResumeEducation edu = mapper.toEducationEntity(dto);
                doc.addEducation(edu);
            }
        }

        // Update Experience section
        if (request.getExperienceList() != null) {
            doc.getExperienceList().clear();
            for (ExperienceDTO dto : request.getExperienceList()) {
                ResumeExperience exp = mapper.toExperienceEntity(dto);
                doc.addExperience(exp);
            }
        }

        // Update Project section
        if (request.getProjectList() != null) {
            doc.getProjectList().clear();
            for (ProjectDTO dto : request.getProjectList()) {
                ResumeProject proj = mapper.toProjectEntity(dto);
                doc.addProject(proj);
            }
        }

        // Update Certification section
        if (request.getCertificationList() != null) {
            doc.getCertificationList().clear();
            for (CertificationDTO dto : request.getCertificationList()) {
                ResumeCertification cert = mapper.toCertificationEntity(dto);
                doc.addCertification(cert);
            }
        }

        // Update Achievement section
        if (request.getAchievementList() != null) {
            doc.getAchievementList().clear();
            for (AchievementDTO dto : request.getAchievementList()) {
                ResumeAchievement ach = mapper.toAchievementEntity(dto);
                doc.addAchievement(ach);
            }
        }

        doc.setCompletionPercentage(calculateCompletionPercentage(doc));
        ResumeDocument saved = resumeRepository.save(doc);

        log.info("Updated resume id=[{}] for user=[{}] completion=[{}%]", saved.getId(), email, saved.getCompletionPercentage());
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteResume(Long resumeId, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        ResumeDocument doc = resumeRepository.findByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));

        resumeRepository.delete(doc);
        log.info("Deleted resume id=[{}] for user=[{}]", resumeId, email);
    }

    @Override
    @Transactional
    public ResumeDocumentResponse duplicateResume(Long resumeId, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        ResumeDocument original = resumeRepository.findWithAllSectionsByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));

        ResumeDocument copy = new ResumeDocument();
        copy.setUser(user);
        copy.setResumeName("Copy of " + original.getResumeName());
        copy.setProfessionalTitle(original.getProfessionalTitle());
        copy.setFullName(original.getFullName());
        copy.setEmail(original.getEmail());
        copy.setPhone(original.getPhone());
        copy.setLocation(original.getLocation());
        copy.setLinkedinUrl(original.getLinkedinUrl());
        copy.setGithubUrl(original.getGithubUrl());
        copy.setPortfolioUrl(original.getPortfolioUrl());
        copy.setProfessionalSummary(original.getProfessionalSummary());
        copy.setTemplate(original.getTemplate());
        copy.setSkills(new ArrayList<>(original.getSkills()));
        copy.setLanguages(new ArrayList<>(original.getLanguages()));

        for (ResumeEducation edu : original.getEducationList()) {
            ResumeEducation eduCopy = new ResumeEducation();
            eduCopy.setInstitution(edu.getInstitution());
            eduCopy.setDegree(edu.getDegree());
            eduCopy.setFieldOfStudy(edu.getFieldOfStudy());
            eduCopy.setLocation(edu.getLocation());
            eduCopy.setStartDate(edu.getStartDate());
            eduCopy.setEndDate(edu.getEndDate());
            eduCopy.setGrade(edu.getGrade());
            eduCopy.setDescription(edu.getDescription());
            eduCopy.setDisplayOrder(edu.getDisplayOrder());
            copy.addEducation(eduCopy);
        }

        for (ResumeExperience exp : original.getExperienceList()) {
            ResumeExperience expCopy = new ResumeExperience();
            expCopy.setCompany(exp.getCompany());
            expCopy.setPosition(exp.getPosition());
            expCopy.setLocation(exp.getLocation());
            expCopy.setStartDate(exp.getStartDate());
            expCopy.setEndDate(exp.getEndDate());
            expCopy.setCurrentlyWorking(exp.isCurrentlyWorking());
            expCopy.setDescription(exp.getDescription());
            expCopy.setDisplayOrder(exp.getDisplayOrder());
            copy.addExperience(expCopy);
        }

        for (ResumeProject proj : original.getProjectList()) {
            ResumeProject projCopy = new ResumeProject();
            projCopy.setProjectName(proj.getProjectName());
            projCopy.setDescription(proj.getDescription());
            projCopy.setTechnologies(proj.getTechnologies());
            projCopy.setGithubUrl(proj.getGithubUrl());
            projCopy.setLiveUrl(proj.getLiveUrl());
            projCopy.setDisplayOrder(proj.getDisplayOrder());
            copy.addProject(projCopy);
        }

        for (ResumeCertification cert : original.getCertificationList()) {
            ResumeCertification certCopy = new ResumeCertification();
            certCopy.setName(cert.getName());
            certCopy.setIssuingOrganization(cert.getIssuingOrganization());
            certCopy.setIssueDate(cert.getIssueDate());
            certCopy.setExpiryDate(cert.getExpiryDate());
            certCopy.setCredentialUrl(cert.getCredentialUrl());
            certCopy.setDisplayOrder(cert.getDisplayOrder());
            copy.addCertification(certCopy);
        }

        for (ResumeAchievement ach : original.getAchievementList()) {
            ResumeAchievement achCopy = new ResumeAchievement();
            achCopy.setTitle(ach.getTitle());
            achCopy.setDescription(ach.getDescription());
            achCopy.setDate(ach.getDate());
            achCopy.setDisplayOrder(ach.getDisplayOrder());
            copy.addAchievement(achCopy);
        }

        copy.setCompletionPercentage(calculateCompletionPercentage(copy));
        ResumeDocument savedCopy = resumeRepository.save(copy);

        log.info("Duplicated resume originalId=[{}] -> newCopyId=[{}] for user=[{}]", resumeId, savedCopy.getId(), email);
        return mapper.toResponse(savedCopy);
    }

    @Override
    @Transactional
    public ResumeDocumentResponse reorderSection(Long resumeId, SectionReorderRequest request, String email) throws JobPortalException {
        User user = findUserByEmail(email);
        ResumeDocument doc = resumeRepository.findWithAllSectionsByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));

        List<Long> order = request.getOrderedIds();
        if (order == null || order.isEmpty()) {
            return mapper.toResponse(doc);
        }

        switch (request.getSectionType()) {
            case EDUCATION -> {
                for (ResumeEducation edu : doc.getEducationList()) {
                    int index = order.indexOf(edu.getId());
                    if (index != -1) edu.setDisplayOrder(index);
                }
            }
            case EXPERIENCE -> {
                for (ResumeExperience exp : doc.getExperienceList()) {
                    int index = order.indexOf(exp.getId());
                    if (index != -1) exp.setDisplayOrder(index);
                }
            }
            case PROJECTS -> {
                for (ResumeProject proj : doc.getProjectList()) {
                    int index = order.indexOf(proj.getId());
                    if (index != -1) proj.setDisplayOrder(index);
                }
            }
            case CERTIFICATIONS -> {
                for (ResumeCertification cert : doc.getCertificationList()) {
                    int index = order.indexOf(cert.getId());
                    if (index != -1) cert.setDisplayOrder(index);
                }
            }
            case ACHIEVEMENTS -> {
                for (ResumeAchievement ach : doc.getAchievementList()) {
                    int index = order.indexOf(ach.getId());
                    if (index != -1) ach.setDisplayOrder(index);
                }
            }
            default -> {}
        }

        ResumeDocument saved = resumeRepository.save(doc);
        return mapper.toResponse(saved);
    }

    // ── Completion Percentage Calculation Logic ──────────────────────────────

    private int calculateCompletionPercentage(ResumeDocument doc) {
        int score = 0;

        // Header / Contact info: 20%
        if (doc.getFullName() != null && !doc.getFullName().isBlank() &&
            doc.getEmail() != null && !doc.getEmail().isBlank() &&
            doc.getPhone() != null && !doc.getPhone().isBlank()) {
            score += 20;
        } else if (doc.getFullName() != null && !doc.getFullName().isBlank()) {
            score += 10;
        }

        // Summary: 15%
        if (doc.getProfessionalSummary() != null && doc.getProfessionalSummary().length() > 30) {
            score += 15;
        }

        // Education: 20%
        if (doc.getEducationList() != null && !doc.getEducationList().isEmpty()) {
            score += 20;
        }

        // Skills: 20% (requires at least 3 skills)
        if (doc.getSkills() != null && doc.getSkills().size() >= 3) {
            score += 20;
        } else if (doc.getSkills() != null && !doc.getSkills().isEmpty()) {
            score += 10;
        }

        // Experience vs Projects: 25% (flexible for freshers)
        boolean hasExp = doc.getExperienceList() != null && !doc.getExperienceList().isEmpty();
        boolean hasProj = doc.getProjectList() != null && !doc.getProjectList().isEmpty();

        if (hasExp && hasProj) {
            score += 25;
        } else if (hasExp) {
            score += 25;
        } else if (hasProj) {
            // Fresher option: projects grant full 25% if no work experience
            score += 25;
        }

        return Math.min(100, score);
    }

    private User findUserByEmail(String email) throws JobPortalException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("User not found for email: " + email));
    }
}
