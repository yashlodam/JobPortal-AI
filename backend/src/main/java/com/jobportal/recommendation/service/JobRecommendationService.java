package com.jobportal.recommendation.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.JobStatus;
import com.jobportal.domain.WorkingMode;
import com.jobportal.entity.Job;
import com.jobportal.entity.Profile;
import com.jobportal.entity.Resume;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.jobmatch.service.DeterministicJobMatcher;
import com.jobportal.jobmatch.service.DeterministicJobMatcher.SkillMatchResult;
import com.jobportal.recommendation.dto.RecommendedJobResponse;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.repository.SavedJobRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.resumebuilder.entity.ResumeDocument;
import com.jobportal.resumebuilder.repository.ResumeDocumentRepository;
import com.jobportal.resumeanalysis.entity.ResumeAnalysis;
import com.jobportal.resumeanalysis.repository.ResumeAnalysisRepository;
import com.jobportal.resumeanalysis.service.ResumeParserService;

/**
 * Deterministic recommendation engine for applicants.
 *
 * <h3>Scoring Model (Weighted Composite 0–100)</h3>
 * <pre>
 *   Skill Fit         55%  — required skill match (exact + alias normalized)
 *   Location/Mode     25%  — remote/hybrid/onsite city/state/country match
 *   Experience Fit    15%  — years vs job min/max range
 *   Freshness          5%  — tiebreaker: recently posted jobs ranked higher
 * </pre>
 *
 * <h3>Strict Gating Rules</h3>
 * <ul>
 *   <li>Job has required skills AND candidate matches 0 → score hard-capped at 15</li>
 *   <li>Required skill match &lt; 30% → score capped at 30</li>
 *   <li>Required skill match 30–49% → score capped at 50</li>
 *   <li>On-site job in entirely different city → composite capped at 25</li>
 *   <li>Application deadline passed → job excluded from recommendations</li>
 * </ul>
 *
 * <h3>Boost Rules (tiebreakers — composite never exceeds 100)</h3>
 * <ul>
 *   <li>Title/headline affinity → +5 when job title keywords overlap with candidate's profile headline</li>
 *   <li>Urgent hiring flag → +3</li>
 *   <li>Featured flag → +2</li>
 *   <li>Easy-apply flag → +1 (convenience boost for quick applications)</li>
 * </ul>
 */
