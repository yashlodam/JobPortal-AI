package com.jobportal.copilot.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.copilot.dto.ChatMessageDto;
import com.jobportal.copilot.dto.CopilotChatRequest;
import com.jobportal.copilot.dto.CopilotChatResponse;
import com.jobportal.copilot.dto.CopilotJobCardDto;
import com.jobportal.domain.JobStatus;
import com.jobportal.entity.Education;
import com.jobportal.entity.Experience;
import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Profile;
import com.jobportal.entity.User;
import com.jobportal.recruiter.interview.entity.ScheduledInterview;
import com.jobportal.recruiter.interview.repository.ScheduledInterviewRepository;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.repository.UserRepository;

@Service
public class AiCopilotServiceImpl implements AiCopilotService {

    private static final Logger log = LoggerFactory.getLogger(AiCopilotServiceImpl.class);

    private final ChatClient chatClient;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final JobApplicationRepository applicationRepository;
    private final ScheduledInterviewRepository interviewRepository;

    public AiCopilotServiceImpl(
            ChatClient.Builder chatClientBuilder,
            JobRepository jobRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository,
            JobApplicationRepository applicationRepository,
            ScheduledInterviewRepository interviewRepository) {
        this.chatClient = chatClientBuilder.build();
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CopilotChatResponse chat(CopilotChatRequest request, String userEmail) {
        String query = request.getMessage() != null ? request.getMessage().trim() : "";
        String queryLower = query.toLowerCase();

        // 1. Gather Deep Candidate Context (if logged in)
        StringBuilder candidateContext = new StringBuilder();
        String candidateName = null;
        List<String> candidateSkills = new ArrayList<>();

        if (userEmail != null && !userEmail.isBlank()) {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                candidateName = user.getName();
                candidateContext.append("Candidate Name: ").append(user.getName()).append("\n");
                candidateContext.append("Account Type: ").append(user.getAccountType()).append("\n");

                if (user.getProfile() != null) {
                    Profile profile = user.getProfile();
                    if (profile.getHeadline() != null && !profile.getHeadline().isBlank()) {
                        candidateContext.append("Current Headline: ").append(profile.getHeadline()).append("\n");
                    }
                    if (profile.getExperienceLevel() != null) {
                        candidateContext.append("Experience Level: ").append(profile.getExperienceLevel()).append("\n");
                    }
                    if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
                        candidateSkills = profile.getSkills();
                        candidateContext.append("Profile Verified Skills: ").append(String.join(", ", candidateSkills)).append("\n");
                    }
                    if (profile.getLocation() != null && !profile.getLocation().isBlank()) {
                        candidateContext.append("Location: ").append(profile.getLocation()).append("\n");
                    }
                    if (profile.getExperiences() != null && !profile.getExperiences().isEmpty()) {
                        List<String> expSummaries = profile.getExperiences().stream()
                                .limit(2)
                                .map(e -> (e.getTitle() != null ? e.getTitle() : "Role") + " at " + (e.getCompany() != null ? e.getCompany() : "Company"))
                                .toList();
                        candidateContext.append("Recent Experience: ").append(String.join("; ", expSummaries)).append("\n");
                    }
                    if (profile.getEducations() != null && !profile.getEducations().isEmpty()) {
                        Education edu = profile.getEducations().get(0);
                        String degree = (edu.getDegree() != null ? edu.getDegree() : "") + " " + (edu.getFieldOfStudy() != null ? edu.getFieldOfStudy() : "");
                        if (!degree.isBlank()) {
                            candidateContext.append("Education: ").append(degree.trim()).append("\n");
                        }
                    }
                }

                // Applications context
                try {
                    Page<JobApplication> appsPage = applicationRepository.findByApplicantId(user.getId(), PageRequest.of(0, 5));
                    List<JobApplication> apps = appsPage.getContent();
                    candidateContext.append("Total Submitted Applications: ").append(appsPage.getTotalElements()).append("\n");
                    if (!apps.isEmpty()) {
                        List<String> recentAppSummaries = apps.stream().limit(3).map(a -> {
                            String title = a.getJob() != null ? a.getJob().getJobTitle() : "Job";
                            String comp = a.getJob() != null && a.getJob().getCompany() != null ? a.getJob().getCompany().getCompanyName() : "Company";
                            return title + " at " + comp + " (" + a.getStatus() + ")";
                        }).toList();
                        candidateContext.append("Recent Applications Pipeline: ").append(String.join("; ", recentAppSummaries)).append("\n");
                    }
                } catch (Exception e) {
                    log.debug("No application context: {}", e.getMessage());
                }

                // Scheduled interviews context
                try {
                    List<ScheduledInterview> interviews = interviewRepository.findByCandidateId(user.getId());
                    if (!interviews.isEmpty()) {
                        candidateContext.append("Upcoming Scheduled Interviews: ").append(interviews.size()).append("\n");
                        ScheduledInterview nextIv = interviews.get(0);
                        String ivJob = nextIv.getApplication() != null && nextIv.getApplication().getJob() != null
                                ? nextIv.getApplication().getJob().getJobTitle() : "Role";
                        candidateContext.append("Next Interview: ").append(ivJob)
                                .append(" [Round: ").append(nextIv.getInterviewRound()).append("] on ")
                                .append(nextIv.getScheduledAt()).append(" (Status: ").append(nextIv.getStatus()).append(")\n");
                    }
                } catch (Exception e) {
                    log.debug("No interview context extracted: {}", e.getMessage());
                }
            }
        }

