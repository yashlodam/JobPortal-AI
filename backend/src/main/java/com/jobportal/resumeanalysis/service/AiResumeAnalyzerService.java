package com.jobportal.resumeanalysis.service;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.exception.JobPortalException;
import com.jobportal.resumeanalysis.dto.AiAnalysisResult;

/**
 * Sends resume text to Groq / OpenAI-compatible endpoint via Spring AI {@link ChatClient}
 * and returns a structured {@link AiAnalysisResult} DTO.
 */
@Service
public class AiResumeAnalyzerService {

    private static final Logger log = LoggerFactory.getLogger(AiResumeAnalyzerService.class);

    /** Maximum characters to send per resume to avoid token limit errors (~3k tokens). */
    private static final int MAX_RESUME_CHARS = 12_000;

    private static final String MODEL_PRIMARY = "openai/gpt-oss-120b";
    private static final String MODEL_FALLBACK_1 = "openai/gpt-oss-20b";
    private static final String MODEL_FALLBACK_2 = "groq/compound-mini";

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public AiResumeAnalyzerService(ChatClient.Builder chatClientBuilder, ObjectMapper objectMapper) {
        ChatClient client = null;
        try {
            ChatClient.Builder customized = chatClientBuilder.defaultOptions(OpenAiChatOptions.builder().temperature(0.0));
            if (customized != null) {
                client = customized.build();
            }
        } catch (Exception ignored) {}
        this.chatClient = client != null ? client : chatClientBuilder.build();
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    public AiResumeAnalyzerService(ChatClient.Builder chatClientBuilder) {
        this(chatClientBuilder, new ObjectMapper());
    }

    /**
     * Analyzes resume text using Groq LLM and returns a structured {@link AiAnalysisResult}.
     *
     * @param resumeText the plain-text content extracted from the resume file
     * @return structured AI analysis — never null
     * @throws JobPortalException if the text is blank
     */
    public AiAnalysisResult analyze(String resumeText) {
        if (resumeText == null || resumeText.isBlank()) {
            throw JobPortalException.badRequest("Resume text is empty — cannot analyze.");
        }

        // Truncate to stay within token limits
        String truncated = resumeText.length() > MAX_RESUME_CHARS
                ? resumeText.substring(0, MAX_RESUME_CHARS)
                : resumeText;

        log.info("Sending resume analysis request (char count: {}) to AI model", truncated.length());

        AiAnalysisResult result = null;

        // Attempt 1: Call primary configured model with direct JSON content parsing (sub-2s latency)
        try {
            String raw = chatClient
                    .prompt()
                    .options(OpenAiChatOptions.builder().model(MODEL_PRIMARY).temperature(0.0))
                    .system(SYSTEM_PROMPT)
                    .user("Analyze the following resume text:\n\n" + truncated)
                    .call()
                    .content();
            result = parseJsonResult(raw);
        } catch (Exception e) {
            log.warn("Primary AI call [{}] failed: {}. Trying fallback model 1 [{}]...", MODEL_PRIMARY, e.getMessage(), MODEL_FALLBACK_1);
        }

        // Attempt 2: Fallback model 1 (openai/gpt-oss-20b)
        if (result == null) {
            try {
                String raw = chatClient
                        .prompt()
                        .options(OpenAiChatOptions.builder().model(MODEL_FALLBACK_1).temperature(0.0))
                        .system(SYSTEM_PROMPT)
                        .user("Analyze the following resume text:\n\n" + truncated)
                        .call()
                        .content();
                result = parseJsonResult(raw);
            } catch (Exception e2) {
                log.warn("Fallback model [{}] failed: {}. Attempting fallback model [{}]...", MODEL_FALLBACK_1, e2.getMessage(), MODEL_FALLBACK_2);
            }
        }

        // Attempt 3: Fallback model 2 (groq/compound-mini)
        if (result == null) {
            try {
                String raw = chatClient
                        .prompt()
                        .options(OpenAiChatOptions.builder().model(MODEL_FALLBACK_2).temperature(0.0))
                        .system(SYSTEM_PROMPT)
                        .user("Analyze the following resume text:\n\n" + truncated)
                        .call()
                        .content();
                result = parseJsonResult(raw);
            } catch (Exception e3) {
                log.warn("Fallback model [{}] failed: {}. Engaging heuristic analysis engine...", MODEL_FALLBACK_2, e3.getMessage());
            }
        }

        // Fallback: Heuristic analysis engine
        if (result == null) {
            log.info("Generating heuristic resume analysis fallback for resume (length: {} chars)", truncated.length());
            result = generateHeuristicFallback(truncated);
        }

        sanitize(result);

        log.info("\n==================== RESUME ANALYSIS RESULT ====================\n" +
                 "Overall Score: {}\n" +
                 "ATS Score:     {}\n" +
                 "Summary:       {}\n" +
                 "Strengths:     {}\n" +
                 "Improvements:  {}\n" +
                 "Skills:        {}\n" +
                 "Missing Skills:{}\n" +
                 "Rec. Jobs:     {}\n" +
                 "===============================================================",
                 result.getOverallScore(),
                 result.getAtsScore(),
                 result.getSummary(),
                 result.getStrengths(),
                 result.getImprovements(),
                 result.getSkills(),
                 result.getMissingSkills(),
                 result.getRecommendedJobs());

        return result;
    }

    /**
     * Resiliently parse raw text into AiAnalysisResult, stripping any markdown code fences.
     */
    private AiAnalysisResult parseJsonResult(String content) {
        if (content == null || content.isBlank()) return null;
        try {
            String cleaned = content.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceFirst("^```[a-zA-Z]*\\s*", "");
                if (cleaned.endsWith("```")) {
                    cleaned = cleaned.substring(0, cleaned.length() - 3).trim();
                }
            }
            int start = cleaned.indexOf('{');
            int end = cleaned.lastIndexOf('}');
            if (start != -1 && end != -1 && end > start) {
                cleaned = cleaned.substring(start, end + 1);
            }
            return objectMapper.readValue(cleaned, AiAnalysisResult.class);
        } catch (Exception e) {
            log.warn("Failed to parse JSON string into AiAnalysisResult: {}", e.getMessage());
            return null;
        }
    }

    // ── Heuristic Analysis Fallback Engine ─────────────────────────────────────

