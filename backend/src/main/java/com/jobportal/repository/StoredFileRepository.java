package com.jobportal.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jobportal.entity.StoredFile;

@Repository
public interface StoredFileRepository extends JpaRepository<StoredFile, Long> {

    Optional<StoredFile> findByFilePath(String filePath);

    void deleteByFilePath(String filePath);

    boolean existsByFilePath(String filePath);
}
