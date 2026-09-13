package com.jobportal.resumebuilder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.resumebuilder.entity.ResumeAchievement;

public interface ResumeAchievementRepository extends JpaRepository<ResumeAchievement, Long> {
    List<ResumeAchievement> findByResumeIdOrderByDisplayOrderAsc(Long resumeId);
}