    private AiAnalysisResult generateHeuristicFallback(String text) {
        String lower = text.toLowerCase();
        AiAnalysisResult res = new AiAnalysisResult();

        // ── 1. Domain Detection ──────────────────────────────────────────────
        boolean isCyberSec    = lower.contains("cybersecurity") || lower.contains("penetration") || lower.contains("pentest")
                || lower.contains("soc analyst") || lower.contains("splunk") || lower.contains("siem")
                || lower.contains("vulnerability") || lower.contains("malware") || lower.contains("forensics")
                || lower.contains("ethical hack") || lower.contains("vapt") || lower.contains("owasp")
                || lower.contains("incident response") || lower.contains("threat hunt");
        boolean isDataSci     = lower.contains("machine learning") || lower.contains("deep learning") || lower.contains("data scientist")
                || lower.contains("pytorch") || lower.contains("tensorflow") || lower.contains("scikit")
                || lower.contains("llm") || lower.contains("nlp") || lower.contains("computer vision")
                || lower.contains("mlops") || lower.contains("langchain") || lower.contains("generative ai");
        boolean isDataEng     = (lower.contains("data engineer") || lower.contains("data pipeline") || lower.contains("etl")
                || lower.contains("snowflake") || lower.contains("dbt") || lower.contains("apache airflow")
                || lower.contains("bigquery") || lower.contains("redshift")) && !isDataSci;
        boolean isDevOps      = lower.contains("devops") || lower.contains("kubernetes") || lower.contains("docker")
                || lower.contains("terraform") || lower.contains("jenkins") || lower.contains("ci/cd")
                || lower.contains("ansible") || lower.contains("site reliability") || lower.contains("platform engineer");
        boolean isCloud       = (lower.contains("aws") || lower.contains("azure") || lower.contains("gcp") || lower.contains("cloud architect"))
                && !isDevOps;
        boolean isNetworking  = lower.contains("ccna") || lower.contains("ccnp") || lower.contains("network engineer")
                || lower.contains("cisco") || lower.contains("firewall") || lower.contains("bgp") || lower.contains("ospf")
                || lower.contains("sd-wan") || lower.contains("wireshark");
        boolean isMobile      = lower.contains("android") || lower.contains("ios developer") || lower.contains("swift")
                || lower.contains("kotlin") || lower.contains("flutter") || lower.contains("react native");
        boolean isFrontend    = !isMobile && (lower.contains("react") || lower.contains("frontend") || lower.contains("vue")
                || lower.contains("angular") || lower.contains("next.js") || lower.contains("tailwind")
                || lower.contains("ui developer") || lower.contains("web developer"));
        boolean isJava        = lower.contains("spring boot") || lower.contains("java") && (lower.contains("spring") || lower.contains("hibernate") || lower.contains("jpa") || lower.contains("microservices"));
        boolean isPython      = (lower.contains("python") || lower.contains("django") || lower.contains("fastapi") || lower.contains("flask")) && !isDataSci && !isDataEng;
        boolean isDotNet      = lower.contains("c#") || lower.contains(".net") || lower.contains("asp.net");
        boolean isGoLang      = lower.contains("golang") || lower.contains("go lang");
        boolean isFullStack   = (isFrontend || lower.contains("frontend")) && (isJava || isPython || isDotNet || isGoLang || lower.contains("backend") || lower.contains("node.js"));
        boolean isQA          = lower.contains("quality assurance") || lower.contains("qa engineer") || lower.contains("test engineer")
                || lower.contains("automation testing") || lower.contains("selenium") || lower.contains("appium")
                || lower.contains("jmeter") || lower.contains("cypress") || lower.contains("playwright");
        boolean isERP         = lower.contains("sap") || lower.contains("salesforce") || lower.contains("servicenow")
                || lower.contains("workday") || lower.contains("oracle erp") || lower.contains("dynamics 365")
                || lower.contains("abap");
        boolean isFinTech     = lower.contains("blockchain") || lower.contains("solidity") || lower.contains("fintech")
                || lower.contains("quantitative") || lower.contains("trading") || lower.contains("banking technology")
                || lower.contains("risk analyst") || lower.contains("financial analyst");
        boolean isHealthcareIT = lower.contains("ehr") || lower.contains("hl7") || lower.contains("fhir")
                || lower.contains("healthcare it") || lower.contains("dicom") || lower.contains("clinical informatics");
        boolean isDesign      = lower.contains("ui/ux") || lower.contains("ux designer") || lower.contains("ui designer")
                || lower.contains("figma") || lower.contains("product designer") || lower.contains("graphic designer");
        boolean isEmbedded    = lower.contains("embedded") || lower.contains("rtos") || lower.contains("stm32")
                || lower.contains("fpga") || lower.contains("arduino") || lower.contains("firmware")
                || lower.contains("can bus") || lower.contains("autosar");
        boolean isGameDev     = lower.contains("unity") || lower.contains("unreal engine") || lower.contains("game developer")
                || lower.contains("opengl") || lower.contains("glsl");
        boolean isProductMgr  = lower.contains("product manager") || lower.contains("product management") || lower.contains("scrum master")
                || lower.contains("okrs") || lower.contains("roadmap") || lower.contains("go-to-market");
        boolean isMarketing   = lower.contains("digital marketing") || lower.contains("seo") || lower.contains("sem")
                || lower.contains("google ads") || lower.contains("hubspot") || lower.contains("performance marketing");
        boolean isHR          = lower.contains("talent acquisition") || lower.contains("hr manager") || lower.contains("recruiter")
                || lower.contains("payroll") || lower.contains("hris") || lower.contains("learning and development");

        // Determine primary domain and domain label
        String domain;
        if (isCyberSec)     domain = "Cybersecurity";
        else if (isDataSci) domain = "Data Science & Machine Learning";
        else if (isDataEng) domain = "Data Engineering";
        else if (isDevOps)  domain = "DevOps & Cloud Engineering";
        else if (isCloud)   domain = "Cloud Architecture";
        else if (isNetworking) domain = "Networking & Infrastructure";
        else if (isMobile)  domain = "Mobile Development";
        else if (isFullStack) domain = "Full Stack Engineering";
        else if (isFrontend) domain = "Frontend Engineering";
        else if (isJava)    domain = "Backend Engineering (Java)";
        else if (isPython)  domain = "Backend Engineering (Python)";
        else if (isDotNet)  domain = "Backend Engineering (.NET)";
        else if (isGoLang)  domain = "Backend Engineering (Go)";
        else if (isQA)      domain = "Quality Assurance & Testing";
        else if (isERP)     domain = "ERP/Enterprise Consulting";
        else if (isFinTech) domain = "FinTech & Financial Technology";
        else if (isHealthcareIT) domain = "Healthcare IT";
        else if (isDesign)  domain = "UI/UX Design";
        else if (isEmbedded) domain = "Embedded Systems & IoT";
        else if (isGameDev) domain = "Game Development";
        else if (isProductMgr) domain = "Business Analysis & Product Management";
        else if (isMarketing) domain = "Digital Marketing & SEO";
        else if (isHR)      domain = "Human Resources & Talent Acquisition";
        else                domain = "Software Engineering";

        res.setIndustryDomain(domain);

        // ── 2. Career Level Detection ─────────────────────────────────────────
        int experienceYears = 0;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)\\+?\\s*years?").matcher(lower);
        if (m.find()) experienceYears = Integer.parseInt(m.group(1));
        boolean hasSeniorTitle = lower.contains("senior") || lower.contains("lead") || lower.contains("principal") || lower.contains("architect");
        boolean hasFresherSignal = lower.contains("fresher") || lower.contains("intern") || lower.contains("trainee") || lower.contains("b.tech") || lower.contains("b.e.");

