package com.jobportal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.entity.Resume;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    /** Returns all resumes for a profile, placing default resumes first. */
    List<Resume> findByProfileIdOrderByIsDefaultDescCreatedAtDesc(Long profileId);

    /** Returns the designated default resume for a profile if one exists. */
    Optional<Resume> findByProfileIdAndIsDefaultTrue(Long profileId);

    /** Returns a specific resume belonging to a profile. */
    Optional<Resume> findByIdAndProfileId(Long id, Long profileId);

    /** Returns all resumes matching a profile ID and file name (newest first). */
    List<Resume> findByProfileIdAndFileNameOrderByIdDesc(Long profileId, String fileName);

    /** Counts total resumes uploaded for a profile. */
    long countByProfileId(Long profileId);

    /** Unsets the default status for all resumes belonging to a profile. */
    @Modifying
    @Query("UPDATE Resume r SET r.isDefault = false WHERE r.profile.id = :profileId")
    void unsetDefaultResumesForProfile(@Param("profileId") Long profileId);
}
