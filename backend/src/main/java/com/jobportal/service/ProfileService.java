package com.jobportal.service;

import org.springframework.web.multipart.MultipartFile;

import com.jobportal.dto.request.CertificationRequest;
import com.jobportal.dto.request.EducationRequest;
import com.jobportal.dto.request.ExperienceRequest;
import com.jobportal.dto.request.ProfileAboutRequest;
import com.jobportal.dto.request.ProfileHeaderRequest;
import com.jobportal.dto.request.ProfileLinksRequest;
import com.jobportal.dto.request.ProfileSkillsRequest;
import com.jobportal.dto.response.CertificationResponse;
import com.jobportal.dto.response.EducationResponse;
import com.jobportal.dto.response.ExperienceResponse;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.exception.JobPortalException;

import java.util.List;

public interface ProfileService {

    ProfileResponse getMyProfile(String email) throws JobPortalException;

    ProfileResponse getProfileByEmail(String email) throws JobPortalException;

    ProfileResponse updateHeader(ProfileHeaderRequest request, String email) throws JobPortalException;

    ProfileResponse updateLinks(ProfileLinksRequest request, String email) throws JobPortalException;

    ProfileResponse updateAbout(ProfileAboutRequest request, String email) throws JobPortalException;

    ProfileResponse updateSkills(ProfileSkillsRequest request, String email) throws JobPortalException;

    ProfileResponse addSkill(String skill, String email) throws JobPortalException;

    ProfileResponse removeSkill(String skill, String email) throws JobPortalException;

    ExperienceResponse addExperience(ExperienceRequest request, String email) throws JobPortalException;

    ExperienceResponse updateExperience(Long experienceId, ExperienceRequest request, String email) throws JobPortalException;

    void deleteExperience(Long experienceId, String email) throws JobPortalException;

    List<ExperienceResponse> getExperiences(String email) throws JobPortalException;

    EducationResponse addEducation(EducationRequest request, String email) throws JobPortalException;

    EducationResponse updateEducation(Long educationId, EducationRequest request, String email) throws JobPortalException;

    void deleteEducation(Long educationId, String email) throws JobPortalException;

    List<EducationResponse> getEducations(String email) throws JobPortalException;

    CertificationResponse addCertification(CertificationRequest request, String email) throws JobPortalException;

    CertificationResponse updateCertification(Long certificationId, CertificationRequest request, String email) throws JobPortalException;

    void deleteCertification(Long certificationId, String email) throws JobPortalException;

    List<CertificationResponse> getCertifications(String email) throws JobPortalException;

    ProfileResponse addLanguage(String language, String email) throws JobPortalException;

    ProfileResponse removeLanguage(String language, String email) throws JobPortalException;

    ProfileResponse updateProfileImage(MultipartFile file, String email) throws Exception;

    ProfileResponse updateBannerImage(MultipartFile file, String email) throws Exception;
}
