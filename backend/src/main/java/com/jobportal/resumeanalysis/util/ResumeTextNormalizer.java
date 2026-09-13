package com.jobportal.resumeanalysis.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Utility for normalizing extracted resume text and computing deterministic SHA-256 hashes.
 */
public class ResumeTextNormalizer {

    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\p{Cntrl}&&[^\r\n\t]]");
    private static final Pattern MULTIPLE_SPACES = Pattern.compile("[ \\t]+");
    private static final Pattern MULTIPLE_NEWLINES = Pattern.compile("(\\n){3,}");

    private ResumeTextNormalizer() {}

    /**
     * Normalizes raw text extracted from PDF or DOCX documents:
     * - Unicode NFC normalization
     * - Strips zero-width and control characters
     * - Standardizes line endings (\n)
     * - Trims each line and collapses redundant spaces while preserving structural layout
     *
     * @param rawText raw extracted text
     * @return normalized text
     */
    public static String normalize(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "";
        }

        // 1. Unicode NFC normalization
        String text = Normalizer.normalize(rawText, Normalizer.Form.NFC);

        // 2. Remove control characters (except newlines and tabs)
        text = CONTROL_CHARS.matcher(text).replaceAll("");

        // 3. Normalize line endings to standard \n
        text = text.replace("\r\n", "\n").replace("\r", "\n");

        // 4. Per-line trimming and space collapsing
        String[] lines = text.split("\n");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            String line = MULTIPLE_SPACES.matcher(lines[i]).replaceAll(" ").trim();
            sb.append(line);
            if (i < lines.length - 1) {
                sb.append("\n");
            }
        }
        text = sb.toString();

        // 5. Limit consecutive newlines to maximum 2
        text = MULTIPLE_NEWLINES.matcher(text).replaceAll("\n\n");

        return text.trim();
    }

    /**
     * Computes the SHA-256 hash of the normalized text content.
     *
     * @param rawText raw or normalized resume text
     * @return 64-character hexadecimal SHA-256 hash
     */
    public static String computeSha256Hash(String rawText) {
        String normalized = normalize(rawText);
        if (normalized.isEmpty()) {
            return "";
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(normalized.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute SHA-256 hash", e);
        }
    }
}