        // 2. Intelligent Search Intent & Tokenized Scoring
        List<CopilotJobCardDto> matchedJobCards = new ArrayList<>();
        String actionType = "NONE";
        String actionLink = null;

        Set<String> stopWords = Set.of(
                "find", "me", "show", "give", "the", "a", "an", "for", "in", "with",
                "jobs", "job", "roles", "role", "positions", "openings", "looking", "want",
                "hire", "hiring", "open", "active", "please", "can", "you", "i", "to",
                "of", "at", "and", "or", "is", "are", "best", "some", "any", "my", "tell"
        );

        List<String> queryTokens = Arrays.stream(queryLower.split("[^a-zA-Z0-9#+\\.-]+"))
                .filter(t -> t.length() > 1 && !stopWords.contains(t))
                .toList();

        boolean isJobSearchIntent =
                // Universal intent words
                queryLower.contains("job") || queryLower.contains("hiring") || queryLower.contains("role")
                || queryLower.contains("opening") || queryLower.contains("vacancy") || queryLower.contains("remote")
                || queryLower.contains("salary") || queryLower.contains("position") || queryLower.contains("work")
                || queryLower.contains("apply") || queryLower.contains("recommend") || queryLower.contains("find")
                || queryLower.contains("opportunity") || queryLower.contains("career") || queryLower.contains("hire")

                // Software / Web Dev
                || queryTokens.contains("java") || queryTokens.contains("python") || queryTokens.contains("javascript")
                || queryTokens.contains("typescript") || queryTokens.contains("golang") || queryTokens.contains("react")
                || queryTokens.contains("angular") || queryTokens.contains("vue") || queryTokens.contains("node")
                || queryTokens.contains("spring") || queryTokens.contains("django") || queryTokens.contains("dotnet")
                || queryTokens.contains("fullstack") || queryTokens.contains("frontend") || queryTokens.contains("backend")
                || queryTokens.contains("microservices") || queryTokens.contains("api") || queryTokens.contains("graphql")

