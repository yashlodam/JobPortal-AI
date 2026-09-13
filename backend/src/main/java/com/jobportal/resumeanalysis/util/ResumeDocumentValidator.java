package com.jobportal.resumeanalysis.util;

import java.util.regex.Pattern;
import com.jobportal.exception.JobPortalException;

/**
 * Validates whether extracted document text is a valid professional resume.
 * Prevents non-resume documents (invoices, articles, code snippets, random letters)
 * from being processed by the resume scoring engine.
 */
public class ResumeDocumentValidator {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(\\+?\\d{1,3}[-.\\s]?)?(\\(?\\d{3,5}\\)?[-.\\s]?)?\\d{3,5}[-.\\s]?\\d{4}",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern WORK_PATTERNS = Pattern.compile(
            "\\b(experience|employment|work history|career|position|responsibilities|projects|project|developer|engineer|manager|intern|internship)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern EDUCATION_PATTERNS = Pattern.compile(
            "\\b(education|academic|degree|bachelor|master|b\\.tech|m\\.tech|b\\.e|m\\.e|b\\.sc|m\\.sc|phd|diploma|university|college|school|gpa|cgpa)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SKILL_PATTERNS = Pattern.compile(
            "\\b(skills|technical skills|technologies|proficiencies|competencies|languages|frameworks|java|python|react|javascript|sql|html|css|aws|docker)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern NON_RESUME_INVOICE = Pattern.compile(
            "\\b(invoice|bill to|total due|payment due|tax id|receipt|purchase order|subtotal|balance due)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private ResumeDocumentValidator() {}

    /**
     * Validates resume text. Throws {@link JobPortalException} if text is not a valid resume.
     *
     * @param text normalized or raw document text
     */
    public static void validateResumeContent(String text) {
        if (text == null || text.isBlank()) {
            throw JobPortalException.badRequest("Document text is empty. Please upload a readable PDF or DOCX file.");
        }

        String lower = text.toLowerCase();
        int wordCount = text.split("\\s+").length;

        if (wordCount < 25) {
            throw JobPortalException.badRequest(
                    "Uploaded document is too short (" + wordCount + " words). A valid resume must contain at least 25 words detailing your experience, education, and skills.");
        }

        // Explicit Non-Resume Rejection (Invoices, Receipts, Purchase Orders)
        var invoiceMatcher = NON_RESUME_INVOICE.matcher(lower);
        int invoiceMatches = 0;
        while (invoiceMatcher.find()) {
            invoiceMatches++;
        }
        if (invoiceMatches >= 2 && !lower.contains("experience") && !lower.contains("education")) {
            throw JobPortalException.badRequest(
                    "The uploaded document appears to be an invoice or receipt, not a professional resume. Please upload a valid resume file.");
        }

        boolean hasContact = EMAIL_PATTERN.matcher(text).find() || PHONE_PATTERN.matcher(text).find() || lower.contains("linkedin.com") || lower.contains("github.com");
        boolean hasWork = countMatches(WORK_PATTERNS, lower) >= 1;
        boolean hasEdu = countMatches(EDUCATION_PATTERNS, lower) >= 1;
        boolean hasSkills = countMatches(SKILL_PATTERNS, lower) >= 1;

        int score = 0;
        if (hasContact) score += 1;
        if (hasWork) score += 1;
        if (hasEdu) score += 1;
        if (hasSkills) score += 1;

        // Must satisfy at least 2 primary structural resume indicators
        if (score < 2) {
            throw JobPortalException.badRequest(
                    "The uploaded document does not appear to be a professional resume. A valid resume must include work experience, education, or technical skills.");
        }
    }

    private static int countMatches(Pattern pattern, String text) {
        var matcher = pattern.matcher(text);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }
}
