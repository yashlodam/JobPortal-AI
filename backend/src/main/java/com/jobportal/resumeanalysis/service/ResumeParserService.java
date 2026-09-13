package com.jobportal.resumeanalysis.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.jobportal.entity.Resume;
import com.jobportal.exception.JobPortalException;

/**
 * Parses text content from uploaded resume files (PDF or DOCX).
 *
 * <h3>Supported formats</h3>
 * <ul>
 *   <li>PDF  — Apache PDFBox 3.x</li>
 *   <li>DOCX — Apache POI XWPFWordExtractor</li>
 * </ul>
 *
 * <p>Also computes an MD5 hash of the file bytes, used downstream to detect
 * whether the file changed since the last analysis (cache invalidation).</p>
 */
@Service
public class ResumeParserService {

    private static final Logger log = LoggerFactory.getLogger(ResumeParserService.class);

    private static final int MIN_TEXT_LENGTH = 50;
    private static final int MAX_EXTRACTED_CHARS = 30_000;
    private static final int MAX_RESUME_PAGES = 10;

    @Value("${file.upload.base-dir}")
    private String uploadBaseDir;

    /**
     * Extracts all readable text from a resume file.
     *
     * @param resume the Resume entity (uses {@code resumeUrl} to locate the file)
     * @return extracted plain text
     * @throws JobPortalException if file not found, unsupported type, or parse failure
     */
    public String extractText(Resume resume) {
        if (resume == null || resume.getResumeUrl() == null) {
            throw JobPortalException.badRequest("Resume file information is missing.");
        }

        Path filePath = Paths.get(uploadBaseDir, resume.getResumeUrl());
        File file = filePath.toFile();

        if (!file.exists() || !file.isFile()) {
            throw JobPortalException.notFound(
                    "Resume file not found on disk. Please re-upload the resume.");
        }

        String contentType = resume.getContentType();
        if (contentType == null) {
            contentType = detectContentType(resume.getFileName());
        }

        try {
            String extractedText = switch (contentType) {
                case "application/pdf" -> extractFromPdf(file);
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                     "application/msword" -> extractFromDocx(file);
                default -> throw JobPortalException.badRequest(
                        "Unsupported resume format: " + contentType + ". Please upload a PDF or DOCX file.");
            };

            log.info("Extracted {} characters from resume [{}] (format: {})",
                    extractedText.length(), resume.getFileName(), contentType);

            return extractedText;
        } catch (JobPortalException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse resume file [{}]: {}", resume.getFileName(), e.getMessage(), e);
            throw JobPortalException.internalError(
                    "Failed to parse the resume file. Please ensure it is not corrupted or password-protected.");
        }
    }

    /**
     * Computes the MD5 hash of the resume file bytes.
     * Used for cache invalidation: if the hash matches the stored analysis hash,
     * the cached analysis is returned without re-calling the AI.
     */
    public String computeFileHash(Resume resume) {
        if (resume == null || resume.getResumeUrl() == null) {
            return "";
        }
        Path filePath = Paths.get(uploadBaseDir, resume.getResumeUrl());
        File file = filePath.toFile();
        if (!file.exists()) {
            return "";
        }
        try (FileInputStream fis = new FileInputStream(file)) {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = fis.read(buffer)) != -1) {
                md.update(buffer, 0, bytesRead);
            }
            byte[] hashBytes = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.warn("Could not compute file hash for resume [{}]: {}", resume.getFileName(), e.getMessage());
            return "";
        }
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    private String extractFromPdf(File file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            stripper.setStartPage(1);
            stripper.setEndPage(MAX_RESUME_PAGES);
            String text = stripper.getText(document);
            if (text == null || text.trim().length() < MIN_TEXT_LENGTH) {
                throw JobPortalException.badRequest(
                        "The PDF appears to be image-based or empty. Please upload a text-selectable PDF.");
            }
            String trimmed = text.trim();
            return trimmed.length() > MAX_EXTRACTED_CHARS
                    ? trimmed.substring(0, MAX_EXTRACTED_CHARS)
                    : trimmed;
        }
    }

    private String extractFromDocx(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            String text = extractor.getText();
            if (text == null || text.trim().length() < MIN_TEXT_LENGTH) {
                throw JobPortalException.badRequest(
                        "The DOCX file appears to be empty or unreadable.");
            }
            String trimmed = text.trim();
            return trimmed.length() > MAX_EXTRACTED_CHARS
                    ? trimmed.substring(0, MAX_EXTRACTED_CHARS)
                    : trimmed;
        }
    }

    private String detectContentType(String fileName) {
        if (fileName == null) return "unknown";
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf"))  return "application/pdf";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".doc"))  return "application/msword";
        return "unknown";
    }
}