        String careerLevel;
        if (hasFresherSignal && experienceYears < 2)         careerLevel = "Fresher";
        else if (experienceYears >= 12 || lower.contains("director") || lower.contains("vp") || lower.contains("cto")) careerLevel = "Lead/Principal";
        else if (hasSeniorTitle || experienceYears >= 6)      careerLevel = "Senior";
        else if (experienceYears >= 3)                        careerLevel = "Mid-Level";
        else if (experienceYears >= 1)                        careerLevel = "Junior";
        else                                                  careerLevel = "Fresher";
        res.setCareerLevel(careerLevel);

        // ── 3. Skill Detection ───────────────────────────────────────────────
        List<String> detectedSkills = new ArrayList<>();
        String[][] skillDict = {
            // Web / Frontend
            {"react", "React"}, {"next.js", "Next.js"}, {"nextjs", "Next.js"}, {"vue", "Vue.js"},
            {"angular", "Angular"}, {"svelte", "Svelte"}, {"redux", "Redux Toolkit"}, {"zustand", "Zustand"},
            {"tailwind", "Tailwind CSS"}, {"bootstrap", "Bootstrap"}, {"sass", "Sass/SCSS"}, {"scss", "Sass/SCSS"},
            {"javascript", "JavaScript"}, {"typescript", "TypeScript"}, {"html5", "HTML5"}, {"html", "HTML5"},
            {"css3", "CSS3"}, {"vite", "Vite"}, {"webpack", "Webpack"}, {"graphql", "GraphQL"},
            {"jest", "Jest"}, {"cypress", "Cypress"}, {"playwright", "Playwright"}, {"figma", "Figma"},
            // Backend
            {"java", "Java"}, {"spring boot", "Spring Boot"}, {"spring", "Spring Framework"},
            {"node", "Node.js"}, {"express", "Express.js"}, {"python", "Python"},
            {"django", "Django"}, {"flask", "Flask"}, {"fastapi", "FastAPI"},
            {"c#", "C#"}, {".net", ".NET"}, {"golang", "Go (Golang)"}, {"rust", "Rust"},
            {"kafka", "Apache Kafka"}, {"rabbitmq", "RabbitMQ"}, {"grpc", "gRPC"},
            {"microservices", "Microservices"}, {"rest", "REST APIs"},
            // Database
            {"postgresql", "PostgreSQL"}, {"mysql", "MySQL"}, {"mongodb", "MongoDB"},
            {"redis", "Redis"}, {"elasticsearch", "Elasticsearch"}, {"cassandra", "Apache Cassandra"},
            {"snowflake", "Snowflake"}, {"bigquery", "BigQuery"}, {"redshift", "Redshift"},
            {"neo4j", "Neo4j"}, {"sqlite", "SQLite"},
            // Cloud & DevOps
            {"aws", "AWS"}, {"azure", "Microsoft Azure"}, {"gcp", "Google Cloud (GCP)"},
            {"docker", "Docker"}, {"kubernetes", "Kubernetes"}, {"terraform", "Terraform"},
            {"jenkins", "Jenkins"}, {"github actions", "GitHub Actions"}, {"argocd", "ArgoCD"},
            {"linux", "Linux"}, {"bash", "Bash/Shell Scripting"}, {"ansible", "Ansible"},
            {"prometheus", "Prometheus"}, {"grafana", "Grafana"}, {"elk", "ELK Stack"},
            // Data & AI/ML
            {"pytorch", "PyTorch"}, {"tensorflow", "TensorFlow"}, {"scikit", "Scikit-learn"},
            {"keras", "Keras"}, {"pandas", "Pandas"}, {"numpy", "NumPy"}, {"spark", "Apache Spark"},
            {"langchain", "LangChain"}, {"hugging", "HuggingFace"}, {"openai", "OpenAI API"},
            {"airflow", "Apache Airflow"}, {"dbt", "dbt"}, {"hadoop", "Hadoop"},
            // Cybersecurity
            {"splunk", "Splunk SIEM"}, {"metasploit", "Metasploit"}, {"nmap", "Nmap"},
            {"burp suite", "Burp Suite"}, {"wireshark", "Wireshark"}, {"owasp", "OWASP"},
            {"kali", "Kali Linux"}, {"nessus", "Nessus"}, {"crowdstrike", "CrowdStrike"},
            // Mobile
            {"android", "Android (Kotlin/Java)"}, {"swift", "Swift (iOS)"}, {"kotlin", "Kotlin"},
            {"flutter", "Flutter"}, {"react native", "React Native"},
            // QA
            {"selenium", "Selenium"}, {"appium", "Appium"}, {"jmeter", "JMeter"},
            {"postman", "Postman"}, {"cucumber", "Cucumber/BDD"}, {"testng", "TestNG"},
            // ERP
            {"sap", "SAP"}, {"salesforce", "Salesforce"}, {"servicenow", "ServiceNow"},
            {"workday", "Workday"}, {"abap", "ABAP"},
            // Other
            {"git", "Git"}, {"agile", "Agile/Scrum"}, {"sql", "SQL"},
            {"c++", "C++"}, {"jira", "Jira"},
        };
        for (String[] pair : skillDict) {
            if (lower.contains(pair[0]) && !detectedSkills.contains(pair[1])) {
                detectedSkills.add(pair[1]);
            }
        }
        if (detectedSkills.isEmpty()) {
            detectedSkills.addAll(java.util.List.of("Software Development", "Problem Solving", "Team Collaboration"));
        }
        res.setSkills(detectedSkills);