                // Cybersecurity
                || queryLower.contains("cybersecurity") || queryLower.contains("cyber security")
                || queryLower.contains("infosec") || queryLower.contains("security analyst")
                || queryLower.contains("penetration") || queryLower.contains("pentest") || queryLower.contains("ethical hacking")
                || queryLower.contains("soc analyst") || queryLower.contains("siem") || queryLower.contains("splunk")
                || queryLower.contains("vapt") || queryLower.contains("malware") || queryLower.contains("forensics")
                || queryLower.contains("threat") || queryLower.contains("incident response") || queryLower.contains("devsecops")

                // Networking
                || queryLower.contains("networking") || queryLower.contains("network engineer")
                || queryLower.contains("ccna") || queryLower.contains("ccnp") || queryLower.contains("cisco")
                || queryLower.contains("firewall") || queryLower.contains("sd-wan") || queryLower.contains("tcp/ip")
                || queryLower.contains("wifi") || queryLower.contains("voip")

                // Cloud / DevOps / SRE
                || queryTokens.contains("aws") || queryTokens.contains("azure") || queryTokens.contains("gcp")
                || queryTokens.contains("devops") || queryTokens.contains("sre") || queryTokens.contains("kubernetes")
                || queryTokens.contains("docker") || queryTokens.contains("terraform") || queryTokens.contains("jenkins")
                || queryLower.contains("cloud engineer") || queryLower.contains("site reliability") || queryLower.contains("platform engineer")

                // Data / AI / ML / GenAI
                || queryTokens.contains("ml") || queryTokens.contains("ai") || queryTokens.contains("nlp")
                || queryLower.contains("data scientist") || queryLower.contains("machine learning")
                || queryLower.contains("deep learning") || queryLower.contains("data engineer")
                || queryLower.contains("data analyst") || queryLower.contains("llm") || queryLower.contains("generative ai")
                || queryLower.contains("prompt engineer") || queryLower.contains("computer vision")
                || queryLower.contains("mlops") || queryLower.contains("big data")

                // Mobile
                || queryLower.contains("android developer") || queryLower.contains("ios developer")
                || queryTokens.contains("flutter") || queryLower.contains("react native")

                // ERP / Salesforce / SAP
                || queryLower.contains("salesforce") || queryLower.contains("sap developer") || queryLower.contains("sap consultant")
                || queryLower.contains("servicenow") || queryLower.contains("workday") || queryLower.contains("erp consultant")
                || queryLower.contains("oracle erp") || queryLower.contains("dynamics 365")

                // Finance / FinTech
                || queryLower.contains("fintech") || queryLower.contains("blockchain developer")
                || queryLower.contains("quant") || queryLower.contains("risk analyst") || queryLower.contains("financial analyst")
                || queryLower.contains("banking technology")

                // Healthcare IT
                || queryLower.contains("healthcare it") || queryLower.contains("health informatics")
                || queryLower.contains("ehr") || queryLower.contains("fhir") || queryLower.contains("clinical")

                // Design / UX
                || queryLower.contains("ui designer") || queryLower.contains("ux designer")
                || queryLower.contains("product designer") || queryLower.contains("graphic designer")
                || queryTokens.contains("figma")

                // QA / Testing
                || queryLower.contains("qa engineer") || queryLower.contains("test engineer")
                || queryLower.contains("automation engineer") || queryLower.contains("quality assurance")
                || queryLower.contains("qa lead")

                // Embedded / IoT
                || queryLower.contains("embedded engineer") || queryLower.contains("firmware")
                || queryLower.contains("iot developer") || queryLower.contains("robotics")
                || queryLower.contains("fpga") || queryLower.contains("rtos")

                // Game Development
                || queryLower.contains("game developer") || queryLower.contains("unity developer")
                || queryLower.contains("unreal engine") || queryLower.contains("game designer")

                // Product / Business / PM
                || queryLower.contains("product manager") || queryLower.contains("business analyst")
                || queryLower.contains("project manager") || queryLower.contains("scrum master")

                // Digital Marketing
                || queryLower.contains("seo specialist") || queryLower.contains("digital marketing")
                || queryLower.contains("performance marketer") || queryLower.contains("content marketer")

