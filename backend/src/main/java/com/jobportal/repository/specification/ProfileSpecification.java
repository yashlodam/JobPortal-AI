package com.jobportal.repository.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.jobportal.domain.AccountType;
import com.jobportal.dto.request.TalentSearchRequest;
import com.jobportal.entity.Profile;
import com.jobportal.entity.User;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

/**
 * JPA Specification for dynamic Profile / Talent searches.
 */
public class ProfileSpecification {

    private ProfileSpecification() {}

    public static Specification<Profile> buildFrom(TalentSearchRequest request) {
        return (root, query, cb) -> {

            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            // ── Only APPLICANT candidates ───────────────────────────────────
            Join<Profile, User> userJoin = root.join("user", JoinType.INNER);
            predicates.add(cb.equal(userJoin.get("accountType"), AccountType.APPLICANT));
            predicates.add(cb.equal(userJoin.get("isActive"), true));

            if (request == null) {
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            // ── Keyword Search ───────────────────────────────────────────────
            if (hasText(request.getKeyword())) {
                String keyword = likePattern(request.getKeyword());

                List<Predicate> keywordPredicates = new ArrayList<>();
                keywordPredicates.add(cb.like(cb.lower(userJoin.get("name")), keyword));
                keywordPredicates.add(cb.like(cb.lower(root.get("headline")), keyword));
                keywordPredicates.add(cb.like(cb.lower(root.get("about")), keyword));
                keywordPredicates.add(cb.like(cb.lower(root.get("location")), keyword));
                keywordPredicates.add(cb.like(cb.lower(root.get("currentCompany")), keyword));

                // Also search in skills collection for keyword
                Join<Profile, String> skillsJoin = root.join("skills", JoinType.LEFT);
                keywordPredicates.add(cb.like(cb.lower(skillsJoin), keyword));

                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
            }

            // ── Single Skill Filter ──────────────────────────────────────────
            if (hasText(request.getSkill())) {
                Join<Profile, String> skillJoin = root.join("skills", JoinType.INNER);
                predicates.add(cb.equal(cb.lower(skillJoin), request.getSkill().trim().toLowerCase()));
            }

            // ── Multiple Skills Filter ──────────────────────────────────────
            if (request.getSkills() != null && !request.getSkills().isEmpty()) {
                List<String> normalizedSkills = request.getSkills().stream()
                        .filter(ProfileSpecification::hasText)
                        .map(s -> s.trim().toLowerCase())
                        .toList();

                if (!normalizedSkills.isEmpty()) {
                    Join<Profile, String> skillsJoin = root.join("skills", JoinType.INNER);
                    predicates.add(cb.lower(skillsJoin).in(normalizedSkills));
                }
            }

            // ── Experience Level ─────────────────────────────────────────────
            if (request.getExperienceLevel() != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), request.getExperienceLevel()));
            }

            // ── Availability ─────────────────────────────────────────────────
            if (request.getAvailability() != null) {
                predicates.add(cb.equal(root.get("availability"), request.getAvailability()));
            }

            // ── Location ─────────────────────────────────────────────────────
            if (hasText(request.getLocation())) {
                predicates.add(cb.like(cb.lower(root.get("location")), likePattern(request.getLocation())));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String likePattern(String value) {
        return "%" + value.trim().toLowerCase() + "%";
    }
}