        // ── 4. ATS & Scores ──────────────────────────────────────────────────
        int atsScore = 52;
        if (lower.contains("experience") || lower.contains("work history") || lower.contains("employment")) atsScore += 10;
        if (lower.contains("education") || lower.contains("degree") || lower.contains("university") || lower.contains("college")) atsScore += 8;
        if (lower.contains("skills") || lower.contains("technologies")) atsScore += 8;
        if (lower.contains("project")) atsScore += 7;
        if (lower.contains("certification") || lower.contains("achievement")) atsScore += 5;
        if (lower.contains("@")) atsScore += 4;
        if (lower.contains("linkedin") || lower.contains("github")) atsScore += 4;
        if (text.length() >= 800 && text.length() <= 8000) atsScore += 5;
        atsScore = Math.min(88, Math.max(55, atsScore));
        res.setAtsScore(atsScore);

        int overallScore = (int) (atsScore * 0.65 + Math.min(detectedSkills.size() * 2.0, 28));
        overallScore = Math.min(90, Math.max(52, overallScore));
        res.setOverallScore(overallScore);

        res.setKeywordScore(Math.min(90, Math.max(55, atsScore + 2)));
        res.setSkillScore(Math.min(92, Math.max(55, Math.min(detectedSkills.size() * 8 + 40, 88))));
        res.setExperienceScore(Math.min(88, Math.max(52, lower.contains("experience") ? 78 : 60)));
        res.setEducationScore(Math.min(90, Math.max(60, lower.contains("education") || lower.contains("degree") ? 80 : 65)));
        res.setFormattingScore(Math.min(90, Math.max(65, text.length() > 500 ? 82 : 68)));
        res.setCompletenessScore(Math.min(95, Math.max(60, lower.contains("@") ? 85 : 65)));

        // ── 5. Domain-Specific Strengths ─────────────────────────────────────
        List<String> strengths = new ArrayList<>();
        String top4Skills = String.join(", ", detectedSkills.subList(0, Math.min(4, detectedSkills.size())));
        if (isCyberSec) {
            strengths.add("Demonstrated expertise in cybersecurity fundamentals with proficiency in " + top4Skills + ".");
            strengths.add("Hands-on exposure to offensive/defensive security tools aligned with industry best practices.");
            if (lower.contains("project")) strengths.add("Practical security project implementations showcasing real-world threat analysis and mitigation.");
        } else if (isDataSci) {
            strengths.add("Strong ML/AI foundation with hands-on experience in " + top4Skills + ".");
            strengths.add("Data-driven mindset with clear ability to translate business problems into model-based solutions.");
            if (lower.contains("project")) strengths.add("Applied ML project work demonstrating end-to-end model development and evaluation.");
        } else if (isDevOps || isCloud) {
            strengths.add("Solid cloud/infrastructure foundation with proficiency in " + top4Skills + ".");
            strengths.add("Strong DevOps mindset with experience in automation, containerization, and CI/CD pipelines.");
            if (lower.contains("project")) strengths.add("Practical infrastructure-as-code and deployment automation implementations.");
        } else if (isFrontend) {
            strengths.add("Strong frontend engineering foundation with modern UI development skills in " + top4Skills + ".");
            strengths.add("Clear focus on component-driven development and responsive, accessible web design.");
            if (lower.contains("project")) strengths.add("Portfolio-worthy web application projects demonstrating real-world UI problem solving.");
        } else if (isFullStack) {
            strengths.add("Versatile full-stack profile spanning both frontend and backend technologies: " + top4Skills + ".");
            strengths.add("Ability to own end-to-end product features from database to UI layer.");
        } else {
            strengths.add("Well-rounded technical skill set featuring " + top4Skills + ".");
            strengths.add("Clear foundational knowledge of software engineering principles and structured problem solving.");
        }
        if (lower.contains("achievement") || lower.contains("winner") || lower.contains("rank") || lower.contains("hackathon")) {
            strengths.add("Commendable competitive achievements demonstrating initiative and technical performance under pressure.");
        }
        if (strengths.size() < 3) {
            strengths.add("Logical section structure and readable presentation covering education and project milestones.");
        }
        res.setStrengths(strengths);

        // ── 6. Domain-Specific Improvements ──────────────────────────────────
        List<String> improvements = new ArrayList<>();
        if (isCyberSec) {
            improvements.add("Quantify impact in security project descriptions (e.g., 'Detected and contained 3 simulated APT incidents using Splunk SIEM within 4-hour MTTR').");
            improvements.add("Obtain and prominently feature at least one recognized certification: CEH, CompTIA Security+, OSCP, or AWS Security Specialty.");
            improvements.add("Add a dedicated 'Tools & Platforms' section listing specific versions of security tools used (Kali Linux, Burp Suite, Nessus, Splunk).");
            improvements.add("Include a CTF (Capture The Flag) competitions section or link to HackTheBox/TryHackMe profile to demonstrate hands-on practice.");
        } else if (isDataSci) {
            improvements.add("Quantify model performance outcomes (e.g., 'Achieved 94.2% F1-score on binary classification using XGBoost, outperforming baseline by 12%').");
            improvements.add("Add links to Kaggle profile, published notebooks, or GitHub repositories with ML project code.");
            improvements.add("Include MLOps experience (model deployment, monitoring, drift detection) — increasingly required in 2025.");
            improvements.add("Specify dataset sizes and computational scale (e.g., 'Processed 50M records on Spark cluster across 8-node AWS EMR').");
        } else if (isDevOps || isCloud) {
            improvements.add("Quantify infrastructure scale (e.g., 'Managed Kubernetes cluster handling 200+ microservices across 3 AWS regions with 99.99% uptime').");
            improvements.add("Highlight cost optimization achievements (e.g., 'Reduced cloud infrastructure spend by 30% through reserved instance right-sizing').");
            improvements.add("Add cloud certifications prominently (AWS SAA, CKA, Google Cloud Professional, Azure Solutions Architect).");
            improvements.add("Specify IaC tools and scope (e.g., 'Managed 15K+ lines of Terraform for multi-region GCP infrastructure').");
        } else if (isFrontend) {
            improvements.add("Add Core Web Vitals metrics to project descriptions (LCP, CLS, FID scores, Lighthouse audit results, bundle size reductions).");
            improvements.add("Highlight testing coverage using Jest, Vitest, React Testing Library, or Cypress — often missing from junior resumes.");
            improvements.add("Add live deployed URLs and GitHub repository links directly under each project entry.");
            improvements.add("Demonstrate TypeScript usage and type-safety practices if not already present — critical for mid+ roles.");
        } else {
            improvements.add("Incorporate quantifiable business impact metrics (% performance gains, latency reductions, active users, uptime SLAs) in every bullet point.");
            improvements.add("Elaborate on CI/CD pipelines, automated testing, and containerization practices in your experience section.");
            improvements.add("Include a targeted professional summary tailored specifically to your primary desired role.");
            improvements.add("Highlight active open-source contributions, technical blog posts, or live deployed project URLs.");
        }
        res.setImprovements(improvements);

