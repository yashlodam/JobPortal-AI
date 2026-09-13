package com.jobportal.resumebuilder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.resumebuilder.entity.ResumeProject;

public interface ResumeProjectRepository extends JpaRepository<ResumeProject, Long> {
    List<ResumeProject> findByResumeIdOrderByDisplayOrderAsc(Long resumeId);
}
