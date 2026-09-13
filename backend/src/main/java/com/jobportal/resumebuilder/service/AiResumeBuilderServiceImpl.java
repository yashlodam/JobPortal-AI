package com.jobportal.resumebuilder.service;

import java.util.ArrayList;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.UserRepository;
import com.jobportal.resumebuilder.dto.AiImprovementRequest;
import com.jobportal.resumebuilder.dto.AiImprovementResponse;
import com.jobportal.resumebuilder.dto.AiSkillSuggestionResponse;
import com.jobportal.resumebuilder.dto.AiSummaryResponse;
import com.jobportal.resumebuilder.entity.ResumeAchievement;
import com.jobportal.resumebuilder.entity.ResumeCertification;
import com.jobportal.resumebuilder.entity.ResumeDocument;
import com.jobportal.resumebuilder.entity.ResumeEducation;
import com.jobportal.resumebuilder.entity.ResumeExperience;
import com.jobportal.resumebuilder.entity.ResumeProject;
import com.jobportal.resumebuilder.enums.AiTone;
import com.jobportal.resumebuilder.repository.ResumeDocumentRepository;

/**
 * Enhanced implementation of {@link AiResumeBuilderService} leveraging Spring AI {@link ChatClient}
 * with structured outputs, advanced prompt engineering, and strict anti-hallucination guardrails.
 */
@Service
public class AiResumeBuilderServiceImpl implements AiResumeBuilderService {

    private static final Logger log = LoggerFactory.getLogger(AiResumeBuilderServiceImpl.class);

    private final ChatClient chatClient;
    private final ResumeDocumentRepository resumeRepository;
    private final UserRepository userRepository;

    public AiResumeBuilderServiceImpl(ChatClient.Builder chatClientBuilder,
                                       ResumeDocumentRepository resumeRepository,
                                       UserRepository userRepository) {
        this.chatClient = chatClientBuilder.build();
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    // ── 1. Generate Professional Summary ──────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AiSummaryResponse generateProfessionalSummary(Long resumeId, String email) throws JobPortalException {
        ResumeDocument doc = findAndValidateOwnership(resumeId, email);
        String context = buildResumeContext(doc);

        String systemPrompt = """
                You are a senior executive resume writer and career coach with 20+ years of recruitment expertise.
                Your task is to generate a powerful, high-impact 3-4 sentence professional summary tailored to the candidate's background.

                CRITICAL ACCURACY & SECURITY RULES:
                1. NEVER invent employment history, degrees, companies, certifications, or unmentioned tools.
                2. If the candidate is a student or fresher (0 work experience), emphasize technical skills, hands-on projects, problem-solving, and academic background.
                3. If the candidate has work experience, highlight their core domain, key technologies, and engineering impact.
                4. Tone must be confident, active, professional, and ATS-friendly.
                5. Return structured JSON with:
                   - 'summary': A polished, cohesive 3-4 sentence professional summary.
                   - 'suggestions': A list of 2-3 specific, actionable recommendations to improve the resume or summary further.
                """;

        log.info("\n==================== GENERATING AI PROFESSIONAL SUMMARY ====================\n" +
                 "Resume ID: {}\nUser: {}\nContext Length: {} chars\n" +
                 "============================================================================",
                 resumeId, email, context.length());

        try {
            AiSummaryResponse response = chatClient
                    .prompt()
                    .system(systemPrompt)
                    .user("Candidate Resume Information:\n\n" + context)
                    .call()
                    .entity(AiSummaryResponse.class);

            if (response == null || response.getSummary() == null || response.getSummary().isBlank()) {
                log.warn("AI returned empty summary. Generating contextual fallback.");
                response = generateFallbackSummary(doc);
            }

            if (response.getSuggestions() == null) {
                response.setSuggestions(List.of(
                        "Highlight your top technical projects and tools prominently in your resume.",
                        "Quantify key achievements with measurable business impact where possible."
                ));
            }

            log.info("\n==================== AI SUMMARY GENERATED ====================\n" +
                     "Summary: {}\nSuggestions Count: {}\n" +
                     "=============================================================",
                     response.getSummary(), response.getSuggestions().size());

            return response;

        } catch (JobPortalException e) {
            throw e;
        } catch (Exception e) {
            log.warn("AI summary generation error, falling back to contextual summary: {}", e.getMessage());
            return generateFallbackSummary(doc);
        }
    }