        // ── 7. Domain-Specific Missing Skills ────────────────────────────────
        List<String> missingSkills = new ArrayList<>();
        if (isCyberSec) {
            if (!lower.contains("splunk") && !lower.contains("siem")) missingSkills.add("SIEM Platform (Splunk/IBM QRadar)");
            if (!lower.contains("cloud security") && !lower.contains("aws security")) missingSkills.add("Cloud Security (AWS Security/Azure Defender)");
            if (!lower.contains("python") && !lower.contains("scripting")) missingSkills.add("Security Automation Scripting (Python/PowerShell)");
            if (!lower.contains("devsecops") && !lower.contains("sast")) missingSkills.add("DevSecOps & SAST/DAST Tools");
            if (missingSkills.size() < 3) missingSkills.add("Threat Intelligence Platforms (MITRE ATT&CK Framework)");
        } else if (isDataSci) {
            if (!lower.contains("mlops") && !lower.contains("kubeflow")) missingSkills.add("MLOps & Model Deployment (MLflow/BentoML/Vertex AI)");
            if (!lower.contains("langchain") && !lower.contains("llm")) missingSkills.add("LLM Integration & Prompt Engineering (LangChain/OpenAI API)");
            if (!lower.contains("spark") && !lower.contains("hadoop")) missingSkills.add("Large-Scale Data Processing (Apache Spark/Flink)");
            if (missingSkills.size() < 3) missingSkills.add("Feature Engineering & A/B Testing Frameworks");
        } else if (isDevOps || isCloud) {
            if (!lower.contains("kubernetes") && !lower.contains("k8s")) missingSkills.add("Kubernetes & Container Orchestration");
            if (!lower.contains("terraform") && !lower.contains("pulumi")) missingSkills.add("Infrastructure as Code (Terraform/Pulumi)");
            if (!lower.contains("observability") && !lower.contains("opentelemetry")) missingSkills.add("Observability Stack (OpenTelemetry/Datadog)");
            if (missingSkills.size() < 3) missingSkills.add("GitOps & ArgoCD/Flux CD");
        } else if (isFrontend) {
            if (!detectedSkills.contains("TypeScript")) missingSkills.add("TypeScript");
            if (!lower.contains("next.js") && !lower.contains("nextjs")) missingSkills.add("Next.js / SSR & SSG");
            if (!lower.contains("jest") && !lower.contains("cypress") && !lower.contains("playwright")) missingSkills.add("Frontend Testing (Jest/Playwright/Cypress)");
            if (!lower.contains("graphql")) missingSkills.add("GraphQL & Apollo Client");
            if (missingSkills.size() < 3) missingSkills.add("Web Performance & Core Web Vitals Optimization");
        } else {
            if (!lower.contains("docker") && !lower.contains("kubernetes")) missingSkills.add("Docker & Container Orchestration");
            if (!lower.contains("ci/cd") && !lower.contains("github actions")) missingSkills.add("CI/CD Automation (GitHub Actions/Jenkins)");
            if (!lower.contains("aws") && !lower.contains("azure") && !lower.contains("gcp")) missingSkills.add("Cloud Platform (AWS/Azure/GCP)");
            if (!lower.contains("microservices")) missingSkills.add("Microservices Architecture");
            if (missingSkills.size() < 3) missingSkills.add("System Design & Scalability Patterns");
        }
        res.setMissingSkills(missingSkills);

