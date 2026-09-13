package com.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.entity.Education;
import com.jobportal.entity.Profile;

public interface EducationRepository extends JpaRepository<Education, Long>{
    
	List<Education> findByProfile(Profile profile);
}
