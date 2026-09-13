package com.jobportal.resumebuilder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.resumebuilder.entity.ResumeCertification;

public interface ResumeCertificationRepository extends JpaRepository<ResumeCertification, Long> {
    List<ResumeCertification> findByResumeIdOrderByDisplayOrderAsc(Long resumeId);
}