        // ── 8. Recommended Jobs ───────────────────────────────────────────────
        List<String> jobs = new ArrayList<>();
        if (isCyberSec)       jobs.addAll(java.util.List.of("Cybersecurity Analyst", "SOC Analyst", "Penetration Tester", "Information Security Engineer"));
        else if (isDataSci)   jobs.addAll(java.util.List.of("Data Scientist", "ML Engineer", "AI Research Engineer", "NLP Engineer"));
        else if (isDataEng)   jobs.addAll(java.util.List.of("Data Engineer", "Analytics Engineer", "Platform Engineer (Data)", "BI Engineer"));
        else if (isDevOps)    jobs.addAll(java.util.List.of("DevOps Engineer", "Site Reliability Engineer (SRE)", "Platform Engineer", "Cloud Infrastructure Engineer"));
        else if (isCloud)     jobs.addAll(java.util.List.of("Cloud Solutions Architect", "Cloud Engineer", "Infrastructure Engineer", "AWS/Azure Specialist"));
        else if (isNetworking) jobs.addAll(java.util.List.of("Network Engineer", "Network Administrator", "Infrastructure Engineer", "NOC Engineer"));
        else if (isMobile)    jobs.addAll(java.util.List.of("Android Developer", "iOS Developer", "Mobile Application Engineer", "Flutter Developer"));
        else if (isFullStack) jobs.addAll(java.util.List.of("Full Stack Developer", "Software Development Engineer (SDE)", "Backend Engineer", "Solutions Engineer"));
        else if (isFrontend)  jobs.addAll(java.util.List.of("Frontend Engineer", "React Developer", "UI Developer", "Junior Full Stack Developer"));
        else if (isJava)      jobs.addAll(java.util.List.of("Java Backend Developer", "Spring Boot Engineer", "Software Engineer", "Backend API Developer"));
        else if (isPython)    jobs.addAll(java.util.List.of("Python Developer", "Backend Software Engineer", "API Developer", "Software Engineer"));
        else if (isDotNet)    jobs.addAll(java.util.List.of(".NET Developer", "C# Software Engineer", "Backend Engineer", "Enterprise Software Developer"));
        else if (isQA)        jobs.addAll(java.util.List.of("QA Engineer", "Automation Test Engineer", "SDET", "Quality Engineer"));
        else if (isERP)       jobs.addAll(java.util.List.of("SAP Consultant", "ERP Implementation Specialist", "Salesforce Developer", "Enterprise Solutions Consultant"));
        else if (isFinTech)   jobs.addAll(java.util.List.of("FinTech Software Engineer", "Blockchain Developer", "Quantitative Developer", "Financial Technology Analyst"));
        else if (isHealthcareIT) jobs.addAll(java.util.List.of("Healthcare IT Analyst", "Clinical Informatics Specialist", "EHR Implementation Consultant", "Health Data Engineer"));
        else if (isDesign)    jobs.addAll(java.util.List.of("UI/UX Designer", "Product Designer", "Visual Designer", "UX Researcher"));
        else if (isEmbedded)  jobs.addAll(java.util.List.of("Embedded Systems Engineer", "Firmware Developer", "IoT Solutions Engineer", "FPGA Engineer"));
        else if (isGameDev)   jobs.addAll(java.util.List.of("Game Developer", "Unity Developer", "Gameplay Engineer", "Game Designer"));
        else if (isProductMgr) jobs.addAll(java.util.List.of("Product Manager", "Business Analyst", "Technical Product Owner", "Scrum Master"));
        else if (isMarketing) jobs.addAll(java.util.List.of("Digital Marketing Specialist", "SEO Analyst", "Performance Marketing Manager", "Growth Hacker"));
        else if (isHR)        jobs.addAll(java.util.List.of("HR Manager", "Talent Acquisition Specialist", "HRBP", "Recruitment Consultant"));
        else                  jobs.addAll(java.util.List.of("Software Engineer", "Associate Software Developer", "Web Applications Developer"));
        res.setRecommendedJobs(jobs);

        // ── 9. Summary ────────────────────────────────────────────────────────
        String primaryRole = jobs.get(0);
        res.setSummary(careerLevel + " " + domain + " candidate (" + primaryRole + ") with demonstrated proficiency in " +
                String.join(", ", detectedSkills.subList(0, Math.min(3, detectedSkills.size()))) +
                ". Profile shows solid structural alignment with industry standards. " +
                "Immediate priority: quantify project achievements with business metrics and strengthen portfolio visibility.");

        // ── 10. Interview Questions (domain-specific) ─────────────────────────
        List<String> questions = new ArrayList<>();
        if (isCyberSec) {
            questions.add("Walk me through your process for conducting a vulnerability assessment — what tools do you use and how do you prioritize findings?");
            questions.add("Describe a scenario where you detected a security incident. What indicators of compromise did you identify and what was your response?");
            questions.add("How would you approach setting up a SIEM alert rule to detect brute-force login attempts across 500 endpoints?");
            questions.add("Explain the difference between symmetric and asymmetric encryption and give a practical use case for each.");
        } else if (isDataSci) {
            questions.add("Walk me through your end-to-end process for building a classification model — from EDA to production deployment.");
            questions.add("How do you handle class imbalance in a binary classification problem? What metrics do you use to evaluate model quality?");
            questions.add("Explain the bias-variance tradeoff and how it influenced a model architecture decision you made in a project.");
            questions.add("How would you design an A/B testing framework to evaluate whether a new recommendation model improves conversion rate?");
        } else if (isDevOps || isCloud) {
            questions.add("Describe your approach to designing a highly available, fault-tolerant architecture for a critical microservice.");
            questions.add("How do you manage infrastructure drift and enforce consistency across multiple environments using Terraform?");
            questions.add("Walk me through your CI/CD pipeline design — what stages do you include and how do you handle rollback?");
            questions.add("How do you implement observability (logs, metrics, traces) for a distributed system in production?");
        } else if (isFrontend) {
            questions.add("Explain how React's reconciliation algorithm works and how you've optimized rendering performance in a large component tree.");
            questions.add("How do you approach state management in a large-scale React application — when would you choose Redux vs. Zustand vs. Context API?");
            questions.add("Walk me through how you'd optimize a web page's Core Web Vitals scores — specifically LCP and CLS.");
            questions.add("How do you ensure your frontend code is accessible (WCAG compliant) and what tools do you use to audit accessibility?");
        } else if (isJava || isFullStack) {
            questions.add("Explain how Spring Boot auto-configuration works internally and how you've customized it in a project.");
            questions.add("How do you design a rate-limiting system for a high-traffic REST API — what approaches and tools would you use?");
            questions.add("Describe your approach to database connection pool tuning and query optimization in a production Spring Boot application.");
            questions.add("How do you ensure data consistency across microservices? Explain the saga pattern vs. 2-phase commit.");
        } else {
            questions.add("Describe the most complex technical problem you've solved in your most recent project — what was your approach?");
            questions.add("How do you prioritize and manage technical debt in a production system while delivering new features?");
            questions.add("Walk me through how you would design a scalable system that handles 1 million concurrent users.");
            questions.add("How do you approach code reviews — what do you look for and how do you handle disagreements?");
        }
        res.setInterviewQuestions(questions);

