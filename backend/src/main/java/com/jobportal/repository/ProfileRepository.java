package com.jobportal.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.entity.Profile;

/**
 * Profile repository.
 *
 * <h3>Loading Strategy</h3>
 * <p>Two distinct query methods serve two distinct purposes:</p>

 * <ol>
 *   <li>{@link #findByUserEmail} — lightweight, no joins. Used exclusively
 *       for write (mutation) paths where only scalar fields are needed.</li>
 *   <li>{@link #findByUserEmailWithDetails} — loads every association that
 *       {@code ProfileResponse} needs via a single set of efficient queries.
 *       Used in every code path that calls {@code toResponse()}.</li>
 * </ol>
 */
public interface ProfileRepository
        extends JpaRepository<Profile, Long>, JpaSpecificationExecutor<Profile> {

    /**
     * Lightweight lookup — no joins, scalar fields only.
     * Use this in write paths when you only need to mutate and save.
     */
    @Query("SELECT p FROM Profile p JOIN p.user u WHERE u.email = :email")
    Optional<Profile> findByUserEmail(@Param("email") String email);

    /**
     * Full-detail lookup — loads every association needed by ProfileResponse.
     */
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT p FROM Profile p JOIN p.user u WHERE u.email = :email")
    Optional<Profile> findByUserEmailWithDetails(@Param("email") String email);

    /** Lookup by user PK — used in registration flow. */
    @EntityGraph(attributePaths = {"user"})
    Optional<Profile> findByUserId(Long userId);

    /** Full-detail lookup by profile ID. */
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT p FROM Profile p WHERE p.id = :id")
    Optional<Profile> findByIdWithDetails(@Param("id") Long id);
}
