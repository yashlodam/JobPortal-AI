package com.jobportal.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.jobportal.domain.AccountType;
import com.jobportal.entity.Profile;
import com.jobportal.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByProfileId(Long profileId);

    long countByAccountType(AccountType accountType);

    long countByIsActive(Boolean isActive);

    @Query("""
           SELECT u FROM User u
           WHERE (:accountType IS NULL OR u.accountType = :accountType)
             AND (:search IS NULL OR :search = ''
                  OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
           """)
    Page<User> searchUsers(
            @Param("accountType") AccountType accountType,
            @Param("search") String search,
            Pageable pageable);
}
