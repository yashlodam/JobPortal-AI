package com.jobportal.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.dto.request.CertificationRequest;
import com.jobportal.dto.request.EducationRequest;
import com.jobportal.dto.request.ExperienceRequest;
import com.jobportal.dto.request.ProfileAboutRequest;
import com.jobportal.dto.request.ProfileHeaderRequest;
import com.jobportal.dto.request.ProfileLinksRequest;
import com.jobportal.dto.request.ProfileSkillsRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.CertificationResponse;
import com.jobportal.dto.response.EducationResponse;
import com.jobportal.dto.response.ExperienceResponse;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.ProfileService;

import jakarta.validation.Valid;

/**
 * Profile controller — all mutation endpoints derive user identity from JWT.
 * No client-supplied profile IDs accepted for mutations (IDOR prevention).
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // ── My Profile ───────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getMyProfile(
            Authentication authentication) throws JobPortalException {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ProfileResponse>error("Not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getMyProfile(authentication.getName())));
    }

    @GetMapping({"/{email:.+}", "/{email}"})
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfileByEmail(
            @PathVariable String email) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getProfileByEmail(email)));
    }

    // ── Header & Links ───────────────────────────────────────────────────────

    @PutMapping("/me/header")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateHeader(
            @Valid @RequestBody ProfileHeaderRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Header updated",
                profileService.updateHeader(request, authentication.getName())));
    }

    @PutMapping("/me/links")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateLinks(
            @Valid @RequestBody ProfileLinksRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Links updated",
                profileService.updateLinks(request, authentication.getName())));
    }

    @PutMapping("/me/about")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateAbout(
            @Valid @RequestBody ProfileAboutRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("About updated",
                profileService.updateAbout(request, authentication.getName())));
    }

    // ── Skills ────────────────────────────────────────────────────────────────

    @PutMapping("/me/skills")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateSkills(
            @Valid @RequestBody ProfileSkillsRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Skills updated",
                profileService.updateSkills(request, authentication.getName())));
    }

    @PostMapping("/me/skills")
    public ResponseEntity<ApiResponse<ProfileResponse>> addSkill(
            @RequestParam String skill,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Skill added",
                profileService.addSkill(skill, authentication.getName())));
    }

    @DeleteMapping("/me/skills")
    public ResponseEntity<ApiResponse<ProfileResponse>> removeSkill(
            @RequestParam String skill,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Skill removed",
                profileService.removeSkill(skill, authentication.getName())));
    }

    // ── Experience ───────────────────────────────────────────────────────────

    @PostMapping("/me/experiences")
    public ResponseEntity<ApiResponse<ExperienceResponse>> addExperience(
            @Valid @RequestBody ExperienceRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Experience added",
                profileService.addExperience(request, authentication.getName())));
    }

    @PutMapping("/me/experiences/{experienceId}")
    public ResponseEntity<ApiResponse<ExperienceResponse>> updateExperience(
            @PathVariable Long experienceId,
            @Valid @RequestBody ExperienceRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Experience updated",
                profileService.updateExperience(experienceId, request, authentication.getName())));
    }

    @DeleteMapping("/me/experiences/{experienceId}")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(
            @PathVariable Long experienceId,
            Authentication authentication) throws JobPortalException {
        profileService.deleteExperience(experienceId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Experience deleted"));
    }

    @GetMapping("/me/experiences")
    public ResponseEntity<ApiResponse<List<ExperienceResponse>>> getExperiences(
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getExperiences(authentication.getName())));
    }

    // ── Education ────────────────────────────────────────────────────────────

    @PostMapping("/me/educations")
    public ResponseEntity<ApiResponse<EducationResponse>> addEducation(
            @Valid @RequestBody EducationRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Education added",
                profileService.addEducation(request, authentication.getName())));
    }

    @PutMapping("/me/educations/{educationId}")
    public ResponseEntity<ApiResponse<EducationResponse>> updateEducation(
            @PathVariable Long educationId,
            @Valid @RequestBody EducationRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Education updated",
                profileService.updateEducation(educationId, request, authentication.getName())));
    }

    @DeleteMapping("/me/educations/{educationId}")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(
            @PathVariable Long educationId,
            Authentication authentication) throws JobPortalException {
        profileService.deleteEducation(educationId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Education deleted"));
    }

    @GetMapping("/me/educations")
    public ResponseEntity<ApiResponse<List<EducationResponse>>> getEducations(
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getEducations(authentication.getName())));
    }

    // ── Certification ─────────────────────────────────────────────────────────

    @PostMapping("/me/certifications")
    public ResponseEntity<ApiResponse<CertificationResponse>> addCertification(
            @Valid @RequestBody CertificationRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Certification added",
                profileService.addCertification(request, authentication.getName())));
    }

    @PutMapping("/me/certifications/{certificationId}")
    public ResponseEntity<ApiResponse<CertificationResponse>> updateCertification(
            @PathVariable Long certificationId,
            @Valid @RequestBody CertificationRequest request,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Certification updated",
                profileService.updateCertification(certificationId, request, authentication.getName())));
    }

    @DeleteMapping("/me/certifications/{certificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteCertification(
            @PathVariable Long certificationId,
            Authentication authentication) throws JobPortalException {
        profileService.deleteCertification(certificationId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.message("Certification deleted"));
    }

    @GetMapping("/me/certifications")
    public ResponseEntity<ApiResponse<List<CertificationResponse>>> getCertifications(
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getCertifications(authentication.getName())));
    }

    // ── Languages ─────────────────────────────────────────────────────────────

    @PostMapping("/me/languages")
    public ResponseEntity<ApiResponse<ProfileResponse>> addLanguage(
            @RequestParam String language,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Language added",
                profileService.addLanguage(language, authentication.getName())));
    }

    @DeleteMapping("/me/languages")
    public ResponseEntity<ApiResponse<ProfileResponse>> removeLanguage(
            @RequestParam String language,
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success("Language removed",
                profileService.removeLanguage(language, authentication.getName())));
    }

    // ── Images ────────────────────────────────────────────────────────────────

    @PutMapping("/me/profile-image")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        return ResponseEntity.ok(ApiResponse.success("Profile image updated",
                profileService.updateProfileImage(file, authentication.getName())));
    }

    @PutMapping("/me/banner-image")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateBannerImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        return ResponseEntity.ok(ApiResponse.success("Banner image updated",
                profileService.updateBannerImage(file, authentication.getName())));
    }
}
