package com.jobportal.resumebuilder.mapper;

import java.util.ArrayList;

import java.util.List;

import org.springframework.stereotype.Component;

import com.jobportal.resumebuilder.dto.AchievementDTO;
import com.jobportal.resumebuilder.dto.CertificationDTO;
import com.jobportal.resumebuilder.dto.EducationDTO;
import com.jobportal.resumebuilder.dto.ExperienceDTO;
import com.jobportal.resumebuilder.dto.ProjectDTO;
import com.jobportal.resumebuilder.dto.ResumeDocumentResponse;
import com.jobportal.resumebuilder.entity.ResumeAchievement;
import com.jobportal.resumebuilder.entity.ResumeCertification;
import com.jobportal.resumebuilder.entity.ResumeDocument;
import com.jobportal.resumebuilder.entity.ResumeEducation;
import com.jobportal.resumebuilder.entity.ResumeExperience;
import com.jobportal.resumebuilder.entity.ResumeProject;

/**
 * Mapper component for converting Resume Builder domain entities to DTOs.
 */
@Component
public class ResumeBuilderMapper {

    public ResumeDocumentResponse toResponse(ResumeDocument entity) {
        if (entity == null) return null;

        ResumeDocumentResponse response = new ResumeDocumentResponse();
        response.setId(entity.getId());
        response.setUserId(entity.getUser().getId());
        response.setUserEmail(entity.getUser().getEmail());
        response.setResumeName(entity.getResumeName());
        response.setProfessionalTitle(entity.getProfessionalTitle());
        response.setFullName(entity.getFullName());
        response.setEmail(entity.getEmail());
        response.setPhone(entity.getPhone());
        response.setLocation(entity.getLocation());
        response.setLinkedinUrl(entity.getLinkedinUrl());
        response.setGithubUrl(entity.getGithubUrl());
        response.setPortfolioUrl(entity.getPortfolioUrl());
        response.setProfessionalSummary(entity.getProfessionalSummary());
        response.setTemplate(entity.getTemplate());
        response.setCompletionPercentage(entity.getCompletionPercentage());
        response.setVersion(entity.getVersion());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        response.setEducationList(
                entity.getEducationList() != null
                        ? entity.getEducationList().stream().map(this::toEducationDTO).toList()
                        : List.of()
        );

        response.setExperienceList(
                entity.getExperienceList() != null
                        ? entity.getExperienceList().stream().map(this::toExperienceDTO).toList()
                        : List.of()
        );

        response.setProjectList(
                entity.getProjectList() != null
                        ? entity.getProjectList().stream().map(this::toProjectDTO).toList()
                        : List.of()
        );

        response.setCertificationList(
                entity.getCertificationList() != null
                        ? entity.getCertificationList().stream().map(this::toCertificationDTO).toList()
                        : List.of()
        );

        response.setAchievementList(
                entity.getAchievementList() != null
                        ? entity.getAchievementList().stream().map(this::toAchievementDTO).toList()
                        : List.of()
        );

        response.setSkills(toList(entity.getSkills()));
        response.setLanguages(toList(entity.getLanguages()));

        return response;
    }

    public EducationDTO toEducationDTO(ResumeEducation entity) {
        if (entity == null) return null;
        EducationDTO dto = new EducationDTO();
        dto.setId(entity.getId());
        dto.setInstitution(entity.getInstitution());
        dto.setDegree(entity.getDegree());
        dto.setFieldOfStudy(entity.getFieldOfStudy());
        dto.setLocation(entity.getLocation());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setGrade(entity.getGrade());
        dto.setDescription(entity.getDescription());
        dto.setDisplayOrder(entity.getDisplayOrder());
        return dto;
    }

    public ResumeEducation toEducationEntity(EducationDTO dto) {
        if (dto == null) return null;
        ResumeEducation entity = new ResumeEducation();
        entity.setId(dto.getId());
        entity.setInstitution(dto.getInstitution());
        entity.setDegree(dto.getDegree());
        entity.setFieldOfStudy(dto.getFieldOfStudy());
        entity.setLocation(dto.getLocation());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setGrade(dto.getGrade());
        entity.setDescription(dto.getDescription());
        entity.setDisplayOrder(dto.getDisplayOrder());
        return entity;
    }

