package com.jobportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jobportal.entity.Certification;
import com.jobportal.entity.Profile;

public interface CertificationRepository extends JpaRepository<Certification, Long> {

    List<Certification> findByProfile(Profile profile);

}
