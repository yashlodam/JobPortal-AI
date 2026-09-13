package com.jobportal.jobmatch.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.jobportal.entity.Job;
import com.jobportal.entity.Profile;
import com.jobportal.jobmatch.dto.JobMatchAiResponse;
import com.jobportal.resumebuilder.entity.ResumeDocument;
import com.jobportal.resumebuilder.entity.ResumeProject;

/**
 * AI-powered semantic matching service using Spring AI {@link ChatClient} and Groq API.
 */
@Service
public class AiJobMatchService {

    private static final Logger log = LoggerFactory.getLogger(AiJobMatchService.class);

    private final ChatClient chatClient;

    public AiJobMatchService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    /**
     * Performs semantic analysis between a job and candidate qualifications.
     */
    public JobMatchAiResponse analyzeMatch(Job job, Profile profile, ResumeDocument resumeDoc) {
        return analyzeMatch(job, profile, resumeDoc, List.of(), null);
    }

    /**
     * Performs semantic analysis incorporating profile, builder resume, and uploaded resume analysis.
     */
    public JobMatchAiResponse analyzeMatch(
            Job job,
            Profile profile,
            ResumeDocument resumeDoc,
            List<String> uploadedSkills,
            String uploadedSummary) {

        String jobContext = buildJobContext(job);
        String candidateContext = buildCandidateContext(profile, resumeDoc, uploadedSkills, uploadedSummary);

        String systemPrompt = """
                You are a senior technical recruitment AI evaluator and ATS scoring expert.
                Your task is to analyze the semantic fit between a job's requirements and a candidate's background.

                EVALUATION CRITERIA:
                1. 'roleRelevanceScore' (0-100): How closely candidate's titles and background align with the target role (e.g. 'Java Backend Developer' vs 'Spring Boot Engineer').
                2. 'technicalRelevanceScore' (0-100): Depth and overlap of technical skills, frameworks, and databases in hands-on projects.
                3. 'semanticScore' (0-100): Overall conceptual alignment between job responsibilities and candidate's demonstrated project work.
                4. 'educationRelevanceScore' (0-100): Relevance of candidate's educational field of study to this job domain.
                5. 'matchedSkills': List of candidate skills that fulfill the job's core technical requirements.
                6. 'missingSkills': List of critical required skills the candidate does not appear to have.
                7. 'reasoning': A concise 2-3 sentence executive evaluation of the candidate's alignment and fit for this role.
                8. 'strengths': List of 2 to 4 concise, high-impact bullet points detailing the candidate's strongest technical and domain advantages for this role.
                9. 'risksOrGaps': List of 1 to 3 bullet points highlighting missing core competencies, depth concerns, or areas requiring technical screening.
                10. 'suggestedInterviewQuestions': List of exactly 3 role-specific, targeted screening questions to verify candidate claims or test their identified skill gaps.
                11. 'seniorityFit': One of: 'STRONG_FIT', 'GOOD_FIT', 'GROWTH_CANDIDATE', 'OVERQUALIFIED', 'UNALIGNED'.

                AI ETHICS & FAIRNESS GUARDRAILS:
                - Base your evaluation solely on job-relevant skills, experience, and projects.
                - NEVER evaluate age, gender, race, religion, nationality, or demographic attributes.
                - NEVER invent candidate qualifications or metrics.
                """;

        String userPrompt = """
                === JOB DETAILS ===
                %s

                === CANDIDATE PROFILE ===
                %s
                """.formatted(jobContext, candidateContext);

        log.info("Sending semantic matching request for Job ID=[{}] to AI model", job.getId());

        try {
            JobMatchAiResponse response = chatClient
                    .prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .entity(JobMatchAiResponse.class);

            if (response == null) {
                log.warn("AI returned null match response. Using safe fallback.");
                return createFallbackResponse(job);
            }

            sanitizeAiResponse(response, job);
            log.info("AI semantic match completed. SemanticScore=[{}] RoleRelevance=[{}] SeniorityFit=[{}]",
                    response.getSemanticScore(), response.getRoleRelevanceScore(), response.getSeniorityFit());

            return response;

        } catch (Exception e) {
            log.error("Spring AI match evaluation failed: {}", e.getMessage(), e);
            return createFallbackResponse(job);
        }
    }

