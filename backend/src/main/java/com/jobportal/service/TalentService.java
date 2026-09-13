package com.jobportal.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.jobportal.dto.request.TalentSearchRequest;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.exception.JobPortalException;

/**
 * Service contract for candidate directory and talent search functionality.
 */
public interface TalentService {

    /**
     * Paginated candidate talent search with dynamic criteria (keyword, skill, experience, availability).
     */
    Page<ProfileResponse> searchTalent(TalentSearchRequest request, Pageable pageable);

    /**
     * Retrieve candidate profile by profile ID or candidate user ID.
     */
    ProfileResponse getTalentById(Long id) throws JobPortalException;

    /**
     * Retrieve authenticated candidate's own profile.
     */
    ProfileResponse getMyTalentProfile(String email) throws JobPortalException;
}
