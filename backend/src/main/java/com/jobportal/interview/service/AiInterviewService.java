package com.jobportal.interview.service;

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
import com.jobportal.interview.dto.AiEvaluationResult;
import com.jobportal.interview.dto.AiQuestionResult;
import com.jobportal.interview.entity.InterviewQuestion;
import com.jobportal.interview.entity.InterviewSession;
import com.jobportal.interview.enums.InterviewTrack;

/**
 * Spring AI service that generates interview questions and evaluates user answers
 * using resilient multi-model Groq/OpenAI endpoints via {@link ChatClient}.
 */
@Service
public class AiInterviewService {

    private static final Logger log = LoggerFactory.getLogger(AiInterviewService.class);

    private static final String MODEL_PRIMARY = "openai/gpt-oss-120b";
    private static final String MODEL_FALLBACK_1 = "openai/gpt-oss-20b";
    private static final String MODEL_FALLBACK_2 = "groq/compound-mini";

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public AiInterviewService(ChatClient.Builder chatClientBuilder, ObjectMapper objectMapper) {
        ChatClient client = null;
        try {
            ChatClient.Builder customized = chatClientBuilder.defaultOptions(OpenAiChatOptions.builder().temperature(0.2));
            if (customized != null) {
                client = customized.build();
            }
        } catch (Exception ignored) {}
        this.chatClient = client != null ? client : chatClientBuilder.build();
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    public AiInterviewService(ChatClient.Builder chatClientBuilder) {
        this(chatClientBuilder, new ObjectMapper());
    }

    /**
     * Generates a new interview question tailored to the session track, specialization, difficulty, and context.
     */
    public AiQuestionResult generateQuestion(InterviewSession session, String contextInfo, List<String> previousQuestions) {
        String promptText = buildQuestionPrompt(session, contextInfo, previousQuestions);
        String trackName = session.getTrackTitle() != null ? session.getTrackTitle() : String.valueOf(session.getInterviewTrack());

        log.info("\n==================== GENERATING INTERVIEW QUESTION ====================\n" +
                 "Track: {} ({})\nDifficulty: {}\nOrder: {}\n" +
                 "===============================================================",
                 trackName, session.getInterviewTrack(), session.getDifficulty(), session.getCurrentQuestion() + 1);

        AiQuestionResult result = null;

        // 1. Primary call
        try {
            String raw = chatClient
                    .prompt()
                    .options(OpenAiChatOptions.builder().model(MODEL_PRIMARY).temperature(0.2))
                    .system(QUESTION_SYSTEM_PROMPT)
                    .user(promptText + "\n\nIMPORTANT: Respond ONLY with valid JSON matching {\"question\": \"...\", \"expectedAnswer\": \"...\", \"difficulty\": \"...\"}")
                    .call()
                    .content();
            result = parseQuestionResult(raw);
        } catch (Exception e) {
            log.warn("Primary question call failed: {}. Trying fallback model [{}]...", e.getMessage(), MODEL_FALLBACK_1);
        }

        // 2. Fallback model 1
        if (result == null || result.getQuestion() == null || result.getQuestion().isBlank()) {
            try {
                String raw = chatClient
                        .prompt()
                        .options(OpenAiChatOptions.builder().model(MODEL_FALLBACK_1).temperature(0.2))
                        .system(QUESTION_SYSTEM_PROMPT)
                        .user(promptText + "\n\nIMPORTANT: Respond ONLY with valid JSON matching {\"question\": \"...\", \"expectedAnswer\": \"...\", \"difficulty\": \"...\"}")
                        .call()
                        .content();
                result = parseQuestionResult(raw);
            } catch (Exception eFallback1) {
                log.warn("Fallback 1 [{}] question failed: {}. Trying fallback model [{}]...", MODEL_FALLBACK_1, eFallback1.getMessage(), MODEL_FALLBACK_2);
            }
        }

        // 3. Fallback model 2
        if (result == null || result.getQuestion() == null || result.getQuestion().isBlank()) {
            try {
                String raw = chatClient
                        .prompt()
                        .options(OpenAiChatOptions.builder().model(MODEL_FALLBACK_2).temperature(0.2))
                        .system(QUESTION_SYSTEM_PROMPT)
                        .user(promptText + "\n\nIMPORTANT: Respond ONLY with valid JSON matching {\"question\": \"...\", \"expectedAnswer\": \"...\", \"difficulty\": \"...\"}")
                        .call()
                        .content();
                result = parseQuestionResult(raw);
            } catch (Exception eFallback2) {
                log.warn("Fallback 2 [{}] question failed: {}. Engaging contextual domain fallback generator.", MODEL_FALLBACK_2, eFallback2.getMessage());
            }
        }

        // 4. Contextual domain fallback
        if (result == null || result.getQuestion() == null || result.getQuestion().isBlank()) {
            log.info("Engaging domain fallback question generator for track=[{}]", trackName);
            result = generateFallbackQuestion(session, previousQuestions);
        }

        log.info("\n==================== GENERATED QUESTION ====================\n" +
                 "Question: {}\nExpected: {}\n" +
                 "===============================================================",
                 result.getQuestion(), result.getExpectedAnswer());

        return result;
    }

    /**
     * Evaluates a candidate's answer for a question and returns score, feedback, strengths, weaknesses, suggestions.
     */
    public AiEvaluationResult evaluateAnswer(InterviewQuestion question, String userAnswer, InterviewTrack track) {
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            log.info("User answer is empty for questionId=[{}] — returning 0 score evaluation", question.getId());
            AiEvaluationResult emptyResult = new AiEvaluationResult();
            emptyResult.setScore(0);
            emptyResult.setFeedback("No answer was provided for this question.");
            emptyResult.setStrengths(List.of());
            emptyResult.setWeaknesses(List.of("Question was skipped or submitted without an answer."));
            emptyResult.setSuggestions(List.of("Provide a technical explanation to receive a non-zero evaluation score."));
            emptyResult.setIdealAnswer(question.getExpectedAnswer() != null ? question.getExpectedAnswer() : "Standard industry answer");
            emptyResult.setFollowUpQuestion("");
            return emptyResult;
        }

        String promptText = buildEvaluationPrompt(question, userAnswer, track);

        log.info("\n==================== EVALUATING ANSWER ====================\n" +
                 "Question: {}\nUser Answer: {}\n" +
                 "===============================================================",
                 question.getQuestion(), userAnswer);

        AiEvaluationResult result = null;

        // 1. Primary call
        try {
            String raw = chatClient
                    .prompt()
                    .options(OpenAiChatOptions.builder().model(MODEL_PRIMARY).temperature(0.1))
                    .system(EVALUATION_SYSTEM_PROMPT)
                    .user(promptText + "\n\nIMPORTANT: Respond ONLY with valid JSON matching {\"score\": 85, \"feedback\": \"...\", \"strengths\": [...], \"weaknesses\": [...], \"suggestions\": [...], \"idealAnswer\": \"...\", \"followUpQuestion\": \"...\"}")
                    .call()
                    .content();
            result = parseEvaluationResult(raw);
        } catch (Exception e) {
            log.warn("Primary evaluation call failed: {}. Trying fallback model [{}]...", e.getMessage(), MODEL_FALLBACK_1);
        }

        // 2. Fallback model 1
        if (result == null) {
            try {
                String raw = chatClient
                        .prompt()
                        .options(OpenAiChatOptions.builder().model(MODEL_FALLBACK_1).temperature(0.1))
                        .system(EVALUATION_SYSTEM_PROMPT)
                        .user(promptText + "\n\nIMPORTANT: Respond ONLY with valid JSON matching {\"score\": 85, \"feedback\": \"...\", \"strengths\": [...], \"weaknesses\": [...], \"suggestions\": [...], \"idealAnswer\": \"...\", \"followUpQuestion\": \"...\"}")
                        .call()
                        .content();
                result = parseEvaluationResult(raw);
            } catch (Exception eFallback1) {
                log.warn("Fallback 1 [{}] evaluation failed: {}. Trying fallback model [{}]...", MODEL_FALLBACK_1, eFallback1.getMessage(), MODEL_FALLBACK_2);
            }
        }

        // 3. Fallback model 2
        if (result == null) {
            try {
                String raw = chatClient
                        .prompt()
                        .options(OpenAiChatOptions.builder().model(MODEL_FALLBACK_2).temperature(0.1))
                        .system(EVALUATION_SYSTEM_PROMPT)
                        .user(promptText + "\n\nIMPORTANT: Respond ONLY with valid JSON matching {\"score\": 85, \"feedback\": \"...\", \"strengths\": [...], \"weaknesses\": [...], \"suggestions\": [...], \"idealAnswer\": \"...\", \"followUpQuestion\": \"...\"}")
                        .call()
                        .content();
                result = parseEvaluationResult(raw);
            } catch (Exception eFallback2) {
                log.warn("Fallback 2 [{}] evaluation failed: {}. Engaging contextual evaluation generator.", MODEL_FALLBACK_2, eFallback2.getMessage());
            }
        }

        // 4. Heuristic evaluation fallback
        if (result == null) {
            log.info("Engaging contextual evaluation fallback generator for answer of length: {}", (userAnswer != null ? userAnswer.length() : 0));
            result = generateFallbackEvaluation(question, userAnswer, track);
        }

        sanitizeEvaluation(result);

        log.info("\n==================== EVALUATION COMPLETED ====================\n" +
                 "Score: {}\nFeedback: {}\nStrengths: {}\nWeaknesses: {}\n" +
                 "===============================================================",
                 result.getScore(), result.getFeedback(), result.getStrengths(), result.getWeaknesses());

        return result;
    }

