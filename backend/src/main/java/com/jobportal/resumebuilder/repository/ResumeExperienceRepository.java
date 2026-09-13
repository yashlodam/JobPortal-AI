package com.jobportal.resumebuilder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.resumebuilder.entity.ResumeExperience;

public interface ResumeExperienceRepository extends JpaRepository<ResumeExperience, Long> {
    List<ResumeExperience> findByResumeIdOrderByDisplayOrderAsc(Long resumeId);
}
