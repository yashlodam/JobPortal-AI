package com.jobportal.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Controller to serve uploaded files (resumes, avatars, logos) with correct Content-Type,
 * inline disposition for PDF viewing, and proper 404 handling.
 */
@RestController
@RequestMapping("/uploads")
public class FileServingController {

    private final Path uploadRoot;

    public FileServingController(@Value("${file.upload.base-dir:uploads}") String uploadBaseDir) {
        this.uploadRoot = Paths.get(uploadBaseDir).toAbsolutePath().normalize();
    }

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        // Extract path after /uploads/
        String fullPath = request.getRequestURI();
        String relativePath = fullPath.substring(fullPath.indexOf("/uploads/") + "/uploads/".length());

        // ── Security Gate for Resumes: require authenticated user ────────────
        if (relativePath.startsWith("resume/") || relativePath.startsWith("resume\\")) {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        try {
            Path targetFile = uploadRoot.resolve(relativePath).normalize();

            // Prevent path traversal outside uploadRoot
            if (!targetFile.startsWith(uploadRoot)) {
                return ResponseEntity.badRequest().build();
            }

            if (!Files.exists(targetFile) || !Files.isReadable(targetFile)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(targetFile.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(targetFile);
            if (contentType == null) {
                if (relativePath.endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else if (relativePath.endsWith(".png")) {
                    contentType = "image/png";
                } else if (relativePath.endsWith(".jpg") || relativePath.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + targetFile.getFileName().toString() + "\"")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
