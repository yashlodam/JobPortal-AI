package com.jobportal.serviceImpl;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.service.EmailService;

/**
 * Pure Brevo Transactional Email Service.
 *
 * <p>Communicates directly and exclusively via Brevo REST API v3
 * ({@code POST https://api.brevo.com/v3/smtp/email}) using Java 21 native {@link HttpClient}.
 *
 * <p>Benefits over legacy SMTP:
 * <ul>
 *   <li>100% immune to blocked outbound SMTP ports (587, 465, 25) on cloud hosts and restricted networks.</li>
 *   <li>Zero external mail server configuration needed — operates solely on Brevo API Key.</li>
 *   <li>Instant HTTP 201 response with Brevo message ID confirmation.</li>
 *   <li>Lightweight and fast with native connection pooling and timeouts.</li>
 * </ul>
 */
@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:${app.mail.from-email:noreply@shopsphere.com}}")
    private String senderEmail;

    @Value("${brevo.sender.fallback:namijojo5687@gmail.com}")
    private String fallbackSenderEmail;

    @Value("${brevo.sender.name:${app.mail.from-name:JobPortal AI}}")
    private String senderName;

    public EmailServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public boolean sendOtpEmail(String recipientName, String recipientEmail, String otpCode) {
        String cleanEmail = recipientEmail != null ? recipientEmail.trim().toLowerCase(Locale.ROOT) : "";
        String safeName = (recipientName != null && !recipientName.isBlank()) ? recipientName.trim() : "Member";

        String subject = "JobPortal AI — Your Verification Code: " + otpCode;
        String htmlContent = buildOtpEmailTemplate(safeName, otpCode);

        try {
            boolean sent = sendHtmlEmail(cleanEmail, safeName, subject, htmlContent);
            if (sent) {
                log.info("Brevo API: Successfully delivered OTP email to [{}]", cleanEmail);
                return true;
            }
        } catch (Exception ex) {
            log.error("[Brevo Error] Failed to send OTP email to [{}]: {}", cleanEmail, ex.getMessage());
        }

        // Fallback display in console so developer/user is informed
        log.warn("""

                ================================================================================
                [BREVO EMAIL NOTICE] Delivery issue for [{}]
                >>> ACTIVE VERIFICATION CODE FOR [{}] IS: [{}] <<<
                (Valid for 10 minutes. Enter this code on the password reset screen)
                ================================================================================""",
                cleanEmail, cleanEmail, otpCode);

        return false;
    }

    @Override
    public boolean sendHtmlEmail(String toEmail, String toName, String subject, String htmlContent) {
        String cleanToEmail = toEmail != null ? toEmail.trim().toLowerCase(Locale.ROOT) : "";
        String cleanToName = (toName != null && !toName.isBlank()) ? toName.trim() : cleanToEmail;
        String effectiveFromEmail = (senderEmail != null && !senderEmail.isBlank()) ? senderEmail.trim() : "namijojo5687@gmail.com";
        String effectiveFromName = (senderName != null && !senderName.isBlank()) ? senderName.trim() : "JobPortal AI";
        String effectiveApiKey = (brevoApiKey != null && !brevoApiKey.isBlank()) ? brevoApiKey.trim() : "";

        if (effectiveApiKey.isBlank()) {
            log.error("[Brevo Error] Cannot send email — brevo.api-key is missing or empty.");
            throw new IllegalStateException("Brevo API key is not configured.");
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", Map.of("name", effectiveFromName, "email", effectiveFromEmail));
            payload.put("to", List.of(Map.of("email", cleanToEmail, "name", cleanToName)));
            payload.put("subject", subject);
            payload.put("htmlContent", htmlContent);

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_API_URL))
                    .header("accept", "application/json")
                    .header("api-key", effectiveApiKey)
                    .header("content-type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            int status = response.statusCode();

            if (status >= 200 && status < 300) {
                String messageId = "";
                try {
                    JsonNode node = objectMapper.readTree(response.body());
                    if (node.has("messageId")) {
                        messageId = node.get("messageId").asText();
                    }
                } catch (Exception ignored) {}

                log.info("Brevo API: Email '{}' delivered to [{}] (Status: {}, MessageId: {})",
                        subject, cleanToEmail, status, messageId);
                return true;
            } else {
                log.error("Brevo API error response (HTTP {}): {}", status, response.body());
                throw new RuntimeException("Brevo API rejected email (HTTP " + status + "): " + response.body());
            }

        } catch (Exception ex) {
            log.error("Brevo API execution failed for [{}]: {}", cleanToEmail, ex.getMessage());
            throw new RuntimeException("Brevo email transmission error: " + ex.getMessage(), ex);
        }
    }

    private String buildOtpEmailTemplate(String name, String otp) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset OTP</title>
                </head>
                <body style="margin:0;padding:0;background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f19;padding:40px 16px;">
                        <tr>
                            <td align="center">
                                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#111827;border:1px solid #1f2937;border-radius:20px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
                                    <!-- Header Gradient -->
                                    <tr>
                                        <td style="background:linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%);padding:32px 24px;text-align:center;">
                                            <h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">JobPortal AI</h1>
                                            <p style="margin:6px 0 0;font-size:14px;color:#bfdbfe;letter-spacing:0.5px;font-weight:500;">Next-Gen Career & Recruitment Platform</p>
                                        </td>
                                    </tr>

                                    <!-- Content -->
                                    <tr>
                                        <td style="padding:40px 32px;">
                                            <div style="display:inline-block;padding:6px 14px;background-color:#1e3a8a;border:1px solid #3b82f6;border-radius:9999px;font-size:12px;font-weight:600;color:#93c5fd;text-transform:uppercase;letter-spacing:1px;margin-bottom:20px;">
                                                Security Verification
                                            </div>
                                            <h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#f9fafb;">Password Reset Request</h2>
                                            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#9ca3af;">
                                                Hello <strong style="color:#ffffff;">{{name}}</strong>,
                                            </p>
                                            <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#9ca3af;">
                                                We received a request to reset your password. Use the 6-digit verification code below to complete the reset:
                                            </p>

                                            <!-- OTP Card -->
                                            <div style="background-color:#0f172a;border:2px dashed #3b82f6;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
                                                <div style="font-size:11px;font-weight:700;color:#60a5fa;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">
                                                    Your Verification Code
                                                </div>
                                                <div style="font-size:38px;font-weight:800;letter-spacing:12px;color:#38bdf8;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
                                                    {{otp}}
                                                </div>
                                            </div>

                                            <div style="background-color:#1e1e2d;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:6px;margin-bottom:24px;">
                                                <p style="margin:0;font-size:13px;color:#fbbf24;">
                                                    ⏳ <strong>Valid for 10 minutes.</strong> Never share this code with anyone.
                                                </p>
                                            </div>

                                            <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
                                                If you did not initiate this request, you can safely ignore this email — your account remains secure.
                                            </p>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color:#0b0f19;border-top:1px solid #1f2937;padding:24px 32px;text-align:center;">
                                            <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">
                                                Sent securely via Brevo Delivery Network
                                            </p>
                                            <p style="margin:0;font-size:11px;color:#4b5563;">
                                                © 2026 JobPortal AI. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .replace("{{name}}", name)
                .replace("{{otp}}", otp);
    }
}