    public ExperienceDTO toExperienceDTO(ResumeExperience entity) {
        if (entity == null) return null;
        ExperienceDTO dto = new ExperienceDTO();
        dto.setId(entity.getId());
        dto.setCompany(entity.getCompany());
        dto.setPosition(entity.getPosition());
        dto.setLocation(entity.getLocation());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setCurrentlyWorking(entity.isCurrentlyWorking());
        dto.setDescription(entity.getDescription());
        dto.setDisplayOrder(entity.getDisplayOrder());
        return dto;
    }

    public ResumeExperience toExperienceEntity(ExperienceDTO dto) {
        if (dto == null) return null;
        ResumeExperience entity = new ResumeExperience();
        entity.setId(dto.getId());
        entity.setCompany(dto.getCompany());
        entity.setPosition(dto.getPosition());
        entity.setLocation(dto.getLocation());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setCurrentlyWorking(dto.isCurrentlyWorking());
        entity.setDescription(dto.getDescription());
        entity.setDisplayOrder(dto.getDisplayOrder());
        return entity;
    }

    public ProjectDTO toProjectDTO(ResumeProject entity) {
        if (entity == null) return null;
        ProjectDTO dto = new ProjectDTO();
        dto.setId(entity.getId());
        dto.setProjectName(entity.getProjectName());
        dto.setDescription(entity.getDescription());
        dto.setTechnologies(entity.getTechnologies());
        dto.setGithubUrl(entity.getGithubUrl());
        dto.setLiveUrl(entity.getLiveUrl());
        dto.setDisplayOrder(entity.getDisplayOrder());
        return dto;
    }

    public ResumeProject toProjectEntity(ProjectDTO dto) {
        if (dto == null) return null;
        ResumeProject entity = new ResumeProject();
        entity.setId(dto.getId());
        entity.setProjectName(dto.getProjectName());
        entity.setDescription(dto.getDescription());
        entity.setTechnologies(dto.getTechnologies());
        entity.setGithubUrl(dto.getGithubUrl());
        entity.setLiveUrl(dto.getLiveUrl());
        entity.setDisplayOrder(dto.getDisplayOrder());
        return entity;
    }

    public CertificationDTO toCertificationDTO(ResumeCertification entity) {
        if (entity == null) return null;
        CertificationDTO dto = new CertificationDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setIssuingOrganization(entity.getIssuingOrganization());
        dto.setIssueDate(entity.getIssueDate());
        dto.setExpiryDate(entity.getExpiryDate());
        dto.setCredentialUrl(entity.getCredentialUrl());
        dto.setDisplayOrder(entity.getDisplayOrder());
        return dto;
    }

    public ResumeCertification toCertificationEntity(CertificationDTO dto) {
        if (dto == null) return null;
        ResumeCertification entity = new ResumeCertification();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setIssuingOrganization(dto.getIssuingOrganization());
        entity.setIssueDate(dto.getIssueDate());
        entity.setExpiryDate(dto.getExpiryDate());
        entity.setCredentialUrl(dto.getCredentialUrl());
        entity.setDisplayOrder(dto.getDisplayOrder());
        return entity;
    }

    public AchievementDTO toAchievementDTO(ResumeAchievement entity) {
        if (entity == null) return null;
        AchievementDTO dto = new AchievementDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setDate(entity.getDate());
        dto.setDisplayOrder(entity.getDisplayOrder());
        return dto;
    }

    public ResumeAchievement toAchievementEntity(AchievementDTO dto) {
        if (dto == null) return null;
        ResumeAchievement entity = new ResumeAchievement();
        entity.setId(dto.getId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setDate(dto.getDate());
        entity.setDisplayOrder(dto.getDisplayOrder());
        return entity;
    }

    private List<String> toList(List<String> source) {
        if (source == null) return List.of();
        return new ArrayList<>(source);
    }
}
