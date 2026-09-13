package com.jobportal.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.domain.Availability;
import com.jobportal.domain.ExperienceLevel;
import com.jobportal.dto.request.TalentSearchRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.TalentService;

/**
 * REST Controller for Candidate Directory & Talent Discovery (/api/talent).
 *
 * <p>Provides recruiters and platform users with candidate search, talent discovery,
 * and profile retrieval endpoints.</p>
 */
@RestController
@RequestMapping("/api/talent")
public class TalentController {

    private final TalentService talentService;
    private final com.jobportal.service.RecruiterAuthorizationService recruiterAuthorizationService;
    private final com.jobportal.repository.UserRepository userRepository;

    public TalentController(
            TalentService talentService,
            com.jobportal.service.RecruiterAuthorizationService recruiterAuthorizationService,
            com.jobportal.repository.UserRepository userRepository) {
        this.talentService = talentService;
        this.recruiterAuthorizationService = recruiterAuthorizationService;
        this.userRepository = userRepository;
    }

    /**
     * Paginated candidate talent search for recruiters using JPA Specifications.
     *
     * <p>GET /api/talent/search?keyword=java&skill=Spring&experienceLevel=MID&availability=IMMEDIATE&page=0&size=12</p>
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProfileResponse>>> searchTalent(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) ExperienceLevel experienceLevel,
            @RequestParam(required = false) Availability availability,
            @RequestParam(required = false) String location,
            @PageableDefault(size = 12) Pageable pageable,
            Authentication authentication) throws JobPortalException {

        checkRecruiterAccess(authentication);

        TalentSearchRequest request = new TalentSearchRequest();
        request.setKeyword(keyword);
        request.setSkill(skill);
        request.setExperienceLevel(experienceLevel);
        request.setAvailability(availability);
        request.setLocation(location);

        return ResponseEntity.ok(ApiResponse.success(
                talentService.searchTalent(request, pageable)));
    }

    /**
     * Retrieve candidate profile by profile ID or candidate User ID.
     *
     * <p>GET /api/talent/{id}</p>
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getTalentById(
            @PathVariable Long id,
            Authentication authentication) throws JobPortalException {

        checkRecruiterAccess(authentication);

        return ResponseEntity.ok(ApiResponse.success(
                talentService.getTalentById(id)));
    }

    /**
     * Retrieve authenticated candidate's profile.
     *
     * <p>GET /api/talent/me</p>
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getMyTalentProfile(
            Authentication authentication) throws JobPortalException {
        return ResponseEntity.ok(ApiResponse.success(
                talentService.getMyTalentProfile(authentication.getName())));
    }

    /**
     * Advanced talent profile search / listing endpoint via POST payload.
     * Allows complex multi-skill or structured candidate search for recruiters.
     *
     * <p>POST /api/talent/profile</p>
     */
    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<Page<ProfileResponse>>> filterTalentProfiles(
            @RequestBody(required = false) TalentSearchRequest request,
            @PageableDefault(size = 12) Pageable pageable,
            Authentication authentication) throws JobPortalException {

        checkRecruiterAccess(authentication);

        if (request == null) {
            request = new TalentSearchRequest();
        }

        return ResponseEntity.ok(ApiResponse.success(
                talentService.searchTalent(request, pageable)));
    }

    private void checkRecruiterAccess(Authentication authentication) throws JobPortalException {
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null && user.getAccountType() == com.jobportal.domain.AccountType.EMPLOYER) {
                recruiterAuthorizationService.requireApprovedRecruiter(email);
            }
        }
    }
}
