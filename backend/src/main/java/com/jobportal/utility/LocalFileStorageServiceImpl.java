package com.jobportal.utility;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.jobportal.entity.StoredFile;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.StoredFileRepository;

import jakarta.annotation.PostConstruct;

/**
 * Resilient FileStorageService implementation.
 * Combines local disk caching for fast streaming with PostgreSQL database persistence
 * so uploads are never lost across Render dyno spin-downs, restarts, or redeployments.
 */
@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalFileStorageServiceImpl.class);

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private final String uploadBaseDir;
    private final StoredFileRepository storedFileRepository;
    private final JdbcTemplate jdbcTemplate;

    public LocalFileStorageServiceImpl(
            @Value("${file.upload.base-dir:uploads}") String uploadBaseDir,
            StoredFileRepository storedFileRepository,
            JdbcTemplate jdbcTemplate) {
        this.uploadBaseDir = uploadBaseDir;
        this.storedFileRepository = storedFileRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void initTable() {
        try {
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS stored_files (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "file_path VARCHAR(512) NOT NULL UNIQUE, " +
                "content_type VARCHAR(128), " +
                "file_data BYTEA NOT NULL, " +
                "file_size BIGINT, " +
                "created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP" +
                ")"
            );
            log.info("[FileStorage] Ensured 'stored_files' table exists in database.");
        } catch (Exception e) {
            log.warn("[FileStorage] Could not auto-create 'stored_files' table (may already exist or permission limited): {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public String store(MultipartFile file, String subDir) throws Exception {
        if (file == null || file.isEmpty()) {
            throw JobPortalException.badRequest("File must not be empty");
        }

        String contentType = file.getContentType();
        boolean isResume = "resume".equalsIgnoreCase(subDir);
        Set<String> allowed = isResume ? ALLOWED_DOCUMENT_TYPES : ALLOWED_IMAGE_TYPES;

        if (contentType == null || !allowed.contains(contentType.toLowerCase())) {
            String types = isResume ? "PDF, DOC, DOCX" : "JPEG, PNG, WEBP, GIF";
            throw JobPortalException.badRequest("Invalid file type. Allowed: " + types);
        }

        String sanitizedName = sanitize(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + "_" + sanitizedName;
        String relativePath = subDir + "/" + fileName;

        // 1. Write to local disk cache
        try {
            Path directory = Paths.get(uploadBaseDir, subDir).toAbsolutePath().normalize();
            Files.createDirectories(directory);
            Path destinationPath = directory.resolve(fileName);
            Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            log.warn("[FileStorage] Could not write to local disk cache: {}", e.getMessage());
        }

        // 2. Persist to PostgreSQL database backing store
        try {
            byte[] bytes = file.getBytes();
            StoredFile storedFile = storedFileRepository.findByFilePath(relativePath)
                    .orElse(new StoredFile());
            storedFile.setFilePath(relativePath);
            storedFile.setContentType(contentType);
            storedFile.setData(bytes);
            storedFile.setFileSize(file.getSize());
            storedFileRepository.save(storedFile);
            log.info("[FileStorage] Successfully stored file '{}' ({} bytes) in database & disk.", relativePath, bytes.length);
        } catch (Exception e) {
            log.error("[FileStorage] Error persisting file '{}' to database: {}", relativePath, e.getMessage(), e);
        }

        return relativePath;
    }

    @Override
    @Transactional
    public void delete(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        try {
            Path path = Paths.get(uploadBaseDir, relativePath).toAbsolutePath().normalize();
            Files.deleteIfExists(path);
        } catch (Exception ignored) {
        }

        try {
            storedFileRepository.deleteByFilePath(relativePath);
        } catch (Exception e) {
            log.warn("[FileStorage] Could not delete file '{}' from database: {}", relativePath, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadAsResource(String relativePath) throws Exception {
        if (relativePath == null || relativePath.isBlank()) {
            return null;
        }

        Path localPath = Paths.get(uploadBaseDir, relativePath).toAbsolutePath().normalize();

        // 1. Check local disk
        if (Files.exists(localPath) && Files.isReadable(localPath) && Files.size(localPath) > 0) {
            return new UrlResource(localPath.toUri());
        }

        // 2. Fallback to database store (ephemeral container self-healing)
        try {
            Optional<StoredFile> storedOpt = storedFileRepository.findByFilePath(relativePath);
            if (storedOpt.isPresent()) {
                StoredFile stored = storedOpt.get();
                byte[] data = stored.getData();
                if (data != null && data.length > 0) {
                    // Restore to disk cache in background
                    try {
                        Files.createDirectories(localPath.getParent());
                        Files.write(localPath, data);
                        log.info("[FileStorage] Restored missing file '{}' from database to disk cache.", relativePath);
                    } catch (Exception e) {
                        log.warn("[FileStorage] Could not restore file to disk cache: {}", e.getMessage());
                    }
                    return new ByteArrayResource(data) {
                        @Override
                        public String getFilename() {
                            return localPath.getFileName().toString();
                        }
                    };
                }
            }
        } catch (Exception e) {
            log.warn("[FileStorage] Could not fetch file '{}' from database store: {}", relativePath, e.getMessage());
        }

        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public String getContentType(String relativePath) {
        if (relativePath == null) return "application/octet-stream";
        try {
            Optional<StoredFile> storedOpt = storedFileRepository.findByFilePath(relativePath);
            if (storedOpt.isPresent() && storedOpt.get().getContentType() != null) {
                return storedOpt.get().getContentType();
            }
        } catch (Exception ignored) {}
        try {
            Path localPath = Paths.get(uploadBaseDir, relativePath).toAbsolutePath().normalize();
            String probed = Files.probeContentType(localPath);
            if (probed != null) return probed;
        } catch (Exception ignored) {}

        String lower = relativePath.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
    }

    private String sanitize(String originalFilename) {
        if (originalFilename == null) return "file";
        return originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
