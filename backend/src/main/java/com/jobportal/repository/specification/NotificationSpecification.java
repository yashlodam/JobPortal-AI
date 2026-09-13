package com.jobportal.repository.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.jobportal.dto.request.NotificationFilterRequest;
import com.jobportal.entity.Notification;

import jakarta.persistence.criteria.Predicate;

/**
 * JPA Specification builder for composable, scalable Notification filtering.
 *
 * <h3>Ownership scoping</h3>
 * <p>Every specification produced here includes a predicate on
 * {@code recipient.id = userId}. This ensures that no query can ever return
 * notifications belonging to a different user — defense in depth against IDOR.</p>
 *
 * <h3>Archive default</h3>
 * <p>Unless {@code filter.getArchived()} is explicitly set to {@code true},
 * archived notifications are excluded from results. This mirrors the behaviour
 * of LinkedIn, GitHub, and Slack notification feeds.</p>
 *
 * <h3>@EntityGraph note</h3>
 * <p>{@code @EntityGraph} does NOT apply to {@code JpaSpecificationExecutor.findAll}.
 * The {@code toResponse()} mapper only accesses scalar fields on the entity —
 * it never touches {@code notification.getRecipient()} — so there is zero N+1 risk.</p>
 */
public class NotificationSpecification {

    private NotificationSpecification() {}

    /**
     * Builds a composed AND predicate from the provided filter.
     * The userId predicate is always included.
     *
     * @param userId the authenticated user's ID (never null)
     * @param filter the filter criteria (never null; absent fields = no predicate)
     * @return composed {@code Specification<Notification>}
     */
    public static Specification<Notification> buildFrom(Long userId, NotificationFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ── Always scope to the authenticated user ────────────────────────
            predicates.add(cb.equal(root.get("recipient").get("id"), userId));

            // ── Archive visibility — default: active (non-archived) only ──────
            if (filter.getArchived() == null || !filter.getArchived()) {
                predicates.add(cb.isFalse(root.get("archived")));
            } else {
                predicates.add(cb.isTrue(root.get("archived")));
            }

            // ── Keyword (title OR message — case-insensitive LIKE) ────────────
            if (hasText(filter.getKeyword())) {
                String pattern = "%" + filter.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")),   pattern),
                        cb.like(cb.lower(root.get("message")), pattern)
                ));
            }

            // ── Notification type ─────────────────────────────────────────────
            if (filter.getType() != null) {
                predicates.add(cb.equal(root.get("type"), filter.getType()));
            }

            // ── Priority ─────────────────────────────────────────────────────
            if (filter.getPriority() != null) {
                predicates.add(cb.equal(root.get("priority"), filter.getPriority()));
            }

            // ── Read status ───────────────────────────────────────────────────
            if (filter.getRead() != null) {
                predicates.add(cb.equal(root.get("read"), filter.getRead()));
            }

            // ── Date range ────────────────────────────────────────────────────
            if (filter.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getFromDate()));
            }
            if (filter.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getToDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