                // HR / Talent
                || queryLower.contains("hr manager") || queryLower.contains("talent acquisition")
                || queryLower.contains("recruiter") || queryLower.contains("hris");


        if (isJobSearchIntent) {
            actionType = "JOBS_LIST";
            actionLink = "/find-jobs";

            Page<Job> openJobsPage = jobRepository.findAllByStatus(
                    JobStatus.OPEN,
                    PageRequest.of(0, 30, Sort.by(Sort.Direction.DESC, "createdAt")));

            List<Job> allOpenJobs = openJobsPage.getContent();

            class ScoredJob {
                final Job job;
                final int score;
                final int matchPct;

                ScoredJob(Job job, int score, int matchPct) {
                    this.job = job;
                    this.score = score;
                    this.matchPct = matchPct;
                }
            }

            List<ScoredJob> scoredList = new ArrayList<>();
            for (Job j : allOpenJobs) {
                int score = 0;
                String title = j.getJobTitle() != null ? j.getJobTitle().toLowerCase() : "";
                String cat = j.getCategory() != null ? j.getCategory().toLowerCase() : "";
                String desc = j.getDescription() != null ? j.getDescription().toLowerCase() : "";
                String loc = (j.getCity() != null ? j.getCity() : "") + " " + (j.getState() != null ? j.getState() : "") + " " + (j.getCountry() != null ? j.getCountry() : "");
                String locLower = loc.toLowerCase();
                String wm = j.getWorkingMode() != null ? j.getWorkingMode().name().toLowerCase() : "";
                List<String> reqSkills = j.getSkillsRequired() != null ? j.getSkillsRequired() : new ArrayList<>();
                List<String> reqSkillsLower = reqSkills.stream().map(String::toLowerCase).toList();

                // Keyword match scoring
                for (String token : queryTokens) {
                    if (title.contains(token)) score += 15;
                    if (reqSkillsLower.stream().anyMatch(s -> s.contains(token) || token.contains(s))) score += 12;
                    if (locLower.contains(token)) score += 8;
                    if (wm.contains(token)) score += 8;
                    if (cat.contains(token)) score += 6;
                    if (desc.contains(token)) score += 3;
                }

                // Profile skill overlap scoring
                int matchedSkillCount = 0;
                if (!candidateSkills.isEmpty() && !reqSkills.isEmpty()) {
                    for (String cSkill : candidateSkills) {
                        String cSkillLower = cSkill.toLowerCase();
                        if (reqSkillsLower.stream().anyMatch(s -> s.contains(cSkillLower) || cSkillLower.contains(s))) {
                            matchedSkillCount++;
                        }
                    }
                }

                int matchPct = 70;
                if (!reqSkills.isEmpty()) {
                    if (!candidateSkills.isEmpty()) {
                        matchPct = (int) Math.min(100, Math.round(((double) matchedSkillCount / reqSkills.size()) * 100));
                        if (matchPct == 0 && score > 0) matchPct = 55;
                    } else if (score > 0) {
                        matchPct = Math.min(95, 60 + score * 2);
                    }
                }
                score += matchedSkillCount * 5;

                scoredList.add(new ScoredJob(j, score, matchPct));
            }

            // Sort: highest search score first; break ties by candidate profile match percentage
            scoredList.sort((a, b) -> {
                if (b.score != a.score) return Integer.compare(b.score, a.score);
                return Integer.compare(b.matchPct, a.matchPct);
            });

            List<ScoredJob> topJobs = scoredList.stream().limit(3).toList();

            for (ScoredJob sj : topJobs) {
                Job j = sj.job;
                String loc = buildLocation(j.getCity(), j.getState(), j.getCountry());
                String sal = formatSalaryRange(j.getMinimumSalary(), j.getMaximumSalary());
                String comp = j.getCompany() != null ? j.getCompany().getCompanyName() : "Verified Employer";
                Long compId = j.getCompany() != null ? j.getCompany().getId() : null;
                String wm = j.getWorkingMode() != null ? j.getWorkingMode().name().replace("_", " ") : "Full Time";
                String jt = j.getJobType() != null ? j.getJobType().name().replace("_", " ") : "Full Time";
                List<String> topSkills = j.getSkillsRequired() != null ? j.getSkillsRequired().stream().limit(4).toList() : new ArrayList<>();

                matchedJobCards.add(new CopilotJobCardDto(
                        j.getId(),
                        j.getJobTitle(),
                        comp,
                        loc != null ? loc : "Remote / India",
                        sal,
                        jt,
                        wm,
                        topSkills,
                        sj.matchPct,
                        compId
                ));
            }
        } else if (queryLower.contains("build") && (queryLower.contains("resume") || queryLower.contains("cv")) || queryLower.contains("template")) {
            actionType = "RESUME_BUILDER";
            actionLink = "/career-hub/resume-builder";
        } else if (queryLower.contains("resume") || queryLower.contains("ats") || queryLower.contains("score") || queryLower.contains("cv")) {
            actionType = "ATS_TIP";
            actionLink = "/career-hub/resume-analyzer";
        } else if (queryLower.contains("interview") || queryLower.contains("prepare") || queryLower.contains("question") || queryLower.contains("mock") || queryLower.contains("drill")) {
            actionType = "INTERVIEW_DRILL";
            actionLink = "/mock-interview";
        } else if (queryLower.contains("application") || queryLower.contains("status") || queryLower.contains("applied")) {
            actionType = "APPLICATIONS";
            actionLink = "/my-jobs/applied";
        } else if (queryLower.contains("saved") || queryLower.contains("bookmark")) {
            actionType = "SAVED_JOBS";
            actionLink = "/my-jobs/saved";
        } else if (queryLower.contains("profile") || queryLower.contains("headline") || queryLower.contains("portfolio")) {
            actionType = "PROFILE";
            actionLink = "/profiles";
        } else if (queryLower.contains("scheduled") || queryLower.contains("timeline") || (queryLower.contains("my") && queryLower.contains("interview"))) {
            actionType = "INTERVIEWS";
            actionLink = "/my-jobs/interviews";
        }

