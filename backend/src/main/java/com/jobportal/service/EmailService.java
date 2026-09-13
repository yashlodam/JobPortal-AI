package com.jobportal.service;

/**
 * Service for sending transactional emails (OTP codes, alerts, notifications)
 * powered by Brevo (formerly Sendinblue) via either SMTP Relay or Brevo REST API v3.
 */
public interface EmailService {

    /**
     * Sends an OTP verification email.
     *
     * @param recipientName  the recipient's name
     * @param recipientEmail the recipient's email address
     * @param otpCode        the 6-digit verification code
     * @return true if successfully delivered via Brevo, false if fallback/failed
     */
    boolean sendOtpEmail(String recipientName, String recipientEmail, String otpCode);

    /**
     * Sends an HTML email to the specified recipient.
     *
     * @param toEmail     recipient email
     * @param toName      recipient display name (optional)
     * @param subject     email subject
     * @param htmlContent HTML body
     * @return true if successfully sent, false otherwise
     */
    boolean sendHtmlEmail(String toEmail, String toName, String subject, String htmlContent);
}