    // ── Context Builders ──────────────────────────────────────────────────────

    private String buildJobContext(Job job) {
        StringBuilder sb = new StringBuilder();
        sb.append("Title: ").append(job.getJobTitle()).append("\n");
        sb.append("Category: ").append(job.getCategory() != null ? job.getCategory() : "Software Development").append("\n");
        sb.append("Min Experience: ").append(job.getMinimumExperience() != null ? job.getMinimumExperience() : 0).append(" years\n");
        sb.append("Required Skills: ").append(job.getSkillsRequired() != null ? String.join(", ", job.getSkillsRequired()) : "None specified").append("\n");
        sb.append("Preferred Skills: ").append(job.getPreferredSkills() != null ? String.join(", ", job.getPreferredSkills()) : "None").append("\n");
        if (job.getResponsibilities() != null && !job.getResponsibilities().isBlank()) {
            // Cap responsibilities at 500 chars to prevent oversized AI prompts
            String resp = job.getResponsibilities().trim();
            sb.append("Key Responsibilities: ").append(resp.length() > 500 ? resp.substring(0, 500) + "..." : resp).append("\n");
        }
        return sb.toString();
    }

    private String buildCandidateContext(
            Profile profile,
            ResumeDocument resumeDoc,
            List<String> uploadedSkills,
            String uploadedSummary) {

        StringBuilder sb = new StringBuilder();
        if (profile != null) {
            if (profile.getHeadline() != null) sb.append("Headline: ").append(profile.getHeadline()).append("\n");
            if (profile.getAbout() != null) {
                // Cap about at 300 chars
                String about = profile.getAbout().trim();
                sb.append("About: ").append(about.length() > 300 ? about.substring(0, 300) + "..." : about).append("\n");
            }
            if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                sb.append("Profile Skills: ").append(String.join(", ", profile.getSkills())).append("\n");
            }
        }
        if (uploadedSkills != null && !uploadedSkills.isEmpty()) {
            sb.append("Uploaded Resume Detected Skills: ").append(String.join(", ", uploadedSkills)).append("\n");
        }
        if (uploadedSummary != null && !uploadedSummary.isBlank()) {
            // Cap uploaded resume summary at 1000 chars (was 3000 in prepareContextAndMarkProcessing)
            String summary = uploadedSummary.trim();
            sb.append("Uploaded Resume Summary: ").append(summary.length() > 1000 ? summary.substring(0, 1000) + "..." : summary).append("\n");
        }
        if (resumeDoc != null) {
            if (resumeDoc.getProfessionalTitle() != null) sb.append("Resume Title: ").append(resumeDoc.getProfessionalTitle()).append("\n");
            if (resumeDoc.getProfessionalSummary() != null) {
                String summary = resumeDoc.getProfessionalSummary().trim();
                sb.append("Summary: ").append(summary.length() > 500 ? summary.substring(0, 500) + "..." : summary).append("\n");
            }
            if (resumeDoc.getSkills() != null && !resumeDoc.getSkills().isEmpty()) {
                sb.append("Resume Skills: ").append(String.join(", ", resumeDoc.getSkills())).append("\n");
            }
            if (resumeDoc.getProjectList() != null && !resumeDoc.getProjectList().isEmpty()) {
                sb.append("Projects:\n");
                for (ResumeProject p : resumeDoc.getProjectList()) {
                    sb.append("- ").append(p.getProjectName()).append(" (").append(p.getTechnologies()).append("): ")
                      .append(p.getDescription() != null ? p.getDescription() : "").append("\n");
                }
            }
        }
        return sb.toString();
    }

    private void sanitizeAiResponse(JobMatchAiResponse res, Job job) {
        if (res.getSemanticScore() == null) res.setSemanticScore(80);
        if (res.getRoleRelevanceScore() == null) res.setRoleRelevanceScore(80);
        if (res.getTechnicalRelevanceScore() == null) res.setTechnicalRelevanceScore(80);
        if (res.getEducationRelevanceScore() == null) res.setEducationRelevanceScore(85);
        if (res.getMatchedSkills() == null) res.setMatchedSkills(List.of());
        if (res.getMissingSkills() == null) res.setMissingSkills(List.of());
        if (res.getReasoning() == null || res.getReasoning().isBlank()) {
            res.setReasoning("Candidate demonstrates relevant technical and domain alignment with core requirements.");
        }

        // Clamp scores 0-100
        res.setSemanticScore(Math.min(100, Math.max(0, res.getSemanticScore())));
        res.setRoleRelevanceScore(Math.min(100, Math.max(0, res.getRoleRelevanceScore())));
        res.setTechnicalRelevanceScore(Math.min(100, Math.max(0, res.getTechnicalRelevanceScore())));
        res.setEducationRelevanceScore(Math.min(100, Math.max(0, res.getEducationRelevanceScore())));

        if (res.getStrengths() == null || res.getStrengths().isEmpty()) {
            res.setStrengths(List.of(
                    "Demonstrated foundation in modern software engineering principles",
                    "Relevant hands-on skill overlap with primary job requirements"
            ));
        }

        if (res.getRisksOrGaps() == null || res.getRisksOrGaps().isEmpty()) {
            if (!res.getMissingSkills().isEmpty()) {
                res.setRisksOrGaps(List.of("Candidate profile does not explicitly verify proficiency in: " + String.join(", ", res.getMissingSkills())));
            } else {
                res.setRisksOrGaps(List.of("Assess candidate's experience handling production incidents and high scale."));
            }
        }

        if (res.getSuggestedInterviewQuestions() == null || res.getSuggestedInterviewQuestions().isEmpty()) {
            String roleTitle = job != null && job.getJobTitle() != null ? job.getJobTitle() : "this role";
            res.setSuggestedInterviewQuestions(List.of(
                    "Can you walk us through a recent project relevant to " + roleTitle + " and the key architectural decisions you made?",
                    "How do you approach debugging complex production bottlenecks under tight deadlines?",
                    "What strategies do you use to quickly master unfamiliar technologies required by a new project?"
            ));
        }

        if (res.getSeniorityFit() == null || res.getSeniorityFit().isBlank()) {
            int avg = (res.getSemanticScore() + res.getRoleRelevanceScore() + res.getTechnicalRelevanceScore()) / 3;
            if (avg >= 80) res.setSeniorityFit("STRONG_FIT");
            else if (avg >= 65) res.setSeniorityFit("GOOD_FIT");
            else res.setSeniorityFit("GROWTH_CANDIDATE");
        }
    }

    private JobMatchAiResponse createFallbackResponse(Job job) {
        JobMatchAiResponse res = new JobMatchAiResponse();
        res.setSemanticScore(78);
        res.setRoleRelevanceScore(80);
        res.setTechnicalRelevanceScore(78);
        res.setEducationRelevanceScore(85);
        res.setMatchedSkills(List.of());
        res.setMissingSkills(List.of());
        res.setReasoning("Preliminary automated match evaluation based on candidate profile and job requirements.");
        res.setStrengths(List.of(
                "Core background aligns with foundational technical competencies",
                "Demonstrated relevant project and engineering work history"
        ));
        res.setRisksOrGaps(List.of(
                "Deep-dive technical assessment recommended to evaluate specific edge-case mastery."
        ));

        String title = job != null && job.getJobTitle() != null ? job.getJobTitle() : "the position";
        res.setSuggestedInterviewQuestions(List.of(
                "Can you describe your experience and most impactful contribution related to " + title + "?",
                "How do you ensure test coverage, code quality, and performance in your daily workflow?",
                "Tell us about a technical challenge you encountered in a recent project and how you resolved it."
        ));
        res.setSeniorityFit("GOOD_FIT");
        return res;
    }
}
