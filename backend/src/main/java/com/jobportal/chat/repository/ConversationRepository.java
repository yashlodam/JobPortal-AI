package com.jobportal.chat.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.jobportal.chat.entity.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /** Find existing 1-to-1 conversation between two users (duplicate prevention). */
    @Query("SELECT c FROM Conversation c"
         + " WHERE c.id IN (SELECT cp1.conversation.id FROM ConversationParticipant cp1 WHERE cp1.user.id = :uid1)"
         + " AND   c.id IN (SELECT cp2.conversation.id FROM ConversationParticipant cp2 WHERE cp2.user.id = :uid2)")
    Optional<Conversation> findByParticipantPair(
        @Param("uid1") Long uid1,
        @Param("uid2") Long uid2
    );

    /** All conversations for a user sorted by most recent activity. */
    @Query("SELECT DISTINCT c FROM Conversation c"
         + " JOIN c.participants cp"
         + " WHERE cp.user.email = :email"
         + " ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findAllByUserEmail(@Param("email") String email);

    /** Load conversation only if the requesting user is a participant (security check). */
    @Query("SELECT c FROM Conversation c"
         + " JOIN c.participants cp"
         + " WHERE c.id = :cid AND cp.user.email = :email")
    Optional<Conversation> findByIdAndParticipantEmail(
        @Param("cid") Long cid,
        @Param("email") String email
    );

    /** Lightweight participant check. */
    @Query("SELECT COUNT(cp) > 0 FROM ConversationParticipant cp"
         + " WHERE cp.conversation.id = :cid AND cp.user.email = :email")
    boolean isParticipant(@Param("cid") Long cid, @Param("email") String email);

    /** Detach job application from conversation before deletion (ON DELETE SET NULL). */
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Conversation c SET c.jobApplication = null WHERE c.jobApplication.id = :applicationId")
    void detachJobApplication(@Param("applicationId") Long applicationId);

    /**
     * Bulk detach: null-out all conversation.jobApplication references for every
     * application that belongs to the given job. Called before a job is deleted so
     * the cascade delete on job_applications does not violate the FK from conversations.
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Conversation c SET c.jobApplication = null WHERE c.jobApplication.id IN " +
           "(SELECT a.id FROM JobApplication a WHERE a.job.id = :jobId)")
    void detachAllJobApplicationsForJob(@Param("jobId") Long jobId);
}