    // ── 2. Content & Bullet Point Improvement ─────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AiImprovementResponse improveContent(Long resumeId, AiImprovementRequest request, String email) throws JobPortalException {
        ResumeDocument doc = findAndValidateOwnership(resumeId, email);

        if (request.getContent() == null || request.getContent().trim().isBlank()) {
            throw JobPortalException.badRequest("Content to improve cannot be empty.");
        }

        AiTone tone = request.getTone() != null ? request.getTone() : AiTone.IMPACTFUL;
        String toneInstructions = getToneInstructions(tone);

        String systemPrompt = """
                You are a world-class resume editor and ATS optimization expert.
                Your task is to rewrite and elevate the provided resume bullet point or paragraph according to the specified tone.

                TONE GUIDELINES (%s):
                %s

                CRITICAL ACCURACY & ANTI-HALLUCINATION RULES:
                1. PRESERVE FACTUAL INTEGRITY: Never fabricate metrics (e.g., 'reduced latency by 60%%'), dates, tools, or achievements that the user did not provide.
                2. If the original text mentions a task (e.g. 'worked on spring boot APIs'), use powerful technical action verbs (e.g. 'Architected and implemented RESTful microservices using Spring Boot').
                3. Eliminate weak passive voice, filler words, and awkward phrasing.
                4. Return structured JSON with:
                   - 'original': The exact original input text.
                   - 'suggestion': The polished, enhanced rewritten version.
                   - 'reasoning': A brief 1-2 sentence explanation of why the rewritten version is stronger (e.g., strong action verb, enhanced ATS clarity).
                """.formatted(tone.name(), toneInstructions);

        String userPrompt = """
                Candidate Title: %s
                Target Section: %s
                Tone: %s
                Original Text:
                "%s"
                """.formatted(
                doc.getProfessionalTitle() != null ? doc.getProfessionalTitle() : "Software Professional",
                request.getSectionType() != null ? request.getSectionType() : "EXPERIENCE",
                tone.name(),
                request.getContent().trim()
        );

        log.info("\n==================== IMPROVING RESUME CONTENT ====================\n" +
                 "Resume ID: {}\nSection: {}\nTone: {}\nInput: {}\n" +
                 "==================================================================",
                 resumeId, request.getSectionType(), tone, request.getContent());

