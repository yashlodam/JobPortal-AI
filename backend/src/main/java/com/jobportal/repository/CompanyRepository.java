package com.jobportal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.entity.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    @Query("""
            SELECT c FROM Company c
            WHERE LOWER(c.companyName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(c.industry) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(c.headquarters) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """)
    Page<Company> searchCompanies(@Param("keyword") String keyword, Pageable pageable);

    Optional<Company> findByCompanyNameIgnoreCase(String companyName);
}