        // ── 11. Resume Rewrite Tips ────────────────────────────────────────────
        List<String> rewriteTips = new ArrayList<>();
        if (isCyberSec) {
            rewriteTips.add("BEFORE: 'Worked on network security tasks' → AFTER: 'Conducted vulnerability assessments on 200+ endpoints using Nessus, identifying and prioritizing 47 critical CVEs for remediation within 2-week SLA'");
            rewriteTips.add("BEFORE: 'Used Splunk for monitoring' → AFTER: 'Built 12 custom Splunk correlation rules to detect anomalous login patterns, reducing false-positive alert rate by 40%'");
            rewriteTips.add("BEFORE: 'Participated in penetration testing' → AFTER: 'Performed black-box penetration tests on 3 web applications, uncovering 2 critical OWASP Top-10 vulnerabilities (SQL injection, IDOR) and drafted detailed PoC reports'");
        } else if (isDataSci) {
            rewriteTips.add("BEFORE: 'Built a machine learning model' → AFTER: 'Developed an XGBoost churn prediction model achieving 91% accuracy and 0.87 AUC-ROC, deployed via FastAPI on AWS Lambda serving 10K daily predictions'");
            rewriteTips.add("BEFORE: 'Worked on NLP project' → AFTER: 'Fine-tuned BERT-base for sentiment classification on 500K customer reviews, improving F1-score from 0.72 to 0.89 over TF-IDF baseline'");
            rewriteTips.add("BEFORE: 'Analyzed data using Python' → AFTER: 'Automated weekly sales analytics pipeline using Pandas and Airflow, reducing manual reporting time from 8 hours to 20 minutes per week'");
        } else if (isFrontend) {
            rewriteTips.add("BEFORE: 'Built a React application' → AFTER: 'Architected a React 18 + TypeScript SPA for an e-commerce platform serving 15K+ monthly active users, achieving 95+ Lighthouse performance score via code splitting and lazy loading'");
            rewriteTips.add("BEFORE: 'Improved website performance' → AFTER: 'Reduced LCP from 4.2s to 1.8s by implementing image lazy-loading, route-based code splitting, and CDN caching — improving Core Web Vitals pass rate from 42% to 89%'");
            rewriteTips.add("BEFORE: 'Added authentication to the app' → AFTER: 'Implemented JWT-based authentication with OAuth2 social login (Google/GitHub) using React Context + Axios interceptors, securing 8 protected routes'");
        } else {
            rewriteTips.add("BEFORE: 'Worked on backend APIs' → AFTER: 'Designed and implemented 15 RESTful API endpoints using Spring Boot, handling 50K+ daily requests with < 150ms p95 latency under load testing'");
            rewriteTips.add("BEFORE: 'Used Docker for deployment' → AFTER: 'Containerized 6 microservices using Docker and Kubernetes on AWS EKS, achieving zero-downtime deployments with rolling update strategy'");
            rewriteTips.add("BEFORE: 'Helped improve system performance' → AFTER: 'Optimized PostgreSQL queries by adding composite indexes and rewriting N+1 queries, reducing average API response time by 62% (from 850ms to 320ms)'");
        }
        res.setResumeRewriteTips(rewriteTips);

        // ── 12. ATS Bullet Points ─────────────────────────────────────────────
        List<String> bullets = new ArrayList<>();
        if (isCyberSec) {
            bullets.add("Identified and remediated 35+ critical vulnerabilities across web and network infrastructure using Nessus and Burp Suite, reducing organizational attack surface by 60%.");
            bullets.add("Built and maintained Splunk SIEM dashboards monitoring 500GB/day log data, correlating security events and reducing mean time to detect (MTTD) by 45%.");
        } else if (isDataSci) {
            bullets.add("Designed and deployed a real-time fraud detection ML model (Random Forest + XGBoost ensemble) achieving 97.3% precision, preventing an estimated $2M in fraudulent transactions annually.");
            bullets.add("Built an NLP-powered ticket classification pipeline using BERT fine-tuning, automating 78% of support ticket routing and saving 120+ engineering hours per month.");
        } else if (isDevOps || isCloud) {
            bullets.add("Architected and managed a Kubernetes-based microservices platform on AWS EKS serving 50M+ monthly requests across 3 availability zones with 99.98% uptime SLA.");
            bullets.add("Automated infrastructure provisioning with Terraform and GitHub Actions CI/CD pipelines, reducing deployment time from 2 hours to 8 minutes and eliminating manual configuration drift.");
        } else if (isFrontend) {
            bullets.add("Engineered a React 18 + TypeScript enterprise dashboard with real-time WebSocket data feeds, serving 5K+ concurrent users with < 100ms initial render using Vite and code splitting.");
            bullets.add("Improved frontend performance by 45% through lazy loading, image optimization (WebP/AVIF), and Lighthouse-guided refactoring — raising Google PageSpeed score from 58 to 92.");
        } else {
            bullets.add("Designed and implemented a scalable REST API platform using Spring Boot 3.2 and PostgreSQL, handling 100K+ daily requests with < 200ms p99 latency and 99.9% uptime.");
            bullets.add("Led migration of monolithic application to microservices architecture on Kubernetes, reducing deployment frequency from monthly to daily releases and improving team velocity by 35%.");
        }
        res.setAtsBulletPoints(bullets);

