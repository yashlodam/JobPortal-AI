package com.jobportal.repository.specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.data.jpa.domain.Specification;

import com.jobportal.domain.ExperienceLevel;
import com.jobportal.domain.JobStatus;
import com.jobportal.domain.JobType;
import com.jobportal.domain.WorkingMode;
import com.jobportal.dto.request.JobFilterRequest;
import com.jobportal.entity.Company;
import com.jobportal.entity.Job;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;

public class JobSpecification {

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "an", "the", "and", "or", "in", "at", "for", "with", "to", "of",
            "jobs", "job", "hiring", "openings", "opening", "looking", "needed"
    ));

    private JobSpecification() {
    }

    public static Specification<Job> buildFrom(JobFilterRequest request) {

        return (root, query, cb) -> {

            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            // --------------------------------------------------------
            // 1. Only OPEN jobs
            // --------------------------------------------------------
            predicates.add(cb.equal(root.get("status"), JobStatus.OPEN));

            // Join company once if needed
            Join<Job, Company> companyJoin = root.join("company", JoinType.LEFT);

            // --------------------------------------------------------
            // 2. Intelligent Multi-Term & Tokenized Keyword Search
            // --------------------------------------------------------
            if (hasText(request.getKeyword())) {

                String rawKeyword = request.getKeyword().trim();
                String fullKeywordPattern = likePattern(rawKeyword);

                // Extract individual tokens
                String[] rawTokens = rawKeyword.toLowerCase(Locale.ROOT)
                        .replaceAll("[^a-zA-Z0-9#+./\\-\\s]", " ")
                        .split("\\s+");

                List<String> meaningfulTokens = new ArrayList<>();
                for (String t : rawTokens) {
                    if (t.length() > 1 && !STOP_WORDS.contains(t)) {
                        meaningfulTokens.add(t);
                    }
                }

                List<Predicate> tokenPredicates = new ArrayList<>();

                if (meaningfulTokens.size() > 1) {
                    // Multi-word query: every token must match somewhere in the job (AND conjunction)
                    for (String token : meaningfulTokens) {
                        tokenPredicates.add(buildSingleTermPredicate(token, root, query, cb, companyJoin));
                    }
                    // Also reward full phrase match
                    Predicate allTokensMatch = cb.and(tokenPredicates.toArray(new Predicate[0]));
                    Predicate phraseMatch = cb.or(
                            cb.like(cb.lower(root.get("jobTitle")), fullKeywordPattern),
                            cb.like(cb.lower(root.get("category")), fullKeywordPattern),
                            cb.like(cb.lower(companyJoin.get("companyName")), fullKeywordPattern)
                    );
                    predicates.add(cb.or(allTokensMatch, phraseMatch));

                } else {
                    // Single term or phrase
                    String termToSearch = meaningfulTokens.isEmpty() ? rawKeyword : meaningfulTokens.get(0);
                    predicates.add(buildSingleTermPredicate(termToSearch, root, query, cb, companyJoin));
                }
            }

            // --------------------------------------------------------
            // 3. Category Filter (supports multi-select)
            // --------------------------------------------------------
            List<String> categories = request.getCategories();
            if (categories != null && !categories.isEmpty()) {
                List<Predicate> catPreds = new ArrayList<>();
                for (String cat : categories) {
                    if (hasText(cat)) {
                        catPreds.add(cb.like(cb.lower(root.get("category")), likePattern(cat)));
                    }
                }
                if (!catPreds.isEmpty()) {
                    predicates.add(cb.or(catPreds.toArray(new Predicate[0])));
                }
            }

            // --------------------------------------------------------
            // 4. Company Name Filter
            // --------------------------------------------------------
            if (hasText(request.getCompanyName())) {
                predicates.add(cb.like(cb.lower(companyJoin.get("companyName")), likePattern(request.getCompanyName())));
            }

            // --------------------------------------------------------
            // 5. Location (City / State / Country) + Remote Intent Handling
            // --------------------------------------------------------
            List<String> cities = request.getCities();
            if (cities != null && !cities.isEmpty()) {
                List<Predicate> cityPreds = new ArrayList<>();
                for (String city : cities) {
                    if (hasText(city)) {
                        String cleanCity = city.trim().toLowerCase(Locale.ROOT);
                        if ("remote".equals(cleanCity) || "wfh".equals(cleanCity)) {
                            cityPreds.add(cb.equal(root.get("workingMode"), WorkingMode.REMOTE));
                        } else {
                            cityPreds.add(cb.like(cb.lower(root.get("city")), likePattern(city)));
                        }
                    }
                }
                if (!cityPreds.isEmpty()) {
                    predicates.add(cb.or(cityPreds.toArray(new Predicate[0])));
                }
            }

            if (hasText(request.getState())) {
                predicates.add(cb.like(cb.lower(root.get("state")), likePattern(request.getState())));
            }

            if (hasText(request.getCountry())) {
                predicates.add(cb.like(cb.lower(root.get("country")), likePattern(request.getCountry())));
            }

            // --------------------------------------------------------
            // 6. Job Type (Multi-Select Support)
            // --------------------------------------------------------
            List<JobType> jobTypes = request.getJobTypes();
            if (jobTypes != null && !jobTypes.isEmpty()) {
                predicates.add(root.get("jobType").in(jobTypes));
            }

            // --------------------------------------------------------
            // 7. Working Mode (Multi-Select Support & ONSITE / ON_SITE normalization)
            // --------------------------------------------------------
            List<WorkingMode> workingModes = request.getWorkingModes();
            if (workingModes != null && !workingModes.isEmpty()) {
                Set<WorkingMode> resolvedModes = new HashSet<>(workingModes);
                if (workingModes.contains(WorkingMode.ONSITE) || workingModes.contains(WorkingMode.ON_SITE)) {
                    resolvedModes.add(WorkingMode.ONSITE);
                    resolvedModes.add(WorkingMode.ON_SITE);
                }
                predicates.add(root.get("workingMode").in(resolvedModes));
            }

            // --------------------------------------------------------
            // 8. Experience Level (Multi-Select Support)
            // --------------------------------------------------------
            List<ExperienceLevel> experienceLevels = request.getExperienceLevels();
            if (experienceLevels != null && !experienceLevels.isEmpty()) {
                predicates.add(root.get("experienceLevel").in(experienceLevels));
            }

            // --------------------------------------------------------
            // 9. Experience Range (Years)
            // --------------------------------------------------------
            if (request.getMinimumExperience() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("minimumExperience"), request.getMinimumExperience()));
            }

            if (request.getMaximumExperience() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("maximumExperience"), request.getMaximumExperience()));
            }

            // --------------------------------------------------------
            // 10. Salary Range Overlap (Senior-Level Real-World Fix)
            // If candidate seeks min 10L, jobs with max >= 10L match!
            // If candidate seeks max 20L, jobs with min <= 20L match!
            // --------------------------------------------------------
            if (request.getMinimumSalary() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        cb.coalesce(root.get("maximumSalary"), root.get("minimumSalary")),
                        request.getMinimumSalary()
                ));
            }

            if (request.getMaximumSalary() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        cb.coalesce(root.get("minimumSalary"), root.get("maximumSalary")),
                        request.getMaximumSalary()
                ));
            }

            // --------------------------------------------------------
            // 11. Skills Filter
            // --------------------------------------------------------
            if (request.getSkills() != null && !request.getSkills().isEmpty()) {
                for (String skill : request.getSkills()) {
                    if (hasText(skill)) {
                        Subquery<Long> subQuery = query.subquery(Long.class);
                        var jobSub = subQuery.from(Job.class);
                        Expression<String> skillExpression = jobSub.join("skillsRequired").as(String.class);
                        subQuery.select(cb.literal(1L));
                        subQuery.where(
                                cb.equal(jobSub.get("id"), root.get("id")),
                                cb.like(cb.lower(skillExpression), likePattern(skill))
                        );
                        predicates.add(cb.exists(subQuery));
                    }
                }
            }

            // --------------------------------------------------------
            // 12. Qualification
            // --------------------------------------------------------
            if (hasText(request.getQualification())) {
                predicates.add(cb.like(cb.lower(root.get("qualification")), likePattern(request.getQualification())));
            }

            // --------------------------------------------------------
            // 13. Metadata Flags
            // --------------------------------------------------------
            if (Boolean.TRUE.equals(request.getFeatured())) {
                predicates.add(cb.isTrue(root.get("featured")));
            }

            if (Boolean.TRUE.equals(request.getUrgentHiring())) {
                predicates.add(cb.isTrue(root.get("urgentHiring")));
            }

            if (Boolean.TRUE.equals(request.getEasyApply())) {
                predicates.add(cb.isTrue(root.get("easyApply")));
            }

            // --------------------------------------------------------
            // 14. Freshness / Date Posted Filter
            // --------------------------------------------------------
            if (request.getPostedWithinDays() != null && request.getPostedWithinDays() > 0) {
                LocalDateTime threshold = LocalDateTime.now().minusDays(request.getPostedWithinDays());
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), threshold));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static Predicate buildSingleTermPredicate(
            String term,
            jakarta.persistence.criteria.Root<Job> root,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            Join<Job, Company> companyJoin) {

        String pattern = likePattern(term);
        List<Predicate> orPreds = new ArrayList<>();

        orPreds.add(cb.like(cb.lower(root.get("jobTitle")), pattern));
        orPreds.add(cb.like(cb.lower(root.get("category")), pattern));
        orPreds.add(cb.like(cb.lower(root.get("description")), pattern));
        orPreds.add(cb.like(cb.lower(root.get("requirements")), pattern));
        orPreds.add(cb.like(cb.lower(root.get("responsibilities")), pattern));
        orPreds.add(cb.like(cb.lower(root.get("aboutRole")), pattern));
        orPreds.add(cb.like(cb.lower(root.get("city")), pattern));
        orPreds.add(cb.like(cb.lower(companyJoin.get("companyName")), pattern));

        // Required Skills Subquery
        Subquery<Long> requiredSkillQuery = query.subquery(Long.class);
        var reqJob = requiredSkillQuery.from(Job.class);
        Expression<String> reqSkill = reqJob.join("skillsRequired").as(String.class);
        requiredSkillQuery.select(cb.literal(1L));
        requiredSkillQuery.where(
                cb.equal(reqJob.get("id"), root.get("id")),
                cb.like(cb.lower(reqSkill), pattern)
        );
        orPreds.add(cb.exists(requiredSkillQuery));

        // Preferred Skills Subquery
        Subquery<Long> preferredSkillQuery = query.subquery(Long.class);
        var prefJob = preferredSkillQuery.from(Job.class);
        Expression<String> prefSkill = prefJob.join("preferredSkills").as(String.class);
        preferredSkillQuery.select(cb.literal(1L));
        preferredSkillQuery.where(
                cb.equal(prefJob.get("id"), root.get("id")),
                cb.like(cb.lower(prefSkill), pattern)
        );
        orPreds.add(cb.exists(preferredSkillQuery));

        return cb.or(orPreds.toArray(new Predicate[0]));
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String likePattern(String value) {
        return "%" + value.trim().toLowerCase(Locale.ROOT) + "%";
    }
}