        // 3. Build Conversation History Context
        StringBuilder historyBuilder = new StringBuilder();
        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            int startIdx = Math.max(0, request.getHistory().size() - 4);
            for (int i = startIdx; i < request.getHistory().size(); i++) {
                ChatMessageDto turn = request.getHistory().get(i);
                historyBuilder.append(turn.getSender().toUpperCase()).append(": ").append(turn.getText()).append("\n");
            }
        }

        // 4. Build System & User Prompt for Spring AI
        String systemPrompt = """
                You are JobPortal AI — the Career Copilot and Senior Technical Talent Advisor on the JobPortal Platform.
                Your mission is to help candidates succeed in their job search, optimize their resumes, crack high-bar technical interviews, and find their dream roles.

                RESPONSE GUIDELINES:
                1. Structure your answers with clear, clean Markdown (bullet points, bold key terms).
                2. Be concise, highly actionable, motivating, and professional. Keep replies to 2-3 short, scannable paragraphs or bulleted lists.
                3. If candidate details (skills, applications, interviews) are present in context, personalize your guidance naturally.
                4. If asked for interview prep, provide concrete technical questions or STAR framework answer structures.
                5. If asked about resume/ATS optimization, recommend quantifiable metrics, action verbs, and matching tech keywords.
                6. Avoid boilerplate disclaimers. Always give high-value, direct career intelligence.

                DYNAMIC FOLLOW-UP QUESTIONS:
                At the very end of your response, provide exactly 3 concise, highly actionable follow-up questions for the candidate (each under 12 words, punchy and clickable, e.g. "Practice Java Full-Stack interview questions"). Do NOT enclose them in brackets, parentheses, or quotes. Format exactly as:
                ---FOLLOW_UPS---
                Follow-up question 1
                Follow-up question 2
                Follow-up question 3
                """;

        StringBuilder promptContent = new StringBuilder();
        if (candidateContext.length() > 0) {
            promptContent.append("=== CANDIDATE CONTEXT ===\n").append(candidateContext).append("\n");
        }
        if (!matchedJobCards.isEmpty()) {
            promptContent.append("=== MATCHED ACTIVE JOBS ON PLATFORM ===\n");
            for (CopilotJobCardDto card : matchedJobCards) {
                promptContent.append("- ").append(card.getTitle()).append(" at ").append(card.getCompanyName())
                        .append(" (").append(card.getLocation()).append(" | ").append(card.getSalary()).append(")\n");
            }
            promptContent.append("\n");
        }
        if (historyBuilder.length() > 0) {
            promptContent.append("=== CONVERSATION HISTORY ===\n").append(historyBuilder).append("\n");
        }
        promptContent.append("USER QUERY: ").append(query);

        // 5. Invoke Spring AI ChatClient with fallback
        String replyText;
        try {
            replyText = chatClient.prompt()
                    .system(systemPrompt)
                    .user(promptContent.toString())
                    .call()
                    .content();

            if (replyText == null || replyText.isBlank()) {
                replyText = generateSmartFallback(queryLower, candidateName, matchedJobCards);
            }
        } catch (Exception ex) {
            log.warn("Spring AI LLM call failed, generating contextual fallback: {}", ex.getMessage());
            replyText = generateSmartFallback(queryLower, candidateName, matchedJobCards);
        }

        // 6. Extract Dynamic Follow-Up Prompt Suggestions from LLM response
        List<String> followUps = new ArrayList<>();
        String cleanReply = replyText;

        if (replyText != null && replyText.contains("---FOLLOW_UPS---")) {
            String[] parts = replyText.split("---FOLLOW_UPS---", 2);
            cleanReply = parts[0].trim();
            String followUpSection = parts[1].trim();
            for (String line : followUpSection.split("\n")) {
                String cleanLine = line.trim()
                        .replaceAll("^[\\-\\•\\*\\d\\.\\)\\]\\[\\s]+", "")
                        .replaceAll("^[\"']+|[\"']+$", "")
                        .replace("[", "").replace("]", "").trim();
                if (!cleanLine.isBlank() && cleanLine.length() > 3) {
                    followUps.add(cleanLine);
                }
            }
        }

        if (followUps.isEmpty()) {
            followUps = generateDynamicFallbackFollowUps(queryLower, actionType);
        }

        return new CopilotChatResponse(cleanReply, followUps.stream().limit(3).toList(), actionType, matchedJobCards, actionLink);
    }

    private List<String> generateDynamicFallbackFollowUps(String queryLower, String actionType) {
        if (queryLower.contains("interview") || "INTERVIEW_DRILL".equals(actionType)) {
            return List.of("🎯 Practice 3 Technical System Design questions", "💡 Give me a STAR method behavioral answer example", "📅 Check my scheduled interviews timeline");
        }
        if (queryLower.contains("resume") || queryLower.contains("ats") || "ATS_TIP".equals(actionType)) {
            return List.of("⚡ How do I format cloud and database skills for ATS?", "🔍 Scan my profile against open developer positions", "💼 Show high-matching jobs for my tech stack");
        }
        if (queryLower.contains("job") || "JOBS_LIST".equals(actionType)) {
            return List.of("🌐 Show top paying Remote engineer positions", "📈 What frameworks are highest in demand?", "✍️ Draft a tailored cover letter for this role");
        }
        return List.of("💼 Find open jobs matching my background", "⚡ How to optimize my resume for technical roles?", "🎯 Practice a mock technical interview");
    }

    private String generateSmartFallback(String queryLower, String name, List<CopilotJobCardDto> matchedJobs) {
        String greeting = name != null ? "Hello " + name + "! " : "Hello! ";

        if (queryLower.contains("cover letter")) {
            return greeting + "Here is a proven structure for a high-converting cover letter:\n\n"
                    + "• **Hook:** Mention the specific role and your top 1-2 impactful achievements.\n"
                    + "• **Evidence:** 2 bullet points detailing measurable outcomes (e.g., *'Improved API latency by 45% using Redis'*).\n"
                    + "• **Value Alignment:** Why this company's mission resonates with you.\n"
                    + "• **Call to Action:** An inviting closing offering to discuss your technical approach.";
        }
        if (queryLower.contains("interview") || queryLower.contains("drill") || queryLower.contains("prep") || queryLower.contains("mock")) {
            return greeting + "Preparing for an interview? Here are key strategies to stand out:\n\n"
                    + "• **STAR Method:** For behavioral questions, structure your answer around Situation, Task, Action, and Result.\n"
                    + "• **System Design & Architecture:** Clarify functional/non-functional requirements, estimate scale, and justify DB/caching choices.\n"
                    + "• **Code Clarity:** Explain trade-offs in time & space complexity clearly as you work through problems.\n\n"
                    + "💡 *Tip: Try our interactive AI Mock Interview tool from the Career Hub to practice real questions with instant feedback!*";
        }
        if (queryLower.contains("ats") || queryLower.contains("resume") || queryLower.contains("cv")) {
            return greeting + "To ensure your resume passes ATS screening with a 90%+ match score:\n\n"
                    + "• **Include exact keywords** from the target job description (e.g., React 19, Spring Boot, PostgreSQL).\n"
                    + "• **Quantify results:** Replace *'Built payment system'* with *'Architected checkout flow processing $2M+ monthly'*\n"
                    + "• **Clean formatting:** Use single-column layouts without complex tables or image-based text.";
        }
        if (!matchedJobs.isEmpty()) {
            StringBuilder sb = new StringBuilder(greeting + "I found open positions matching your search on JobPortal:\n\n");
            for (CopilotJobCardDto j : matchedJobs) {
                sb.append("• **").append(j.getTitle()).append("** at ").append(j.getCompanyName())
                        .append(" — ").append(j.getLocation());
                if (j.getMatchScore() != null && j.getMatchScore() > 0) {
                    sb.append(" (🎯 ").append(j.getMatchScore()).append("% match)");
                }
                sb.append(" (").append(j.getSalary()).append(")\n");
            }
            sb.append("\nYou can click any job card below to view details and apply directly!");
            return sb.toString();
        }
        return greeting + "I'm your JobPortal AI Career Copilot. I can help you search active job listings, optimize your resume for ATS screening, practice technical interview questions, and track your application milestones!";
    }

    private String buildLocation(String city, String state, String country) {
        StringBuilder sb = new StringBuilder();
        if (city != null && !city.isBlank()) sb.append(city);
        if (state != null && !state.isBlank()) { if (sb.length() > 0) sb.append(", "); sb.append(state); }
        if (country != null && !country.isBlank()) { if (sb.length() > 0) sb.append(", "); sb.append(country); }
        return sb.length() > 0 ? sb.toString() : null;
    }

    private String formatSalaryRange(Long min, Long max) {
        if (min == null && max == null) return "Competitive Compensation";
        if (min != null && max != null) {
            return formatSalaryNum(min) + " – " + formatSalaryNum(max) + " / yr";
        }
        return min != null ? "from " + formatSalaryNum(min) + " / yr" : "up to " + formatSalaryNum(max) + " / yr";
    }

    private String formatSalaryNum(Long n) {
        if (n >= 100000) return "₹" + String.format("%.1fL", n / 100000.0);
        if (n >= 1000) return "₹" + (n / 1000) + "K";
        return "₹" + n;
    }
}
