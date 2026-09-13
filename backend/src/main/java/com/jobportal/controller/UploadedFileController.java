package com.jobportal.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.utility.FileStorageService;

/**
 * Controller to reliably serve uploaded static assets (avatars, banners, resumes, logos)
 * with universal CORS support and automatic database-fallback recovery.
 */
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UploadedFileController {

    private static final Logger log = LoggerFactory.getLogger(UploadedFileController.class);

    private final FileStorageService fileStorageService;

    public UploadedFileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/uploads/{subDir}/{fileName:.+}")
    public ResponseEntity<Resource> getUploadedFile(
            @PathVariable String subDir,
            @PathVariable String fileName) {
        try {
            String relativePath = subDir + "/" + fileName;
            Resource resource = fileStorageService.loadAsResource(relativePath);

            if (resource == null || !resource.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, HEAD, OPTIONS")
                        .build();
            }

            String contentType = fileStorageService.getContentType(relativePath);
            MediaType mediaType;
            try {
                mediaType = MediaType.parseMediaType(contentType);
            } catch (Exception e) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, HEAD, OPTIONS")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .contentType(mediaType)
                    .body(resource);

        } catch (Exception e) {
            log.error("[UploadedFileController] Error loading file '{}/{}': {}", subDir, fileName, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, HEAD, OPTIONS")
                    .build();
        }
    }
}
