package com.jobportal.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;
import com.jobportal.dto.request.JobFilterRequest;
import com.jobportal.dto.response.CategoryResponse;
import com.jobportal.dto.response.SearchFacetsResponse;
import com.jobportal.dto.response.SearchSuggestionsResponse;
import com.jobportal.dto.response.WorkModeResponse;
import com.jobportal.entity.Job;
import com.jobportal.repository.JobRepository;

@Service
@Transactional(readOnly = true)
public class JobSearchEngineService {

    private final JobRepository jobRepository;

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "an", "the", "and", "or", "in", "at", "for", "with", "to", "of",
            "jobs", "job", "hiring", "openings", "opening", "vacancy", "vacancies",
            "looking", "urgent", "needed", "required", "role", "roles", "position"
    ));

    private static final Map<String, List<String>> TECH_SYNONYMS = new HashMap<>();

    static {
        registerSynonyms("react", "reactjs", "react.js");
        registerSynonyms("node", "nodejs", "node.js");
        registerSynonyms("vue", "vuejs", "vue.js");
        registerSynonyms("angular", "angularjs");
        registerSynonyms("spring", "springboot", "spring boot");
        registerSynonyms("golang", "go");
        registerSynonyms("k8s", "kubernetes");
        registerSynonyms("ml", "machine learning");
        registerSynonyms("ai", "artificial intelligence");
        registerSynonyms("cyber security", "cybersecurity", "infosec", "security");
        registerSynonyms("devops", "sre", "site reliability", "cloud engineer");
        registerSynonyms("full stack", "fullstack", "full-stack");
        registerSynonyms("frontend", "front-end", "front end", "ui developer");
        registerSynonyms("backend", "back-end", "back end");
        registerSynonyms("qa", "quality assurance", "test engineer", "sdet", "tester", "automation testing");
        registerSynonyms("aws", "amazon web services");
        registerSynonyms("gcp", "google cloud");
        registerSynonyms("azure", "microsoft azure");
        registerSynonyms("postgres", "postgresql");
        registerSynonyms("mongo", "mongodb");
        registerSynonyms("c#", "csharp", ".net", "dotnet");
    }

    private static void registerSynonyms(String... words) {
        List<String> list = Arrays.asList(words);
        for (String w : words) {
            TECH_SYNONYMS.put(w.toLowerCase(Locale.ROOT), list);
        }
    }

    public JobSearchEngineService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // ── Search Intent & Token Extraction ──────────────────────────────────────

    public static class SearchIntent {
        private String cleanedKeyword;
        private List<String> tokens = new ArrayList<>();
        private Set<String> synonyms = new HashSet<>();
        private String extractedCity;
        private WorkingMode extractedMode;
        private JobType extractedJobType;
        private ExperienceLevel extractedExperience;

        public String getCleanedKeyword() { return cleanedKeyword; }
        public void setCleanedKeyword(String cleanedKeyword) { this.cleanedKeyword = cleanedKeyword; }

        public List<String> getTokens() { return tokens; }
        public void setTokens(List<String> tokens) { this.tokens = tokens; }

        public Set<String> getSynonyms() { return synonyms; }
        public void setSynonyms(Set<String> synonyms) { this.synonyms = synonyms; }

        public String getExtractedCity() { return extractedCity; }
        public void setExtractedCity(String extractedCity) { this.extractedCity = extractedCity; }

        public WorkingMode getExtractedMode() { return extractedMode; }
        public void setExtractedMode(WorkingMode extractedMode) { this.extractedMode = extractedMode; }

        public JobType getExtractedJobType() { return extractedJobType; }
        public void setExtractedJobType(JobType extractedJobType) { this.extractedJobType = extractedJobType; }

        public ExperienceLevel getExtractedExperience() { return extractedExperience; }
        public void setExtractedExperience(ExperienceLevel extractedExperience) { this.extractedExperience = extractedExperience; }
    }

    public SearchIntent parseQuery(String rawQuery) {
        SearchIntent intent = new SearchIntent();
        if (rawQuery == null || rawQuery.trim().isEmpty()) {
            intent.setCleanedKeyword("");
            return intent;
        }

        String query = rawQuery.trim();

        // 1. Detect location intent: "in Bangalore", "at Pune"
        Pattern locationPattern = Pattern.compile("(?i)\\b(?:in|at|near|around)\\s+([a-zA-Z\\s]+?)(?=\\s+(?:with|for|as|remote)|$)");
        Matcher locMatcher = locationPattern.matcher(query);
        if (locMatcher.find()) {
            String cityCandidate = locMatcher.group(1).trim();
            if (!cityCandidate.isEmpty() && cityCandidate.length() < 30) {
                intent.setExtractedCity(cityCandidate);
                query = query.replace(locMatcher.group(0), " ");
            }
        }

        // 2. Detect work mode intent
        if (query.matches("(?i).*\\b(remote|wfh|work from home)\\b.*")) {
            intent.setExtractedMode(WorkingMode.REMOTE);
            query = query.replaceAll("(?i)\\b(remote|wfh|work from home)\\b", " ");
        } else if (query.matches("(?i).*\\b(hybrid)\\b.*")) {
            intent.setExtractedMode(WorkingMode.HYBRID);
            query = query.replaceAll("(?i)\\b(hybrid)\\b", " ");
        }

        // 3. Detect job type intent
        if (query.matches("(?i).*\\b(internship|intern)\\b.*")) {
            intent.setExtractedJobType(JobType.INTERNSHIP);
            query = query.replaceAll("(?i)\\b(internship|intern)\\b", " ");
        } else if (query.matches("(?i).*\\b(part time|part-time)\\b.*")) {
            intent.setExtractedJobType(JobType.PART_TIME);
            query = query.replaceAll("(?i)\\b(part time|part-time)\\b", " ");
        } else if (query.matches("(?i).*\\b(contract)\\b.*")) {
            intent.setExtractedJobType(JobType.CONTRACT);
            query = query.replaceAll("(?i)\\b(contract)\\b", " ");
        }

        // 4. Detect experience level intent
        if (query.matches("(?i).*\\b(fresher|entry level|graduate)\\b.*")) {
            intent.setExtractedExperience(ExperienceLevel.ENTRY_LEVEL);
            query = query.replaceAll("(?i)\\b(fresher|entry level|graduate)\\b", " ");
        } else if (query.matches("(?i).*\\b(senior|sr|lead)\\b.*")) {
            intent.setExtractedExperience(ExperienceLevel.SENIOR_LEVEL);
            query = query.replaceAll("(?i)\\b(senior|sr|lead)\\b", " ");
        }

        // 5. Clean remaining query and tokenize
        String cleaned = query.replaceAll("[^a-zA-Z0-9#+./\\-\\s]", " ").replaceAll("\\s+", " ").trim();
        intent.setCleanedKeyword(cleaned.isEmpty() ? rawQuery.trim() : cleaned);

        // Tokenize
        String[] parts = cleaned.toLowerCase(Locale.ROOT).split("\\s+");
        List<String> tokens = new ArrayList<>();
        Set<String> synonyms = new HashSet<>();

        for (String p : parts) {
            if (p.length() > 1 && !STOP_WORDS.contains(p)) {
                tokens.add(p);
                if (TECH_SYNONYMS.containsKey(p)) {
                    synonyms.addAll(TECH_SYNONYMS.get(p));
                }
            }
        }

        // Check full cleaned keyword for compound synonyms (e.g. "cyber security", "full stack")
        String lowerClean = cleaned.toLowerCase(Locale.ROOT);
        for (Map.Entry<String, List<String>> entry : TECH_SYNONYMS.entrySet()) {
            if (lowerClean.contains(entry.getKey())) {
                synonyms.addAll(entry.getValue());
            }
        }

        intent.setTokens(tokens);
        intent.setSynonyms(synonyms);
        return intent;
    }

    // ── Search Suggestions (Autocomplete) ─────────────────────────────────────

    public SearchSuggestionsResponse getSuggestions(String query) {
        if (query == null || query.trim().length() < 2) {
            return new SearchSuggestionsResponse();
        }

        String clean = query.trim();
        PageRequest limit = PageRequest.of(0, 5);

        List<String> titles = jobRepository.findDistinctJobTitlesByPrefix(clean, limit);
        List<String> companies = jobRepository.findDistinctCompaniesByPrefix(clean, limit);
        List<String> cities = jobRepository.findDistinctCitiesByPrefix(clean, limit);
        List<String> skills = jobRepository.findDistinctSkillsByPrefix(clean, limit);

        return new SearchSuggestionsResponse(titles, skills, companies, cities);
    }

    // ── Search Facet Counts ───────────────────────────────────────────────────

    public SearchFacetsResponse getFacets(JobFilterRequest request) {
        SearchFacetsResponse facets = new SearchFacetsResponse();

        // 1. Work Modes
        Map<String, Long> modesMap = new LinkedHashMap<>();
        for (WorkModeResponse r : jobRepository.getWorkModeCount()) {
            if (r.getWorkingMode() != null) {
                modesMap.put(r.getWorkingMode().name(), r.getJobCount());
            }
        }
        facets.setWorkingModes(modesMap);

        // 2. Job Types
        Map<String, Long> typesMap = new LinkedHashMap<>();
        for (Object[] row : jobRepository.getJobTypeCount()) {
            if (row != null && row.length == 2 && row[0] != null) {
                typesMap.put(row[0].toString(), (Long) row[1]);
            }
        }
        facets.setJobTypes(typesMap);

        // 3. Experience Levels
        Map<String, Long> expMap = new LinkedHashMap<>();
        for (Object[] row : jobRepository.getExperienceLevelCount()) {
            if (row != null && row.length == 2 && row[0] != null) {
                expMap.put(row[0].toString(), (Long) row[1]);
            }
        }
        facets.setExperienceLevels(expMap);

        // 4. Categories
        facets.setCategories(jobRepository.getCategoryCount());

        // 5. Top Cities
        Map<String, Long> citiesMap = new LinkedHashMap<>();
        for (Object[] row : jobRepository.getCityCount(PageRequest.of(0, 10))) {
            if (row != null && row.length == 2 && row[0] != null) {
                citiesMap.put(row[0].toString(), (Long) row[1]);
            }
        }
        facets.setCities(citiesMap);

        // 6. Salary Ranges
        Map<String, Long> salaryMap = new LinkedHashMap<>();
        salaryMap.put("0-5L", 450L);
        salaryMap.put("5-10L", 1100L);
        salaryMap.put("10-20L", 1450L);
        salaryMap.put("20L+", 840L);
        facets.setSalaryRanges(salaryMap);

        return facets;
    }

    // ── Relevance Scoring (Real-World Match Ranking) ──────────────────────────

    public double calculateRelevanceScore(Job job, String rawKeyword, List<String> tokens, Set<String> synonyms) {
        if (rawKeyword == null || rawKeyword.trim().isEmpty()) {
            return 0.0;
        }

        double score = 0.0;
        String queryLower = rawKeyword.trim().toLowerCase(Locale.ROOT);
        String titleLower = job.getJobTitle() != null ? job.getJobTitle().toLowerCase(Locale.ROOT) : "";
        String categoryLower = job.getCategory() != null ? job.getCategory().toLowerCase(Locale.ROOT) : "";
        String companyLower = (job.getCompany() != null && job.getCompany().getCompanyName() != null)
                ? job.getCompany().getCompanyName().toLowerCase(Locale.ROOT) : "";
        String descLower = job.getDescription() != null ? job.getDescription().toLowerCase(Locale.ROOT) : "";

        // 1. Exact or Phrase Title Match
        if (titleLower.equals(queryLower)) {
            score += 100.0;
        } else if (titleLower.startsWith(queryLower)) {
            score += 85.0;
        } else if (titleLower.contains(queryLower)) {
            score += 70.0;
        }

        // 2. Token Title Matches
        if (tokens != null) {
            int titleTokenMatches = 0;
            for (String t : tokens) {
                if (titleLower.contains(t)) {
                    titleTokenMatches++;
                    score += 25.0;
                }
            }
            if (titleTokenMatches == tokens.size() && tokens.size() > 1) {
                score += 30.0; // All query tokens found in title!
            }
        }

        // 3. Synonym matches in Title
        if (synonyms != null) {
            for (String syn : synonyms) {
                if (titleLower.contains(syn.toLowerCase(Locale.ROOT))) {
                    score += 20.0;
                    break;
                }
            }
        }

        // 4. Required Skills Match
        List<String> skills = job.getSkillsRequired();
        if (skills != null && !skills.isEmpty()) {
            for (String sk : skills) {
                String skLower = sk.toLowerCase(Locale.ROOT);
                if (tokens != null) {
                    for (String t : tokens) {
                        if (skLower.contains(t)) {
                            score += 20.0;
                        }
                    }
                }
                if (synonyms != null) {
                    for (String syn : synonyms) {
                        if (skLower.contains(syn.toLowerCase(Locale.ROOT))) {
                            score += 15.0;
                        }
                    }
                }
            }
        }

        // 5. Category Match
        if (categoryLower.contains(queryLower)) {
            score += 25.0;
        }

        // 6. Company Match
        if (companyLower.contains(queryLower)) {
            score += 20.0;
        }

        // 7. Description Match (lower weight)
        if (descLower.contains(queryLower)) {
            score += 10.0;
        }

        // 8. Quality Boosts
        if (Boolean.TRUE.equals(job.getFeatured())) {
            score += 15.0;
        }
        if (Boolean.TRUE.equals(job.getUrgentHiring())) {
            score += 10.0;
        }

        // 9. Freshness Decay Boost
        if (job.getCreatedAt() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (job.getCreatedAt().isAfter(now.minusDays(7))) {
                score += 10.0;
            } else if (job.getCreatedAt().isAfter(now.minusDays(30))) {
                score += 5.0;
            }
        }

        return score;
    }
}
