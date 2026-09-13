package com.jobportal.resumebuilder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.resumebuilder.entity.ResumeEducation;

public interface ResumeEducationRepository extends JpaRepository<ResumeEducation, Long> {
    List<ResumeEducation> findByResumeIdOrderByDisplayOrderAsc(Long resumeId);
}