@Service
@Transactional(readOnly = true)
public class JobRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(JobRecommendationService.class);

    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT     = 50;

    // Scoring weights (must sum to 1.0)
    private static final double WEIGHT_SKILL      = 0.55;
    private static final double WEIGHT_LOCATION   = 0.25;
    private static final double WEIGHT_EXPERIENCE = 0.15;
    private static final double WEIGHT_FRESHNESS  = 0.05;

    private final UserRepository           userRepository;
    private final ProfileRepository        profileRepository;
    private final JobRepository            jobRepository;
    private final SavedJobRepository       savedJobRepository;
    private final ResumeDocumentRepository resumeDocumentRepository;
    private final DeterministicJobMatcher  matcher;
    private final ResumeRepository         resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ResumeParserService      resumeParserService;

    public JobRecommendationService(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            JobRepository jobRepository,
            SavedJobRepository savedJobRepository,
            ResumeDocumentRepository resumeDocumentRepository,
            DeterministicJobMatcher matcher) {
        this(userRepository, profileRepository, jobRepository, savedJobRepository, resumeDocumentRepository, matcher, null, null, null);
    }

    @Autowired
    public JobRecommendationService(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            JobRepository jobRepository,
            SavedJobRepository savedJobRepository,
            ResumeDocumentRepository resumeDocumentRepository,
            DeterministicJobMatcher matcher,
            @Autowired(required = false) ResumeRepository resumeRepository,
            @Autowired(required = false) ResumeAnalysisRepository resumeAnalysisRepository,
            @Autowired(required = false) ResumeParserService resumeParserService) {
        this.userRepository           = userRepository;
        this.profileRepository        = profileRepository;
        this.jobRepository            = jobRepository;
        this.savedJobRepository       = savedJobRepository;
        this.resumeDocumentRepository = resumeDocumentRepository;
        this.matcher                  = matcher;
        this.resumeRepository         = resumeRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.resumeParserService      = resumeParserService;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Computes the real ATS match analysis for a single job against the authenticated applicant,
     * taking into account their profile, builder resume, and specific uploaded resume (if provided).
     *
     * @param jobId    target job ID
     * @param resumeId optional resume ID selected by the applicant
     * @param email    the applicant's email
     * @return recommended job response with real match score and breakdown
     */
    public RecommendedJobResponse getJobMatch(Long jobId, Long resumeId, String email) throws JobPortalException {
        User user = resolveUser(email);
        if (user == null) {
            throw JobPortalException.notFound("User not found for email: " + email);
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> JobPortalException.notFound("Job not found with id: " + jobId));

        Profile profile = resolveProfile(user, email);
        ResumeDocument resumeDoc = loadLatestResumeDocument(user.getId());

        List<String> uploadedSkills = List.of();
        String resumeRawText = null;

        if (resumeId != null && resumeRepository != null) {
            Optional<Resume> resumeOpt = resumeRepository.findById(resumeId);
            if (resumeOpt.isPresent()) {
                Resume r = resumeOpt.get();
                try {
                    if (resumeParserService != null) {
                        resumeRawText = resumeParserService.extractText(r);
                    }
                    if (resumeAnalysisRepository != null) {
                        Optional<ResumeAnalysis> analysisOpt = resumeAnalysisRepository.findByResumeId(r.getId());
                        if (analysisOpt.isPresent() && analysisOpt.get().getDetectedSkills() != null) {
                            uploadedSkills = analysisOpt.get().getDetectedSkills();
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not parse resume id {}: {}", resumeId, e.getMessage());
                }
            } else if (resumeDocumentRepository != null) {
                Optional<ResumeDocument> docOpt = resumeDocumentRepository.findById(resumeId);
                if (docOpt.isPresent()) {
                    resumeDoc = docOpt.get();
                }
            }
        } else if (profile != null && resumeRepository != null) {
            try {
                Optional<Resume> defaultRes = resumeRepository.findByProfileIdAndIsDefaultTrue(profile.getId());
                if (defaultRes.isPresent()) {
                    Resume r = defaultRes.get();
                    if (resumeParserService != null) {
                        resumeRawText = resumeParserService.extractText(r);
                    }
                    if (resumeAnalysisRepository != null) {
                        Optional<ResumeAnalysis> analysisOpt = resumeAnalysisRepository.findByResumeId(r.getId());
                        if (analysisOpt.isPresent() && analysisOpt.get().getDetectedSkills() != null) {
                            uploadedSkills = analysisOpt.get().getDetectedSkills();
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        Set<String> candidateSkills = matcher.extractCandidateSkills(profile, resumeDoc, uploadedSkills, resumeRawText, job);
        Set<Long> savedJobIds = loadSavedJobIdsBatch(user.getId());

        return scoreJob(job, profile, resumeDoc, candidateSkills, savedJobIds);
    }

    /**
     * Returns a personalised ranked list of recommended jobs for the authenticated applicant.
     *
     * @param email       the authenticated applicant's email
     * @param limit       max number of results (1–50; default 10)
     * @param minMatchPct minimum match percentage filter (0–100; 0 means no filter)
     * @return            scored and sorted job recommendations
     */
    public List<RecommendedJobResponse> getRecommendations(
            String email, int limit, int minMatchPct) {

        int effectiveLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
        log.info("Generating recommendations for user=[{}] limit=[{}] minMatch=[{}%]",
                email, effectiveLimit, minMatchPct);

        // 1. Resolve user
        User user = resolveUser(email);
        if (user == null) {
            log.warn("Recommendation skipped — user not found for email: {}", email);
            return List.of();
        }

        // 2. Multi-tier profile resolution
        Profile profile = resolveProfile(user, email);

        // 3. Load latest resume builder document (structured skills source)
        ResumeDocument resumeDoc = loadLatestResumeDocument(user.getId());

        // 4. Extract & normalize all candidate skills
        Set<String> candidateSkills = matcher.extractCandidateSkills(profile, resumeDoc);
        log.info("Extracted [{}] candidate skills for user=[{}]: {}",
                candidateSkills.size(), email, candidateSkills);

        // 5. Fetch candidate job pool (OPEN, not yet applied) — BOUNDED to 50 to prevent OOM.
        // A new applicant with 0 applications would previously load ALL open jobs into heap.
        List<Job> candidateJobs = jobRepository.findOpenJobsNotAppliedByApplicant(
                user.getId(), PageRequest.of(0, 50));

        // Fallback: all top open jobs if candidate has applied to everything
        if (candidateJobs == null || candidateJobs.isEmpty()) {
            log.info("No unapplied open jobs found. Falling back to all open jobs for user=[{}]", email);
            candidateJobs = jobRepository.findTop10OpenJobs(JobStatus.OPEN);
        }

        if (candidateJobs == null || candidateJobs.isEmpty()) {
            log.warn("No active open jobs found in database. Returning empty recommendations.");
            return List.of();
        }

        // 6. Filter expired jobs (application deadline in the past)
        LocalDate today = LocalDate.now();
        candidateJobs = candidateJobs.stream()
                .filter(j -> j.getApplicationDeadline() == null || !j.getApplicationDeadline().isBefore(today))
                .toList();

        log.info("Candidate job pool size=[{}] (after deadline filter) for user=[{}]",
                candidateJobs.size(), email);

        // 7. Pre-load saved job IDs (single batch query — no N+1)
        Set<Long> savedJobIds = loadSavedJobIdsBatch(user.getId());

        // 8. Score every candidate job using strict ATS criteria
        List<RecommendedJobResponse> results = new ArrayList<>();
        for (Job job : candidateJobs) {
            RecommendedJobResponse rec = scoreJob(job, profile, resumeDoc, candidateSkills, savedJobIds);
            if (rec.getMatchPercentage() >= minMatchPct) {
                results.add(rec);
            }
        }

        // 9. Sort: match % descending, then freshness descending (tiebreaker)
        results.sort(Comparator
                .comparingInt(RecommendedJobResponse::getMatchPercentage).reversed()
                .thenComparing(r -> r.getPostedAt() != null ? r.getPostedAt() : LocalDateTime.MIN,
                        Comparator.reverseOrder()));

        // 10. Trim to limit
        List<RecommendedJobResponse> trimmed = results.stream()
                .limit(effectiveLimit)
                .toList();

        log.info("Returning {} recommendations for user=[{}] (scored {} jobs, {} passed minMatch filter)",
                trimmed.size(), email, candidateJobs.size(), results.size());

        return trimmed;
    }

    // ── Resolution Helpers ────────────────────────────────────────────────────

    private User resolveUser(String email) {
        if (email == null || email.isBlank()) return null;
        return userRepository.findByEmail(email)
                .or(() -> userRepository.findByEmail(email.toLowerCase(Locale.ROOT)))
                .orElse(null);
    }

    private Profile resolveProfile(User user, String email) {
        Profile profile = null;

        // Attempt 1: full eager load with JOIN FETCH (skills, experiences, educations)
        try {
            profile = profileRepository.findByUserEmailWithDetails(email).orElse(null);
        } catch (Exception e) {
            log.debug("findByUserEmailWithDetails failed: {}", e.getMessage());
        }

        // Attempt 2: by user ID
        if (profile == null && user.getId() != null) {
            try {
                profile = profileRepository.findByUserId(user.getId()).orElse(null);
            } catch (Exception e) {
                log.debug("findByUserId failed: {}", e.getMessage());
            }
        }

        // Attempt 3: profile already loaded on the User entity
        if (profile == null && user.getProfile() != null) {
            profile = user.getProfile();
        }

        // Attempt 4: plain email lookup
        if (profile == null) {
            try {
                profile = profileRepository.findByUserEmail(email).orElse(null);
            } catch (Exception e) {
                log.debug("findByUserEmail failed: {}", e.getMessage());
            }
        }

        if (profile != null) {
            log.info("Resolved Profile id=[{}] for user=[{}] — skills=[{}] location=[{}] expLevel=[{}]",
                    profile.getId(), email,
                    profile.getSkills() != null ? profile.getSkills().size() : 0,
                    profile.getLocation(),
                    profile.getExperienceLevel());
        } else {
            log.warn("No Profile entity found for user=[{}] — scoring will be based on resume only", email);
        }

        return profile;
    }

    private ResumeDocument loadLatestResumeDocument(Long userId) {
        List<ResumeDocument> docs = resumeDocumentRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return (docs != null && !docs.isEmpty()) ? docs.get(0) : null;
    }

    // ── Scoring Engine ────────────────────────────────────────────────────────

    /**
     * Core ATS evaluation:
     * Skills (55%) + Location (25%) + Experience (15%) + Freshness (5%)
     * with strict gating guardrails and minor urgency/featured boosts.
     */
    private RecommendedJobResponse scoreJob(
            Job job,
            Profile profile,
            ResumeDocument resumeDoc,
            Set<String> candidateSkills,
            Set<Long> savedJobIds) {

        boolean hasRequiredSkills  = job.getSkillsRequired() != null && !job.getSkillsRequired().isEmpty();
        boolean hasPreferredSkills = job.getPreferredSkills() != null && !job.getPreferredSkills().isEmpty();

        // ── 1. Skill Score (55%) ──────────────────────────────────────────────
        SkillMatchResult skillResult = matcher.evaluateSkills(job, candidateSkills);

        int skillScore;
        if (hasRequiredSkills && hasPreferredSkills) {
            // 85% weight on required, 15% on preferred bonus
            skillScore = (int) Math.round(
                    (skillResult.requiredPercentage() * 0.85)
                    + (skillResult.preferredPercentage() * 0.15));
        } else if (hasRequiredSkills) {
            skillScore = skillResult.requiredPercentage();
        } else if (hasPreferredSkills) {
            // No required skills — preferred score only, capped at 75 (not full weight)
            // because a job with zero required skills is underdefined
            skillScore = (int) Math.round(skillResult.preferredPercentage() * 0.75);
        } else {
            // Job has no skills listed → neutral baseline (35, not 50 to avoid inflation)
            skillScore = 35;
        }

        // ── 2. Location & Work Mode Score (25%) ───────────────────────────────
        int locScore = evaluateLocation(job, profile);

        // ── 3. Experience Score (15%) ──────────────────────────────────────────
        int expScore = matcher.evaluateExperience(job, profile, resumeDoc);

        // ── 4. Freshness Score (5%) ────────────────────────────────────────────
        int freshScore = evaluateFreshness(job);

        // ── 5. Raw Weighted Composite ──────────────────────────────────────────
        double rawComposite =
                (skillScore   * WEIGHT_SKILL)      +
                (locScore     * WEIGHT_LOCATION)   +
                (expScore     * WEIGHT_EXPERIENCE) +
                (freshScore   * WEIGHT_FRESHNESS);

        // ── 6. Strict Gating Guardrails ────────────────────────────────────────
        if (hasRequiredSkills) {
            int reqPct = skillResult.requiredPercentage();
            if (reqPct == 0) {
                // Zero required skills matched → hard cap (avoids inflated score from loc/exp)
                rawComposite = Math.min(rawComposite, 15.0);
            } else if (reqPct < 30) {
                rawComposite = Math.min(rawComposite, 30.0);
            } else if (reqPct < 50) {
                rawComposite = Math.min(rawComposite, 50.0);
            }
            // 50–69%: no cap — score reflects actual weighted composite
        }

        // On-site job in a completely different location → strong location penalty
        if (job.getWorkingMode() == WorkingMode.ONSITE && locScore == 0) {
            rawComposite = Math.min(rawComposite, 25.0);
        }

        // ── 7. Minor Boosts (tiebreaker only — capped at 100) ─────────────────
        // Title / Headline Affinity: if the candidate's profile headline shares
        // keywords with the job title, this is a strong semantic signal that the
        // role aligns with what the candidate actually does day-to-day.
        if (hasHeadlineTitleAffinity(profile, job)) rawComposite = Math.min(100, rawComposite + 5);
        if (Boolean.TRUE.equals(job.getUrgentHiring()))  rawComposite = Math.min(100, rawComposite + 3);
        if (Boolean.TRUE.equals(job.getFeatured()))      rawComposite = Math.min(100, rawComposite + 2);
        if (Boolean.TRUE.equals(job.getEasyApply()))     rawComposite = Math.min(100, rawComposite + 1);

        int finalScore = (int) Math.min(100, Math.max(0, Math.round(rawComposite)));

        // ── 8. Build Response ──────────────────────────────────────────────────
        return buildResponse(job, finalScore, skillScore, locScore, expScore, freshScore,
                skillResult, savedJobIds);
    }

    private RecommendedJobResponse buildResponse(
            Job job,
            int finalScore,
            int skillScore,
            int locScore,
            int expScore,
            int freshScore,
            SkillMatchResult skillResult,
            Set<Long> savedJobIds) {

        RecommendedJobResponse resp = new RecommendedJobResponse();

        // Standard job fields
        resp.setId(job.getId());
        resp.setJobTitle(job.getJobTitle());
        resp.setCategory(job.getCategory());
        resp.setCity(job.getCity());
        resp.setState(job.getState());
        resp.setCountry(job.getCountry());
        resp.setWorkingMode(job.getWorkingMode());
        resp.setJobType(job.getJobType());
        resp.setExperienceLevel(job.getExperienceLevel());
        resp.setMinimumSalary(job.getMinimumSalary());
        resp.setMaximumSalary(job.getMaximumSalary());
        resp.setCurrency(job.getCurrency());
        resp.setVacancies(job.getVacancies());
        resp.setFeatured(job.getFeatured());
        resp.setUrgentHiring(job.getUrgentHiring());
        resp.setEasyApply(job.getEasyApply());
        resp.setApplicationDeadline(job.getApplicationDeadline());
        resp.setPostedAt(job.getCreatedAt());

        // Company info (flattened)
        if (job.getCompany() != null) {
            resp.setCompanyId(job.getCompany().getId());
            resp.setCompanyName(job.getCompany().getCompanyName());
            resp.setCompanyLogo(job.getCompany().getLogo());
        }

        // Match metadata
        resp.setMatchPercentage(finalScore);
        resp.setMatchGrade(resolveGrade(finalScore));
        resp.setMatchedSkills(skillResult.matchedRequired());
        resp.setMissingSkills(skillResult.missingRequired());
        resp.setMatchedPreferredSkills(skillResult.matchedPreferred());
        resp.setSkillMatchScore(skillScore);
        resp.setExperienceMatchScore(expScore);
        resp.setLocationMatchScore(locScore);
        resp.setFreshnessScore(freshScore);
        resp.setMatchReason(buildMatchReason(skillResult, locScore, expScore, freshScore, job));
        resp.setSaved(savedJobIds.contains(job.getId()));

        return resp;
    }

    // ── Sub-scorers ───────────────────────────────────────────────────────────

    /**
     * Title / Headline Affinity Check.
     *
     * <p>Checks whether the candidate's profile headline shares meaningful keywords
     * with the job title. For example, a headline of "Senior Java Backend Developer"
     * matching against a job title of "Java Backend Engineer" yields true.
     *
     * <p>Rules:
     * <ul>
     *   <li>Splits headline and job title into lowercase tokens (≥ 4 chars to skip noise like "and", "for")</li>
     *   <li>Excludes stop-words: "senior", "junior", "lead", "engineer", "developer", "manager", "specialist"</li>
     *   <li>Returns true if at least 1 meaningful keyword is shared</li>
     * </ul>
     */
    private static final Set<String> TITLE_STOP_WORDS = Set.of(
            "senior", "junior", "lead", "principal", "staff", "associate",
            "engineer", "developer", "manager", "specialist", "analyst",
            "architect", "consultant", "intern", "trainee", "executive",
            "officer", "head", "director", "vice", "president", "chief"
    );

    private boolean hasHeadlineTitleAffinity(Profile profile, Job job) {
        if (profile == null || profile.getHeadline() == null || profile.getHeadline().isBlank()) return false;
        if (job.getJobTitle() == null || job.getJobTitle().isBlank()) return false;

        String headline  = profile.getHeadline().toLowerCase(Locale.ROOT);
        String jobTitle  = job.getJobTitle().toLowerCase(Locale.ROOT);

        Set<String> headlineTokens = tokenizeForAffinity(headline);
        Set<String> titleTokens    = tokenizeForAffinity(jobTitle);

        // Intersection: any meaningful shared token is a match
        for (String t : headlineTokens) {
            if (titleTokens.contains(t)) return true;
        }
        return false;
    }

    private Set<String> tokenizeForAffinity(String text) {
        Set<String> tokens = new HashSet<>();
        for (String word : text.split("[\\s,/\\-+.]+")) {
            String w = word.trim();
            if (w.length() >= 3 && !TITLE_STOP_WORDS.contains(w)) {
                tokens.add(w);
            }
        }
        return tokens;
    }

    /**
     * Location &amp; Work Mode Scoring:
     * <pre>
     *   REMOTE                           → 100
     *   HYBRID city match                → 100
     *   HYBRID state match               → 65
     *   HYBRID country match             → 30
     *   HYBRID unknown candidate loc     → 45
     *   HYBRID different location        → 15
     *   ONSITE city match                → 100
     *   ONSITE state match               → 45
     *   ONSITE country match             → 15
     *   ONSITE unknown candidate loc     → 35
     *   ONSITE different location        → 0  (triggers gate at composite level)
     * </pre>
     *
     * <p>Uses word-boundary token matching so "pune" does NOT match "impune".
     */
    private int evaluateLocation(Job job, Profile profile) {
        WorkingMode mode = job.getWorkingMode();

        if (mode == WorkingMode.REMOTE) return 100;

        if (profile == null || profile.getLocation() == null || profile.getLocation().isBlank()) {
            return mode == WorkingMode.HYBRID ? 45 : 35;
        }

        String candLoc   = profile.getLocation().toLowerCase(Locale.ROOT).trim();
        String jobCity   = job.getCity()    != null ? job.getCity().toLowerCase(Locale.ROOT).trim()    : "";
        String jobState  = job.getState()   != null ? job.getState().toLowerCase(Locale.ROOT).trim()   : "";
        String jobCountry= job.getCountry() != null ? job.getCountry().toLowerCase(Locale.ROOT).trim() : "";

        boolean cityMatch    = !jobCity.isBlank()    && locationContains(candLoc, jobCity);
        boolean stateMatch   = !jobState.isBlank()   && locationContains(candLoc, jobState);
        boolean countryMatch = !jobCountry.isBlank() && locationContains(candLoc, jobCountry);

        if (cityMatch)    return 100;
        if (stateMatch)   return mode == WorkingMode.HYBRID ? 65 : 45;
        if (countryMatch) return mode == WorkingMode.HYBRID ? 30 : 15;

        return mode == WorkingMode.HYBRID ? 15 : 0;
    }

    /**
     * Word-boundary-aware location containment check.
     * Prevents "pune" matching "impune", "bangalore" matching "bad" etc.
     */
    private boolean locationContains(String candLoc, String locationToken) {
        if (candLoc.equals(locationToken)) return true;
        // Check as whole word using delimiter chars (space, comma, slash, dash)
        int idx = candLoc.indexOf(locationToken);
        if (idx < 0) return false;
        boolean startOk = (idx == 0)
                || !Character.isLetter(candLoc.charAt(idx - 1));
        int end = idx + locationToken.length();
        boolean endOk = (end >= candLoc.length())
                || !Character.isLetter(candLoc.charAt(end));
        return startOk && endOk;
    }

    /**
     * Freshness decay — recency tiebreaker:
     * <pre>
     *   ≤ 3 days  = 100
     *   ≤ 7 days  = 90
     *   ≤ 14 days = 75
     *   ≤ 30 days = 50
     *   ≤ 60 days = 30
     *   > 60 days = 15
     * </pre>
     */
    private int evaluateFreshness(Job job) {
        if (job.getCreatedAt() == null) return 50;
        long daysOld = ChronoUnit.DAYS.between(job.getCreatedAt(), LocalDateTime.now());
        if (daysOld <= 3)  return 100;
        if (daysOld <= 7)  return 90;
        if (daysOld <= 14) return 75;
        if (daysOld <= 30) return 50;
        if (daysOld <= 60) return 30;
        return 15;
    }

    private String resolveGrade(int pct) {
        if (pct >= 85) return "EXCELLENT";
        if (pct >= 70) return "GREAT";
        if (pct >= 55) return "GOOD";
        if (pct >= 35) return "FAIR";
        return "LOW";
    }

    private String buildMatchReason(
            SkillMatchResult skillResult, int locScore, int expScore, int freshScore, Job job) {
        List<String> reasons = new ArrayList<>();

        int matched = skillResult.matchedRequired().size();
        int total   = matched + skillResult.missingRequired().size();

        if (total > 0) {
            if (matched == total) {
                reasons.add("All " + total + " required skills matched");
            } else if (matched > 0) {
                reasons.add(matched + "/" + total + " required skills matched");
            } else {
                reasons.add("Missing all required skills");
            }
        } else if (!skillResult.matchedPreferred().isEmpty()) {
            reasons.add(skillResult.matchedPreferred().size() + " preferred skills matched");
        }

        if (job.getWorkingMode() == WorkingMode.REMOTE) {
            reasons.add("Remote work");
        } else if (locScore >= 100) {
            reasons.add("Location match (" + (job.getCity() != null ? job.getCity() : "Local") + ")");
        } else if (locScore >= 50) {
            reasons.add("Same region");
        } else if (locScore == 0 && job.getWorkingMode() == WorkingMode.ONSITE) {
            reasons.add("Location mismatch");
        }

        if (expScore >= 90) {
            reasons.add("Experience matches");
        } else if (expScore >= 70) {
            reasons.add("Experience close to requirement");
        }

        if (Boolean.TRUE.equals(job.getUrgentHiring())) {
            reasons.add("Urgent hiring");
        }

        if (Boolean.TRUE.equals(job.getEasyApply())) {
            reasons.add("Easy Apply available");
        }

        if (freshScore >= 90) {
            reasons.add("Posted recently");
        }

        return reasons.isEmpty() ? "Based on profile analysis" : String.join(" · ", reasons);
    }

    /**
     * Loads saved job IDs for the given user in a single batch query.
     * Avoids N+1 by fetching all saved IDs once instead of per-job existence checks.
     */
    private Set<Long> loadSavedJobIdsBatch(Long userId) {
        try {
            List<Long> ids = savedJobRepository.findJobIdsByUserId(userId);
            return ids != null ? new HashSet<>(ids) : new HashSet<>();
        } catch (Exception e) {
            log.warn("Could not load saved job IDs for userId=[{}]: {}", userId, e.getMessage());
            return new HashSet<>();
        }
    }
}
