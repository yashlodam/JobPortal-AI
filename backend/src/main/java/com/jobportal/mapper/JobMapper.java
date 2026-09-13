package com.jobportal.mapper;

import java.util.ArrayList;

import org.springframework.stereotype.Component;

import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.JobDetailResponse;
import com.jobportal.dto.response.JobSummaryResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.Recruiter;


/**
 * Dedicated mapper between Job entity and its DTOs.
 * Extracted from JobServiceImpl to enforce Single Responsibility.
 *
 * N+1 contract: toSummary and toDetail access job.getCompany() and
 * job.getRecruiter().getUser(). Always use repository *WithDetails methods.
 */
@Component
public class JobMapper {

    public JobSummaryResponse toSummary(Job job) {
        JobSummaryResponse dto = new JobSummaryResponse();
        dto.setId(job.getId());
        dto.setJobTitle(job.getJobTitle());
        dto.setCategory(job.getCategory());
        dto.setCity(job.getCity());
        dto.setState(job.getState());
        dto.setCountry(job.getCountry());
        dto.setWorkingMode(job.getWorkingMode());
        dto.setJobType(job.getJobType());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setMinimumSalary(job.getMinimumSalary());
        dto.setMaximumSalary(job.getMaximumSalary());
        dto.setCurrency(job.getCurrency());
        dto.setVacancies(job.getVacancies());
        // new ArrayList<>() forces Hibernate to initialize the collection proxy
        // RIGHT NOW, within the open @Transactional session. The @BatchSize(25)
        // on the entity fires one IN-clause query for all jobs in the page.
        // The resulting ArrayList is a plain Java list — no Hibernate proxy —
        // so Jackson can serialize it safely after the transaction closes.
        dto.setSkillsRequired(job.getSkillsRequired() != null
                ? new ArrayList<>(job.getSkillsRequired())
                : new ArrayList<>());
        dto.setStatus(job.getStatus());
        dto.setFeatured(job.getFeatured());
        dto.setUrgentHiring(job.getUrgentHiring());
        dto.setEasyApply(job.getEasyApply());
        dto.setTotalApplicants(job.getTotalApplicants());
        dto.setApplicationDeadline(job.getApplicationDeadline());
        dto.setPostedAt(job.getCreatedAt());

        if (job.getCompany() != null) {
            dto.setCompanyId(job.getCompany().getId());
            dto.setCompanyName(job.getCompany().getCompanyName());
            dto.setCompanyLogo(job.getCompany().getLogo());
        }
        if (job.getRecruiter() != null) {
            dto.setRecruiterId(job.getRecruiter().getId());
            if (job.getRecruiter().getUser() != null) {
                dto.setRecruiterName(job.getRecruiter().getUser().getName());
            }
        }
        return dto;
    }

    public JobDetailResponse toDetail(Job job) {
        JobDetailResponse dto = new JobDetailResponse();
        dto.setId(job.getId());
        dto.setJobTitle(job.getJobTitle());
        dto.setCategory(job.getCategory());
        dto.setDescription(job.getDescription());
        dto.setResponsibilities(job.getResponsibilities());
        dto.setRequirements(job.getRequirements());
        dto.setAboutRole(job.getAboutRole());
        dto.setBenefits(job.getBenefits());
        dto.setCity(job.getCity());
        dto.setState(job.getState());
        dto.setCountry(job.getCountry());
        dto.setWorkingMode(job.getWorkingMode());
        dto.setJobType(job.getJobType());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setMinimumExperience(job.getMinimumExperience());
        dto.setMaximumExperience(job.getMaximumExperience());
        dto.setMinimumSalary(job.getMinimumSalary());
        dto.setMaximumSalary(job.getMaximumSalary());
        dto.setCurrency(job.getCurrency());
        dto.setVacancies(job.getVacancies());
        dto.setSkillsRequired(job.getSkillsRequired() != null
                ? new ArrayList<>(job.getSkillsRequired())
                : new ArrayList<>());
        dto.setPreferredSkills(job.getPreferredSkills() != null
                ? new ArrayList<>(job.getPreferredSkills())
                : new ArrayList<>());

        dto.setQualification(job.getQualification());
        dto.setApplicationDeadline(job.getApplicationDeadline());
        dto.setNumberOfInterviewRounds(job.getNumberOfInterviewRounds());
        dto.setStatus(job.getStatus());
        dto.setFeatured(job.getFeatured());
        dto.setUrgentHiring(job.getUrgentHiring());
        dto.setEasyApply(job.getEasyApply());
        dto.setTotalApplicants(job.getTotalApplicants());
        dto.setTotalViews(job.getTotalViews());
        dto.setTotalBookmarks(job.getTotalBookmarks());
        dto.setPostedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());

        if (job.getCompany() != null) {
            dto.setCompanyId(job.getCompany().getId());
            dto.setCompanyName(job.getCompany().getCompanyName());
            dto.setCompanyLogo(job.getCompany().getLogo());
            dto.setCompanyIndustry(job.getCompany().getIndustry());
        }
        if (job.getRecruiter() != null) {
            Recruiter r = job.getRecruiter();
            dto.setRecruiterId(r.getId());
            if (r.getUser() != null) {
                dto.setRecruiterName(r.getUser().getName());
            }
        }
        return dto;
    }

    /**
     * Applies request fields onto a Job entity.
     * Pre-condition for updates: job must be loaded via findByIdWithDetails
     * so skillsRequired/preferredSkills collections are initialized.
     */
    public void applyRequest(JobRequest dto, Job job) {
        job.setJobTitle(dto.getJobTitle());
        job.setCategory(dto.getCategory());
        job.setDescription(dto.getDescription());
        job.setResponsibilities(dto.getResponsibilities());
        job.setRequirements(dto.getRequirements());
        job.setAboutRole(dto.getAboutRole());
        job.setBenefits(dto.getBenefits());
        job.setCity(dto.getCity());
        job.setState(dto.getState());
        job.setCountry(dto.getCountry());
        job.setWorkingMode(dto.getWorkingMode());
        job.setJobType(dto.getJobType());
        job.setExperienceLevel(dto.getExperienceLevel());
        job.setMinimumExperience(dto.getMinimumExperience());
        job.setMaximumExperience(dto.getMaximumExperience());
        job.setMinimumSalary(dto.getMinimumSalary());
        job.setMaximumSalary(dto.getMaximumSalary());
        job.setCurrency(dto.getCurrency());
        job.setVacancies(dto.getVacancies());

        job.getSkillsRequired().clear();
        if (dto.getSkillsRequired() != null) {
            job.getSkillsRequired().addAll(dto.getSkillsRequired());
        }
        job.getPreferredSkills().clear();
        if (dto.getPreferredSkills() != null) {
            job.getPreferredSkills().addAll(dto.getPreferredSkills());
        }

        job.setQualification(dto.getQualification());
        job.setApplicationDeadline(dto.getApplicationDeadline());
        job.setNumberOfInterviewRounds(dto.getNumberOfInterviewRounds());
        job.setFeatured(Boolean.TRUE.equals(dto.getFeatured()));
        job.setUrgentHiring(Boolean.TRUE.equals(dto.getUrgentHiring()));
        job.setEasyApply(Boolean.TRUE.equals(dto.getEasyApply()));
    }
}
