package com.jobportal.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.dto.CompanyRequestDTO;
import com.jobportal.dto.CompanyResponseDTO;
import com.jobportal.dto.response.JobSummaryResponse;
import com.jobportal.exception.JobPortalException;

public interface CompanyService {

    CompanyResponseDTO createCompany(CompanyRequestDTO dto, String email) throws JobPortalException;

    CompanyResponseDTO getMyCompany(String email) throws JobPortalException;

    CompanyResponseDTO updateCompany(CompanyRequestDTO dto, String email) throws JobPortalException;

    void deleteCompany(String email) throws JobPortalException;

    CompanyResponseDTO getCompanyById(Long companyId) throws JobPortalException;

    Page<CompanyResponseDTO> getAllCompanies(Pageable pageable);

    Page<CompanyResponseDTO> searchCompanies(String keyword, Pageable pageable);

    CompanyResponseDTO uploadLogo(MultipartFile file, String email) throws Exception;

    CompanyResponseDTO uploadCoverImage(MultipartFile file, String email) throws Exception;

    Page<JobSummaryResponse> getMyCompanyJobs(String email, Pageable pageable) throws JobPortalException;

    Page<JobSummaryResponse> getCompanyJobs(Long companyId, Pageable pageable)
            throws JobPortalException;
}
