package com.jobportal.serviceImpl;

import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.dto.request.TalentSearchRequest;
import com.jobportal.dto.response.CertificationResponse;
import com.jobportal.dto.response.EducationResponse;
import com.jobportal.dto.response.ExperienceResponse;
import com.jobportal.dto.response.ProfileResponse;

import com.jobportal.entity.Certification;
import com.jobportal.entity.Education;
import com.jobportal.entity.Experience;
import com.jobportal.entity.Profile;
import com.jobportal.entity.Resume;
import com.jobportal.entity.User;

import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.specification.ProfileSpecification;
import com.jobportal.service.ResumeService;
import com.jobportal.service.TalentService;

/**
 * Implementation of {@link TalentService} for recruiter candidate discovery.
 */
@Service
public class TalentServiceImpl implements TalentService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ResumeService resumeService;

    public TalentServiceImpl(ProfileRepository profileRepository,
                             UserRepository userRepository,
                             ResumeService resumeService) {
        this.profileRepository = profileRepository;
        this.userRepository    = userRepository;
        this.resumeService     = resumeService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProfileResponse> searchTalent(TalentSearchRequest request, Pageable pageable) {
        Specification<Profile> spec = ProfileSpecification.buildFrom(request);
        return profileRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getTalentById(Long id) throws JobPortalException {
        // Try finding by Profile ID first
        Profile profile = profileRepository.findByIdWithDetails(id)
                .orElseGet(() -> profileRepository.findByUserId(id)
                        .orElse(null));

        if (profile == null) {
            throw JobPortalException.notFound("Candidate profile not found with id: " + id);
        }

        return toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyTalentProfile(String email) throws JobPortalException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("User not found: " + email));

        Profile profile = profileRepository.findByUserEmailWithDetails(email)
                .orElseThrow(() -> JobPortalException.notFound("Profile not found for candidate: " + email));

        return toResponse(profile);
    }

    // ── Mapping Helper ───────────────────────────────────────────────────────

    private ProfileResponse toResponse(Profile profile) {
        if (profile == null) return null;

        // Force batch initialization of lazy collections
        Hibernate.initialize(profile.getSkills());
        Hibernate.initialize(profile.getLanguages());
        Hibernate.initialize(profile.getExperiences());
        Hibernate.initialize(profile.getEducations());
        Hibernate.initialize(profile.getCertifications());
        Hibernate.initialize(profile.getResumes());

        ProfileResponse dto = new ProfileResponse();

        dto.setId(profile.getId());
        dto.setHeadline(profile.getHeadline());
        dto.setCurrentCompany(profile.getCurrentCompany());
        dto.setLocation(profile.getLocation());
        dto.setAvailability(profile.getAvailability());
        dto.setExperienceLevel(profile.getExperienceLevel());
        dto.setAbout(profile.getAbout());
        dto.setProfileImage(profile.getProfileImage());
        dto.setBannerImage(profile.getBannerImage());
        dto.setLinkedinUrl(profile.getLinkedinUrl());
        dto.setGithubUrl(profile.getGithubUrl());
        dto.setPortfolioUrl(profile.getPortfolioUrl());

        dto.setSkills(profile.getSkills());
        dto.setLanguages(profile.getLanguages());

        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());

        if (profile.getUser() != null) {
            dto.setUserId(profile.getUser().getId());
            dto.setName(profile.getUser().getName());
            dto.setEmail(profile.getUser().getEmail());
        }

        if (profile.getExperiences() != null) {
            dto.setExperiences(profile.getExperiences().stream()
                    .map(this::toExperienceResponse)
                    .toList());
        }

        if (profile.getEducations() != null) {
            dto.setEducations(profile.getEducations().stream()
                    .map(this::toEducationResponse)
                    .toList());
        }

        if (profile.getCertifications() != null) {
            dto.setCertifications(profile.getCertifications().stream()
                    .map(this::toCertificationResponse)
                    .toList());
        }

        if (profile.getResumes() != null && !profile.getResumes().isEmpty()) {
            dto.setResumes(profile.getResumes().stream()
                    .map(resumeService::toResponse)
                    .toList());

            Resume defaultResume = profile.getResumes().stream()
                    .filter(r -> Boolean.TRUE.equals(r.getIsDefault()))
                    .findFirst()
                    .orElse(profile.getResumes().get(0));

            dto.setResumeUrl(defaultResume.getResumeUrl());
            dto.setResumeName(defaultResume.getResumeName());
        }

        return dto;
    }

    private ExperienceResponse toExperienceResponse(Experience exp) {
        ExperienceResponse dto = new ExperienceResponse();
        dto.setId(exp.getId());
        dto.setTitle(exp.getTitle());
        dto.setCompany(exp.getCompany());
        dto.setLocation(exp.getLocation());
        dto.setStartDate(exp.getStartDate());
        dto.setEndDate(exp.getEndDate());
        dto.setWorking(exp.getWorking());
        dto.setDescription(exp.getDescription());
        if (exp.getEmploymentType() != null) {
            dto.setEmploymentType(exp.getEmploymentType().name());
        }
        return dto;
    }

    private EducationResponse toEducationResponse(Education edu) {
        EducationResponse dto = new EducationResponse();
        dto.setId(edu.getId());
        dto.setDegree(edu.getDegree());
        dto.setCollegeName(edu.getCollegeName());
        dto.setUniversity(edu.getUniversity());
        dto.setStartDate(edu.getStartDate());
        dto.setEndDate(edu.getEndDate());
        dto.setLocation(edu.getLocation());
        dto.setGrade(edu.getFieldOfStudy());
        return dto;
    }

    private CertificationResponse toCertificationResponse(Certification cert) {
        CertificationResponse dto = new CertificationResponse();
        dto.setId(cert.getId());
        dto.setTitle(cert.getTitle());
        dto.setIssuer(cert.getIssuer());
        dto.setIssueDate(cert.getIssueDate());
        dto.setCertificateId(cert.getCertificateId());
        dto.setCertificateUrl(cert.getCertificateUrl());
        return dto;
    }
}