        return res;
    }



    // ── Private Helpers ──────────────────────────────────────────────────────

    /**
     * Null-safe sanitizer: fills in sensible defaults for any field the model left null,
     * and clamps integer scores to the 0–100 range.
     */
    private void sanitize(AiAnalysisResult result) {
        if (result.getOverallScore()    == null) result.setOverallScore(75);
        if (result.getAtsScore()        == null) result.setAtsScore(75);
        if (result.getKeywordScore()    == null) result.setKeywordScore(result.getAtsScore());
        if (result.getSkillScore()      == null) result.setSkillScore(result.getOverallScore());
        if (result.getExperienceScore() == null) result.setExperienceScore(result.getOverallScore());
        if (result.getEducationScore()  == null) result.setEducationScore(result.getAtsScore());
        if (result.getFormattingScore() == null) result.setFormattingScore(result.getAtsScore());
        if (result.getCompletenessScore() == null) result.setCompletenessScore(85);

        if (result.getStrengths()         == null) result.setStrengths(java.util.List.of());
        if (result.getImprovements()      == null) result.setImprovements(java.util.List.of());
        if (result.getSkills()            == null) result.setSkills(java.util.List.of());
        if (result.getMissingSkills()     == null) result.setMissingSkills(java.util.List.of());
        if (result.getRecommendedJobs()   == null) result.setRecommendedJobs(java.util.List.of());
        if (result.getSummary()           == null) result.setSummary("");

        // New fields — null-safe defaults
        if (result.getCareerLevel()       == null || result.getCareerLevel().isBlank())
            result.setCareerLevel("Junior");
        if (result.getIndustryDomain()    == null || result.getIndustryDomain().isBlank())
            result.setIndustryDomain("Software Engineering");
        if (result.getInterviewQuestions()  == null) result.setInterviewQuestions(java.util.List.of());
        if (result.getResumeRewriteTips()   == null) result.setResumeRewriteTips(java.util.List.of());
        if (result.getAtsBulletPoints()     == null) result.setAtsBulletPoints(java.util.List.of());

        result.setOverallScore(Math.min(100, Math.max(0, result.getOverallScore())));
        result.setAtsScore(Math.min(100, Math.max(0, result.getAtsScore())));
        result.setKeywordScore(Math.min(100, Math.max(0, result.getKeywordScore())));
        result.setSkillScore(Math.min(100, Math.max(0, result.getSkillScore())));
        result.setExperienceScore(Math.min(100, Math.max(0, result.getExperienceScore())));
        result.setEducationScore(Math.min(100, Math.max(0, result.getEducationScore())));
        result.setFormattingScore(Math.min(100, Math.max(0, result.getFormattingScore())));
        result.setCompletenessScore(Math.min(100, Math.max(0, result.getCompletenessScore())));
    }


    // ── System Prompt ────────────────────────────────────────────────────────

    /**
     * System prompt used for every analysis request.
     * Spring AI appends the JSON schema for {@link AiAnalysisResult} automatically when
     * {@code .entity(Class)} is used, so we do NOT need to describe the JSON structure here.
     * We only need to define the domain expertise and scoring guidelines.
     */
    private static final String SYSTEM_PROMPT = """
            You are a world-class AI resume auditor and technical hiring expert with 20+ years of experience
            across software engineering, cybersecurity, data science, cloud/DevOps, FinTech, healthcare IT,
            ERP/SAP, embedded systems, UI/UX design, product management, digital marketing, and all other professional domains.

            YOUR MISSION: Deliver a ruthlessly honest, domain-accurate, actionable JSON resume evaluation.
            DO NOT inflate scores. DO NOT give generic advice. ALL feedback must be specific to THIS candidate.

            ═══ DOMAIN DETECTION (Critical — do this first) ═══
            Carefully read the resume and identify:
            1. Primary specialization domain (e.g., "Backend Engineering", "Cybersecurity", "Data Science & ML",
               "DevOps/Cloud", "Frontend Engineering", "Full Stack Engineering", "Mobile Development (Android/iOS)",
               "Networking & Infrastructure", "FinTech/Financial Technology", "Healthcare IT", "ERP/SAP Consulting",
               "Salesforce Development", "UI/UX Design", "Quality Assurance & Testing", "Embedded Systems & IoT",
               "Game Development", "Business Analysis & Product Management", "Digital Marketing & SEO",
               "Human Resources & Talent Acquisition", "Supply Chain & Operations", "Legal Tech", "Data Engineering")
            2. Career seniority level based on years of experience, role titles, and education graduation year:
               - "Fresher" (0-1 year or student/recent grad)
               - "Junior" (1-3 years)
               - "Mid-Level" (3-6 years)
               - "Senior" (6-12 years)
               - "Lead/Principal" (12+ years or explicit lead/principal/staff roles)
               - "Executive" (VP, CTO, Director, C-suite)

            ═══ SCORING GUIDELINES (0-100 scale, NO inflation) ═══
            Most real-world resumes score 40-75. A score of 85+ should be genuinely exceptional.
            - overallScore: Holistic quality — depth, quantified results, clarity, project execution, relevance
            - atsScore: ATS keyword density, standard section headers, parseability, contact completeness
            - keywordScore: Density and relevance of domain-specific technical keywords for THIS candidate's field
            - skillScore: Variety, depth, and current-year relevance of skills listed — penalize outdated stacks
            - experienceScore: Quality of work descriptions — action verbs, quantified metrics (numbers, %, scale, users, latency)
            - educationScore: Degree relevance, institution tier if discernible, certifications, training
            - formattingScore: Clean structure, standard headings, no special characters that break ATS parsers
            - completenessScore: Has email, phone, LinkedIn/GitHub/portfolio, all key sections present

            ═══ CONTENT REQUIREMENTS (all must be specific to THIS resume) ═══
            - strengths: 3-5 genuine, specific strengths found directly in the text — quote actual skills/tools/projects
            - improvements: 3-5 high-impact, actionable suggestions — be specific (e.g., "Add GitHub repo URL under Project X", not "Add links")
            - skills: ALL technical skills, tools, frameworks, platforms detected in the resume text
            - missingSkills: 3-5 skills that are HIGH-DEMAND for this candidate's domain in 2025 and NOT already on the resume
            - recommendedJobs: 3-5 specific job titles that exactly match this candidate's profile and experience level
            - summary: 2-3 sentence executive assessment — state their domain, career level, biggest strength, and one urgent priority

            ═══ NEW REQUIRED FIELDS ═══
            - careerLevel: One of: "Fresher", "Junior", "Mid-Level", "Senior", "Lead/Principal", "Executive"
            - industryDomain: One specific domain string (see Domain Detection above)
            - interviewQuestions: 3-5 specific technical questions a hiring manager would ask THIS candidate. Make them
              domain-appropriate and based on actual content in their resume. E.g., for a cybersecurity candidate who listed
              Splunk: "Walk me through how you built a SIEM correlation rule in Splunk to detect lateral movement." NOT generic questions.
            - resumeRewriteTips: 3-5 bullet rewrite suggestions each formatted EXACTLY as:
              "BEFORE: [copy a weak line from their resume] → AFTER: [improved version with a realistic metric/action]"
              If resume text is unavailable for exact lines, synthesize plausible ones from their domain.
            - atsBulletPoints: 2-3 complete, ready-to-paste ATS-optimized resume bullets for this candidate's target role.
              Each should start with a strong action verb, contain a specific achievement, and include a plausible metric.
              E.g.: "Engineered a real-time threat detection pipeline using Splunk SIEM and Python, reducing MTTR by 35%."

            ═══ OUTPUT FORMAT ═══
            Return ONLY valid JSON. No markdown, no explanation, no preamble. Schema:
            {
              "overallScore": <integer 0-100>,
              "atsScore": <integer 0-100>,
              "keywordScore": <integer 0-100>,
              "skillScore": <integer 0-100>,
              "experienceScore": <integer 0-100>,
              "educationScore": <integer 0-100>,
              "formattingScore": <integer 0-100>,
              "completenessScore": <integer 0-100>,
              "careerLevel": "<string>",
              "industryDomain": "<string>",
              "summary": "<string>",
              "strengths": ["<string>", ...],
              "improvements": ["<string>", ...],
              "skills": ["<string>", ...],
              "missingSkills": ["<string>", ...],
              "recommendedJobs": ["<string>", ...],
              "interviewQuestions": ["<string>", ...],
              "resumeRewriteTips": ["BEFORE: ... → AFTER: ...", ...],
              "atsBulletPoints": ["<string>", ...]
            }
            """;
}