    // ── Resilient JSON Parsing ────────────────────────────────────────────────

    private AiQuestionResult parseQuestionResult(String content) {
        if (content == null || content.isBlank()) return null;
        try {
            String cleaned = stripMarkdownFences(content);
            return objectMapper.readValue(cleaned, AiQuestionResult.class);
        } catch (Exception e) {
            log.warn("Failed to parse raw text into AiQuestionResult: {}", e.getMessage());
            return null;
        }
    }

    private AiEvaluationResult parseEvaluationResult(String content) {
        if (content == null || content.isBlank()) return null;
        try {
            String cleaned = stripMarkdownFences(content);
            return objectMapper.readValue(cleaned, AiEvaluationResult.class);
        } catch (Exception e) {
            log.warn("Failed to parse raw text into AiEvaluationResult: {}", e.getMessage());
            return null;
        }
    }

    private String stripMarkdownFences(String content) {
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
        return cleaned;
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    private void sanitizeEvaluation(AiEvaluationResult result) {
        if (result.getScore()       == null) result.setScore(0);
        if (result.getFeedback()    == null) result.setFeedback("No feedback provided.");
        if (result.getStrengths()   == null) result.setStrengths(List.of());
        if (result.getWeaknesses()  == null) result.setWeaknesses(List.of());
        if (result.getSuggestions() == null) result.setSuggestions(List.of());
        if (result.getIdealAnswer() == null) result.setIdealAnswer("");

        result.setScore(Math.min(100, Math.max(0, result.getScore())));
    }

    private String buildQuestionPrompt(InterviewSession session, String contextInfo, List<String> previousQuestions) {
        StringBuilder sb = new StringBuilder();
        sb.append("Generate a single highly relevant, realistic, and domain-tailored interview question.\n\n");

        String trackTitle = session.getTrackTitle();
        if (trackTitle != null && !trackTitle.isBlank()) {
            sb.append("Candidate Specialization Track: ").append(trackTitle).append("\n");
        }
        sb.append("Interview Category: ").append(session.getInterviewTrack()).append("\n");
        sb.append("Target Difficulty Level: ").append(session.getDifficulty()).append("\n");
        sb.append("Question Number: ").append(session.getCurrentQuestion() + 1).append(" of ").append(session.getTotalQuestions()).append("\n");

        if (trackTitle != null && !trackTitle.isBlank()) {
            sb.append("\nSPECIALIZATION REQUIREMENT:\n");
            sb.append("Ask a question specifically centered on modern best practices, architectural decisions, and real-world engineering trade-offs in: ")
              .append(trackTitle).append(".\n");
        }

        if (contextInfo != null && !contextInfo.isBlank()) {
            sb.append("\nCandidate / Job Context:\n").append(contextInfo).append("\n");
        }

        if (previousQuestions != null && !previousQuestions.isEmpty()) {
            sb.append("\nDo NOT repeat or closely rephrase any of these previously asked questions:\n");
            for (String pq : previousQuestions) {
                sb.append("- ").append(pq).append("\n");
            }
        }

        sb.append("\nRespond with the interview question, the expected core criteria/answer key, and the difficulty level.");
        return sb.toString();
    }

    private String buildEvaluationPrompt(InterviewQuestion question, String userAnswer, InterviewTrack track) {
        InterviewSession session = question.getSession();
        String trackTitle = (session != null && session.getTrackTitle() != null) ? session.getTrackTitle() : String.valueOf(track);

        return """
                Evaluate the candidate's answer to the interview question below.

                TARGET ROLE / SPECIALIZATION: %s
                TRACK CATEGORY: %s
                DIFFICULTY: %s
                QUESTION: %s
                EXPECTED ANSWER KEY: %s

                CANDIDATE ANSWER:
                %s

                Evaluate accurately and constructively based on industry standards for this specialization.
                """.formatted(
                trackTitle,
                track,
                question.getDifficulty(),
                question.getQuestion(),
                question.getExpectedAnswer() != null ? question.getExpectedAnswer() : "Standard industry answer",
                userAnswer
        );
    }

    private AiQuestionResult generateFallbackQuestion(InterviewSession session, List<String> previousQuestions) {
        String trackTitle = session.getTrackTitle() != null ? session.getTrackTitle().toLowerCase() : "";
        String trackId = session.getTrackId() != null ? session.getTrackId().toLowerCase() : "";
        InterviewTrack track = session.getInterviewTrack();
        String difficulty = session.getDifficulty() != null ? session.getDifficulty().name() : "INTERMEDIATE";

        List<String[]> questionBank;

        if (trackId.contains("react") || trackTitle.contains("react") || trackTitle.contains("frontend")) {
            questionBank = List.of(
                new String[]{"Can you explain how React 18 Concurrent Features (such as useTransition and Suspense) improve user experience during heavy state updates?", "Covers interruptible rendering, prioritizing urgent user inputs (clicks/typing) over non-urgent state transitions, and avoiding frozen UI tabs."},
                new String[]{"How does React's Virtual DOM reconciliation algorithm work under the hood, and why are keys crucial when rendering dynamic lists?", "Covers diffing heuristic (O(n) complexity), component tree comparison, fiber architecture, and how keys preserve component state between re-renders."},
                new String[]{"What architectural strategies do you employ in modern web apps to minimize Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)?", "Covers code splitting, dynamic imports, image optimization (Next/Image or WebP/AVIF), font preloading, and explicit dimensions on layout containers."},
                new String[]{"Compare Zustand or Redux Toolkit with React Context API. In what scenarios does React Context cause performance bottlenecks?", "Covers re-render cascades on context provider value changes, selector-based subscriptions in Zustand/Redux Toolkit, and atomic state updates."}
            );
        } else if (trackId.contains("java") || trackTitle.contains("java") || trackTitle.contains("spring")) {
            questionBank = List.of(
                new String[]{"How does Spring Boot autoconfiguration work internally via @EnableAutoConfiguration and spring.factories / AutoConfiguration.imports?", "Covers condition annotations (@ConditionalOnClass, @ConditionalOnMissingBean), configuration ordering, and modular dependency inclusion."},
                new String[]{"Explain the Hibernate / JPA 'N+1 Select' query problem and how to eliminate it in production enterprise applications.", "Covers JOIN FETCH, Entity Graphs (@NamedEntityGraph), batch size configuration (hibernate.default_batch_fetch_size), and DTO projections."},
                new String[]{"How do you manage distributed transactions across microservices, and what are the trade-offs between the 2-Phase Commit (2PC) and Saga pattern?", "Covers choreographic vs orchestrated Sagas, compensating transactions, eventual consistency, and avoiding blocking locks in distributed architectures."},
                new String[]{"Describe how Java's ConcurrentHashMap achieves thread-safety without locking the entire map like Collections.synchronizedMap.", "Covers lock striping, CAS (Compare-And-Swap) operations, bucket-level synchronization, and synchronized tree bins."}
            );
        } else if (trackId.contains("python") || trackTitle.contains("python") || trackTitle.contains("backend")) {
            questionBank = List.of(
                new String[]{"How does Python's Global Interpreter Lock (GIL) impact CPU-bound vs I/O-bound concurrency, and how does Python 3.13 free-threaded mode address this?", "Covers GIL mechanics, multiprocessing vs multithreading vs asyncio, and the evolution of no-GIL builds in modern Python."},
                new String[]{"Explain the async/await event loop in FastAPI and ASGI frameworks compared to WSGI sync workers (like Django or Flask with Gunicorn).", "Covers non-blocking event loops (uvloop), coroutine scheduling, worker process pools, and avoiding blocking calls inside async handlers."},
                new String[]{"How do you optimize slow database queries in an ORM like SQLAlchemy or Django ORM when dealing with millions of records?", "Covers select_related (joins) vs prefetch_related, indexing, database query profiling (EXPLAIN ANALYZE), and database connection pooling."}
            );
        } else if (trackId.contains("ai") || trackTitle.contains("ai") || trackTitle.contains("llm")) {
            questionBank = List.of(
                new String[]{"What are the key trade-offs between dense semantic retrieval (vector embeddings) and keyword-based sparse retrieval (BM25) in Retrieval-Augmented Generation (RAG)?", "Covers hybrid search, reciprocal rank fusion (RRF), cross-encoder re-ranking, and addressing semantic drift vs exact lexical matching."},
                new String[]{"How do you prevent Prompt Injection and Hallucinations when developing production Agentic AI workflows?", "Covers system prompt guardrails, structured output enforcement (Pydantic/JSON schema), tool-call authorization checks, and RAG factual grounding checks."}
            );
        } else if (track == InterviewTrack.SYSTEM_DESIGN || trackId.contains("system-design") || trackTitle.contains("system design")) {
            questionBank = List.of(
                new String[]{"How would you design a scalable distributed rate-limiting service supporting 500,000 requests per second with sub-10ms latency?", "Covers Sliding Window Counter in Redis, token bucket algorithms, distributed race conditions with Lua scripts, and client-side fallbacks."},
                new String[]{"Explain how database sharding works and how to mitigate resharding overhead and hot spot partitions in high-traffic applications.", "Covers consistent hashing, shard keys, virtual nodes, cross-shard queries, and global secondary indices."}
            );
        } else if (track == InterviewTrack.HR || track == InterviewTrack.BEHAVIORAL || trackId.contains("behavioral")) {
            questionBank = List.of(
                new String[]{"Describe a severe production incident or outage you were involved in. How did you triage, resolve, and conduct the post-mortem?", "Covers root cause analysis (RCA), blameless post-mortem culture, effective team communication, and action items to prevent recurrence using the STAR method."},
                new String[]{"Tell me about a time you strongly disagreed with a peer or architectural decision. How did you handle the debate and move forward?", "Covers data-driven arguments, respectful technical discourse, 'disagree and commit', and maintaining positive team alignment."}
            );
        } else {
            questionBank = List.of(
                new String[]{"How does the indexing mechanism in relational databases improve query performance, and what are the trade-offs during write operations?", "Covers B-Trees/B+Trees, index lookups vs full table scans, write amplification on inserts/updates."},
                new String[]{"Can you explain how concurrency and thread safety are managed in high-throughput backend services?", "Covers mutexes, atomic variables, and optimistic vs pessimistic locking."},
                new String[]{"What is the difference between synchronous and asynchronous request processing in distributed microservices?", "Covers blocking I/O, event-driven architectures, message queues like Kafka/RabbitMQ, and latency impact."}
            );
        }

        String selectedQ = questionBank.get(0)[0];
        String selectedAns = questionBank.get(0)[1];

        if (previousQuestions != null) {
            for (String[] pair : questionBank) {
                if (!previousQuestions.contains(pair[0])) {
                    selectedQ = pair[0];
                    selectedAns = pair[1];
                    break;
                }
            }
        }

        AiQuestionResult res = new AiQuestionResult();
        res.setQuestion(selectedQ);
        res.setExpectedAnswer(selectedAns);
        res.setDifficulty(difficulty);
        return res;
    }

    private AiEvaluationResult generateFallbackEvaluation(InterviewQuestion question, String userAnswer, InterviewTrack track) {
        AiEvaluationResult res = new AiEvaluationResult();
        String ans = userAnswer != null ? userAnswer.trim() : "";
        int wordCount = ans.isEmpty() ? 0 : ans.split("\\s+").length;

        int score;
        String feedback;
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (wordCount < 15) {
            score = 52;
            feedback = "Your answer touches on the basic premise but lacks technical depth and elaboration.";
            strengths.add("Directly addresses the question without unnecessary tangents.");
            weaknesses.add("Answer is too brief; lacks concrete technical examples and trade-off considerations.");
            suggestions.add("Elaborate with specific architectural or code-level examples from your practical experience.");
            suggestions.add("Explain the 'why' behind your chosen approach, not just the 'what'.");
        } else if (wordCount < 50) {
            score = 76;
            feedback = "Good response covering the fundamental concepts clearly with solid technical terminology.";
            strengths.add("Clear understanding of the underlying domain principles.");
            strengths.add("Communicated concepts in a structured and professional tone.");
            weaknesses.add("Could be enhanced with quantifiable metrics or real-world edge case considerations.");
            suggestions.add("Mention edge cases, scaling limits, or failure recovery strategies in future answers.");
        } else {
            score = 88;
            feedback = "Thorough and well-structured answer demonstrating strong domain knowledge and practical engineering maturity.";
            strengths.add("Comprehensive coverage of both core mechanisms and production implications.");
            strengths.add("Logical structure and confident explanation of engineering trade-offs.");
            weaknesses.add("Ensure responses remain concise and focused when presenting complex topics.");
            suggestions.add("Highlight any relevant metrics or performance gains achieved in past implementations.");
        }

        res.setScore(score);
        res.setFeedback(feedback);
        res.setStrengths(strengths);
        res.setWeaknesses(weaknesses);
        res.setSuggestions(suggestions);
        res.setIdealAnswer(question.getExpectedAnswer() != null ? question.getExpectedAnswer() : "A complete answer covering core concepts, real-world examples, and trade-offs.");
        res.setFollowUpQuestion("Can you discuss how this approach behaves under extreme load or failure scenarios?");
        return res;
    }

    // ── System Prompts ───────────────────────────────────────────────────────

    private static final String QUESTION_SYSTEM_PROMPT = """
            You are a Principal Tech Lead and Executive Interviewer conducting a rigorous, professional mock interview.

            Your goal is to ask realistic, clear, and challenging questions strictly tailored to the requested candidate specialization and difficulty level.

            Guidelines:
            - Accurately adopt the domain of the candidate's specialization (e.g., React Frontend, Java Full Stack, Python Backend, AI/LLM, System Design, Behavioral).
            - Focus on real-world engineering trade-offs, architecture, design patterns, failure modes, and practical best practices.
            - Ensure the question is clear, concise, and professional.

            Respond with a structured question object containing:
            - question: The clear question text to ask the candidate.
            - expectedAnswer: Key points and criteria the ideal answer should cover.
            - difficulty: The difficulty level of this specific question.
            """;

    private static final String EVALUATION_SYSTEM_PROMPT = """
            You are a Senior Tech Recruiter and Technical Assessment Specialist.

            Your goal is to evaluate the candidate's answer fairly, accurately, and constructively based on industry standards for their specialization.

            Scoring guidelines (0-100):
            - 90-100: Outstanding answer covering all key concepts, clear, concise, well-structured.
            - 75-89: Strong answer covering most key points with minor gaps.
            - 50-74: Partial answer, correct core concept but missing crucial details or structure.
            - 0-49: Incorrect, off-topic, incomplete, or vague answer.

            Evaluation guidelines:
            - score (0-100): The numerical score.
            - feedback: A 2-3 sentence overview of the answer quality.
            - strengths: 2-3 specific things done well in the candidate's answer.
            - weaknesses: 2-3 missing elements, inaccuracies, or areas where the answer fell short.
            - suggestions: 2-3 actionable tips on how to improve this answer in a real interview.
            - idealAnswer: A model answer to demonstrate how a top candidate would answer.
            - followUpQuestion: A relevant probing follow-up question.
            """;
}

