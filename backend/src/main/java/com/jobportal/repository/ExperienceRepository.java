package com.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.entity.Experience;
import com.jobportal.entity.Profile;

public interface ExperienceRepository extends JpaRepository<Experience, Long>{

	List<Experience> findByProfile(Profile profile);

}
