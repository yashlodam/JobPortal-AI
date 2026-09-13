package com.jobportal.chat.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.jobportal.chat.entity.Message;

/**
 * Pagination design: load messages with sentAt DESC.
 * page=0, size=30 = 30 newest. page=1 = next 30 older (scroll-up).
 * Frontend reverses the list to display newest at bottom.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Paginated messages for a conversation, newest first.
     * JOIN FETCH sender + profile avoids N+1 when building MessageResponse.
     * Caller: PageRequest.of(page, size, Sort.by("sentAt").descending())
     */
    @Query(value = "SELECT m FROM Message m"
                 + " JOIN FETCH m.sender s"
                 + " LEFT JOIN FETCH s.profile p"
                 + " WHERE m.conversation.id = :cid",
           countQuery = "SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :cid")
    Page<Message> findByConversationId(@Param("cid") Long cid, Pageable pageable);

    /**
     * Find a specific message in a specific conversation.
     * Security: ensures the message belongs to the conversation before delete/edit.
     */
    @Query("SELECT m FROM Message m JOIN FETCH m.sender"
         + " WHERE m.id = :mid AND m.conversation.id = :cid")
    Optional<Message> findByIdAndConversationId(
        @Param("mid") Long mid,
        @Param("cid") Long cid
    );

    /**
     * Fetch the single latest non-deleted message for conversation-list preview.
     * Caller should use: PageRequest.of(0, 1) to get exactly one result.
     */
    @Query("SELECT m FROM Message m JOIN FETCH m.sender"
         + " WHERE m.conversation.id = :cid AND m.deletedAt IS NULL"
         + " ORDER BY m.sentAt DESC")
    Page<Message> findLatestByConversationId(@Param("cid") Long cid, Pageable pageable);
}
