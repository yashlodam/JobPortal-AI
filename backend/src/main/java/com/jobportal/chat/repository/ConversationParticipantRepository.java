package com.jobportal.chat.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.jobportal.chat.entity.ConversationParticipant;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    /** Find participant record by conversation and user email. */
    @Query("SELECT cp FROM ConversationParticipant cp"
         + " WHERE cp.conversation.id = :cid AND cp.user.email = :email")
    Optional<ConversationParticipant> findByConversationIdAndUserEmail(
        @Param("cid") Long cid,
        @Param("email") String email
    );

    /** Find all participants of a conversation with user and profile eagerly loaded. */
    @Query("SELECT cp FROM ConversationParticipant cp"
         + " JOIN FETCH cp.user u"
         + " LEFT JOIN FETCH u.profile p"
         + " WHERE cp.conversation.id = :cid")
    List<ConversationParticipant> findAllByConversationId(@Param("cid") Long cid);

    /** Count unread messages for a user in one conversation. */
    @Query("SELECT COUNT(m) FROM Message m"
         + " JOIN ConversationParticipant cp"
         + "   ON cp.conversation.id = m.conversation.id AND cp.user.id = :uid"
         + " WHERE m.conversation.id = :cid"
         + "   AND m.sender.id != :uid"
         + "   AND m.deletedAt IS NULL"
         + "   AND (cp.lastReadAt IS NULL OR m.sentAt > cp.lastReadAt)")
    long countUnreadForParticipant(@Param("cid") Long cid, @Param("uid") Long uid);

    /** Count total unread across ALL conversations for a user (nav badge). */
    @Query("SELECT COALESCE(SUM("
         + "   (SELECT COUNT(m) FROM Message m"
         + "    WHERE m.conversation.id = cp.conversation.id"
         + "      AND m.sender.id != :uid"
         + "      AND m.deletedAt IS NULL"
         + "      AND (cp.lastReadAt IS NULL OR m.sentAt > cp.lastReadAt))"
         + "), 0)"
         + " FROM ConversationParticipant cp WHERE cp.user.id = :uid")
    long countTotalUnreadForUser(@Param("uid") Long uid);

    /** Mark conversation as read - update lastReadAt to now. */
    @Modifying
    @Query("UPDATE ConversationParticipant cp SET cp.lastReadAt = CURRENT_TIMESTAMP"
         + " WHERE cp.conversation.id = :cid AND cp.user.id = :uid")
    void markConversationAsRead(@Param("cid") Long cid, @Param("uid") Long uid);

    /** Update online flag for all conversations the user is part of. */
    @Modifying
    @Query("UPDATE ConversationParticipant cp SET cp.online = :online WHERE cp.user.id = :uid")
    void updateOnlineStatus(@Param("uid") Long uid, @Param("online") boolean online);

    /** Set lastSeenAt = now on disconnect. */
    @Modifying
    @Query("UPDATE ConversationParticipant cp SET cp.lastSeenAt = CURRENT_TIMESTAMP WHERE cp.user.id = :uid")
    void updateLastSeenAt(@Param("uid") Long uid);

    /** Find all participant rows for a user across all conversations. */
    @Query("SELECT cp FROM ConversationParticipant cp WHERE cp.user.id = :uid")
    List<ConversationParticipant> findAllByUserId(@Param("uid") Long uid);
}