        try {
            AiImprovementResponse response = chatClient
                    .prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .entity(AiImprovementResponse.class);

            if (response == null || response.getSuggestion() == null || response.getSuggestion().isBlank()) {
                response = new AiImprovementResponse(
                        request.getContent(),
                        request.getContent(),
                        "Original phrasing maintained as no improvements were needed."
                );
            } else {
                response.setOriginal(request.getContent());
                if (response.getReasoning() == null || response.getReasoning().isBlank()) {
                    response.setReasoning("Enhanced with strong action verbs and ATS-optimized technical clarity.");
                }
            }

            log.info("\n==================== CONTENT IMPROVED ====================\n" +
                     "Suggestion: {}\nReasoning: {}\n" +
                     "==========================================================",
                     response.getSuggestion(), response.getReasoning());

            return response;

        } catch (JobPortalException e) {
            throw e;
        } catch (Exception e) {
            log.warn("AI content improvement error, returning rule-based polish: {}", e.getMessage());
            return generateFallbackImprovement(request.getContent(), tone);
        }
    }

    // ── 3. Skill Suggestions Generator ────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AiSkillSuggestionResponse suggestSkills(Long resumeId, String email) throws JobPortalException {
        ResumeDocument doc = findAndValidateOwnership(resumeId, email);
        String context = buildResumeContext(doc);
        List<String> existingSkills = doc.getSkills() != null ? doc.getSkills() : List.of();

        String systemPrompt = """
                You are a senior technical recruiter and talent advisor.
                Analyze the candidate's resume context (title, experience, projects, education) and recommend high-demand technical & core engineering skills.

                INSTRUCTIONS:
                1. DO NOT recommend skills the candidate has ALREADY listed: %s
                2. 'recommendedSkills': Suggest 5-8 highly relevant skills that naturally align with their current tech stack and projects.
                3. 'missingCategorySkills': Suggest 3-5 foundational modern tools or practices (e.g. Docker, CI/CD, Unit Testing, Agile, Git) that strengthen their profile.
                4. Return clean, standard industry skill names (e.g., 'Spring Boot', 'PostgreSQL', 'Docker', 'REST APIs').
                """.formatted(String.join(", ", existingSkills));

        log.info("Generating AI skill suggestions for resume id=[{}] existingSkillsCount=[{}]", resumeId, existingSkills.size());

        try {
            AiSkillSuggestionResponse response = chatClient
                    .prompt()
                    .system(systemPrompt)
                    .user("Resume Context:\n\n" + context)
                    .call()
                    .entity(AiSkillSuggestionResponse.class);

            if (response == null) {
                response = new AiSkillSuggestionResponse(new ArrayList<>(), new ArrayList<>());
            }

            // Clean & filter out duplicates that the user already has
            Set<String> existingLower = new HashSet<>();
            for (String s : existingSkills) {
                existingLower.add(s.trim().toLowerCase());
            }

            List<String> cleanRecommended = new ArrayList<>();
            if (response.getRecommendedSkills() != null) {
                for (String s : response.getRecommendedSkills()) {
                    if (s != null && !s.isBlank() && !existingLower.contains(s.trim().toLowerCase())) {
                        cleanRecommended.add(s.trim());
                    }
                }
            }

            List<String> cleanMissing = new ArrayList<>();
            if (response.getMissingCategorySkills() != null) {
                for (String s : response.getMissingCategorySkills()) {
                    if (s != null && !s.isBlank() && !existingLower.contains(s.trim().toLowerCase())) {
                        cleanMissing.add(s.trim());
                    }
                }
            }

            response.setRecommendedSkills(cleanRecommended);
            response.setMissingCategorySkills(cleanMissing);

            log.info("AI recommended [{}] skills and [{}] category skills", cleanRecommended.size(), cleanMissing.size());
            return response;

        } catch (JobPortalException e) {
            throw e;
        } catch (Exception e) {
            log.warn("AI skill suggestion error, generating contextual fallback skills: {}", e.getMessage());
            return generateFallbackSkills(doc, existingSkills);
        }
    }

    // ── Helper Methods ───────────────────────────────────────────────────────

    private ResumeDocument findAndValidateOwnership(Long resumeId, String email) throws JobPortalException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("User not found: " + email));

        return resumeRepository.findWithAllSectionsByIdAndUserId(resumeId, user.getId())
                .orElseThrow(() -> JobPortalException.notFound("Resume not found with id: " + resumeId));
    }

    private String buildResumeContext(ResumeDocument doc) {
        StringBuilder sb = new StringBuilder();
        sb.append("Professional Title: ").append(doc.getProfessionalTitle() != null ? doc.getProfessionalTitle() : "Software Developer").append("\n");
        sb.append("Full Name: ").append(doc.getFullName() != null ? doc.getFullName() : "Candidate").append("\n");
        if (doc.getLocation() != null) sb.append("Location: ").append(doc.getLocation()).append("\n");
        if (doc.getProfessionalSummary() != null && !doc.getProfessionalSummary().isBlank()) {
            sb.append("Current Summary: ").append(doc.getProfessionalSummary()).append("\n");
        }
        if (doc.getSkills() != null && !doc.getSkills().isEmpty()) {
            sb.append("Current Skills: ").append(String.join(", ", doc.getSkills())).append("\n");
        }
        if (doc.getLanguages() != null && !doc.getLanguages().isEmpty()) {
            sb.append("Languages Spoken: ").append(String.join(", ", doc.getLanguages())).append("\n");
        }
        sb.append("\n");

        if (doc.getExperienceList() != null && !doc.getExperienceList().isEmpty()) {
            sb.append("WORK EXPERIENCE:\n");
            for (ResumeExperience exp : doc.getExperienceList()) {
                sb.append("- ").append(exp.getPosition()).append(" at ").append(exp.getCompany());
                if (exp.getLocation() != null) sb.append(" (").append(exp.getLocation()).append(")");
                sb.append(" [").append(exp.getStartDate() != null ? exp.getStartDate() : "").append(" to ")
                  .append(exp.isCurrentlyWorking() ? "Present" : (exp.getEndDate() != null ? exp.getEndDate() : "")).append("]\n");
                if (exp.getDescription() != null && !exp.getDescription().isBlank()) {
                    sb.append("  Responsibilities & Impact: ").append(exp.getDescription()).append("\n");
                }
            }
            sb.append("\n");
        }

        if (doc.getProjectList() != null && !doc.getProjectList().isEmpty()) {
            sb.append("TECHNICAL PROJECTS:\n");
            for (ResumeProject proj : doc.getProjectList()) {
                sb.append("- Project: ").append(proj.getProjectName());
                if (proj.getTechnologies() != null) sb.append(" | Tech Stack: ").append(proj.getTechnologies());
                sb.append("\n");
                if (proj.getDescription() != null && !proj.getDescription().isBlank()) {
                    sb.append("  Description: ").append(proj.getDescription()).append("\n");
                }
            }
            sb.append("\n");
        }

        if (doc.getEducationList() != null && !doc.getEducationList().isEmpty()) {
            sb.append("EDUCATION:\n");
            for (ResumeEducation edu : doc.getEducationList()) {
                sb.append("- ").append(edu.getDegree());
                if (edu.getFieldOfStudy() != null) sb.append(" in ").append(edu.getFieldOfStudy());
                sb.append(" from ").append(edu.getInstitution());
                if (edu.getGrade() != null) sb.append(" (Grade: ").append(edu.getGrade()).append(")");
                sb.append("\n");
            }
            sb.append("\n");
        }

        if (doc.getCertificationList() != null && !doc.getCertificationList().isEmpty()) {
            sb.append("CERTIFICATIONS:\n");
            for (ResumeCertification cert : doc.getCertificationList()) {
                sb.append("- ").append(cert.getName());
                if (cert.getIssuingOrganization() != null) sb.append(" from ").append(cert.getIssuingOrganization());
                if (cert.getIssueDate() != null) sb.append(" (").append(cert.getIssueDate()).append(")");
                sb.append("\n");
            }
            sb.append("\n");
        }

        if (doc.getAchievementList() != null && !doc.getAchievementList().isEmpty()) {
            sb.append("ACHIEVEMENTS & AWARDS:\n");
            for (ResumeAchievement ach : doc.getAchievementList()) {
                sb.append("- ").append(ach.getTitle());
                if (ach.getDate() != null) sb.append(" (").append(ach.getDate()).append(")");
                sb.append("\n");
                if (ach.getDescription() != null && !ach.getDescription().isBlank()) {
                    sb.append("  ").append(ach.getDescription()).append("\n");
                }
            }
        }

        return sb.toString();
    }

    private String getToneInstructions(AiTone tone) {
        return switch (tone) {
            case PROFESSIONAL -> "Use polished corporate terminology, clear active structure, and elegant professional prose.";
            case CONCISE -> "Eliminate wordiness and unnecessary filler words. Make every single word count while retaining the core achievement.";
            case IMPACTFUL -> "Apply the Google XYZ formula ('Accomplished [X] by doing [Z]'). Start with strong power verbs (e.g., Spearheaded, Architected, Engineered, Streamlined, Orchestrated).";
            case ATS_OPTIMIZED -> "Maximize standard industry keywords, technical competencies, and clean phrasing that applicant tracking systems parse with top scores.";
        };
    }

    private AiSummaryResponse generateFallbackSummary(ResumeDocument doc) {
        String title = doc.getProfessionalTitle() != null ? doc.getProfessionalTitle() : "Software Professional";
        String summary = "Dedicated and detail-oriented " + title + " with a strong foundation in modern software engineering principles. " +
                "Demonstrated ability to design, build, and deploy reliable applications with a focus on code quality and problem solving. " +
                "Eager to contribute technical expertise and collaborate on challenging development projects.";
        return new AiSummaryResponse(summary, List.of(
                "Add your top project highlights to the summary for greater impact.",
                "Mention your key technologies in the first sentence."
        ));
    }

    private AiImprovementResponse generateFallbackImprovement(String content, AiTone tone) {
        String trimmed = content.trim();
        String improved;
        if (trimmed.toLowerCase().startsWith("worked on") || trimmed.toLowerCase().startsWith("working on")) {
            improved = "Engineered and delivered" + trimmed.substring(trimmed.indexOf(' ') + 3);
        } else if (trimmed.toLowerCase().startsWith("responsible for")) {
            improved = "Spearheaded and executed" + trimmed.substring(15);
        } else if (trimmed.toLowerCase().startsWith("helped")) {
            improved = "Collaborated across cross-functional engineering teams to accelerate" + trimmed.substring(6);
        } else if (!Character.isUpperCase(trimmed.charAt(0))) {
            improved = Character.toUpperCase(trimmed.charAt(0)) + trimmed.substring(1);
        } else {
            improved = "Successfully architected and implemented " + trimmed.substring(0, 1).toLowerCase() + trimmed.substring(1);
        }

        if (!improved.endsWith(".")) {
            improved += ".";
        }

        return new AiImprovementResponse(
                content,
                improved,
                "Elevated using high-impact technical action verbs and ATS-optimized clear phrasing."
        );
    }

    private AiSkillSuggestionResponse generateFallbackSkills(ResumeDocument doc, List<String> existingSkills) {
        Set<String> existingSet = new HashSet<>();
        for (String s : existingSkills) {
            existingSet.add(s.trim().toLowerCase());
        }

        String title = doc.getProfessionalTitle() != null ? doc.getProfessionalTitle().toLowerCase() : "";
        List<String> pool;

        if (title.contains("react") || title.contains("front") || title.contains("ui") || title.contains("web")) {
            pool = List.of("TypeScript", "React", "Next.js", "Tailwind CSS", "Redux Toolkit", "GraphQL", "Jest", "REST APIs");
        } else if (title.contains("java") || title.contains("spring") || title.contains("back")) {
            pool = List.of("Java", "Spring Boot", "PostgreSQL", "Docker", "Kubernetes", "Microservices", "AWS", "Kafka");
        } else if (title.contains("python") || title.contains("data") || title.contains("machine")) {
            pool = List.of("Python", "FastAPI", "Docker", "PostgreSQL", "Pandas", "AWS", "Git", "REST APIs");
        } else {
            pool = List.of("Git", "Docker", "PostgreSQL", "REST APIs", "CI/CD", "Agile / Scrum", "Unit Testing", "System Design");
        }

        List<String> recommended = new ArrayList<>();
        for (String s : pool) {
            if (!existingSet.contains(s.toLowerCase())) {
                recommended.add(s);
            }
        }

        List<String> category = List.of("Docker", "CI/CD Pipelines", "Unit Testing / TDD", "Git Version Control");
        List<String> missingCategory = new ArrayList<>();
        for (String s : category) {
            if (!existingSet.contains(s.toLowerCase())) {
                missingCategory.add(s);
            }
        }

        return new AiSkillSuggestionResponse(recommended, missingCategory);
    }
}

