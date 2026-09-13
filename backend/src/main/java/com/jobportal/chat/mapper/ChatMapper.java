package com.jobportal.chat.mapper;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import com.jobportal.chat.dto.response.ConversationParticipantResponse;
import com.jobportal.chat.dto.response.ConversationResponse;
import com.jobportal.chat.dto.response.MessageResponse;
import com.jobportal.chat.dto.response.SenderResponse;
import com.jobportal.chat.entity.Conversation;
import com.jobportal.chat.entity.ConversationParticipant;
import com.jobportal.chat.entity.Message;
import com.jobportal.chat.repository.ConversationParticipantRepository;
import com.jobportal.chat.repository.MessageRepository;
import com.jobportal.entity.Profile;
import com.jobportal.entity.User;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Converts chat entities to response DTOs.
 * Kept as a Spring component (not a static utility) so repositories
 * can be injected for lazy-loading derived fields like unreadCount and lastMessage.
 */
@Component
public class ChatMapper {

    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;

    public ChatMapper(ConversationParticipantRepository participantRepository,
                      MessageRepository messageRepository) {
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
    }

    // ── User / Sender ────────────────────────────────────────────────────

    public SenderResponse toSenderResponse(User user) {
        if (user == null) return null;
        Profile profile = user.getProfile();
        return new SenderResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            profile != null ? profile.getProfileImage() : null,
            user.getAccountType() != null ? user.getAccountType().name() : null
        );
    }

    // ── Message ──────────────────────────────────────────────────────────

    public MessageResponse toMessageResponse(Message msg) {
        if (msg == null) return null;
        MessageResponse r = new MessageResponse();
        r.setId(msg.getId());
        r.setConversationId(msg.getConversation().getId());
        r.setSender(toSenderResponse(msg.getSender()));
        r.setContent(msg.isDeleted() ? "This message was deleted." : msg.getContent());
        r.setMessageType(msg.getMessageType());
        r.setSentAt(msg.getSentAt());
        r.setEditedAt(msg.getEditedAt());
        r.setDeleted(msg.isDeleted());
        r.setEdited(msg.isEdited());
        return r;
    }

    // ── Participant ──────────────────────────────────────────────────────

    public ConversationParticipantResponse toParticipantResponse(
            ConversationParticipant cp, long unreadCount) {
        ConversationParticipantResponse r = new ConversationParticipantResponse();
        r.setId(cp.getId());
        r.setUser(toSenderResponse(cp.getUser()));
        r.setJoinedAt(cp.getJoinedAt());
        r.setLastReadAt(cp.getLastReadAt());
        r.setOnline(cp.isOnline());
        r.setLastSeenAt(cp.getLastSeenAt());
        r.setUnreadCount(unreadCount);
        return r;
    }

    // ── Conversation ─────────────────────────────────────────────────────

    /**
     * Build a full ConversationResponse for a given authenticated user (by email).
     * Loads participants, unread counts, and last message.
     */
    public ConversationResponse toConversationResponse(Conversation conv, String currentUserEmail) {
        ConversationResponse r = new ConversationResponse();
        r.setId(conv.getId());
        r.setTitle(conv.getTitle());
        r.setStatus(conv.getStatus());
        r.setLastMessageAt(conv.getLastMessageAt());
        r.setCreatedAt(conv.getCreatedAt());

        if (conv.getJobApplication() != null) {
            r.setJobApplicationId(conv.getJobApplication().getId());
            if (conv.getJobApplication().getJob() != null) {
                r.setJobTitle(conv.getJobApplication().getJob().getJobTitle());
            }
        }

        // Load participants with unread counts
        List<ConversationParticipant> participants =
            participantRepository.findAllByConversationId(conv.getId());

        List<ConversationParticipantResponse> participantResponses = participants.stream()
            .map(cp -> {
                long unread = participantRepository.countUnreadForParticipant(
                    conv.getId(), cp.getUser().getId());
                return toParticipantResponse(cp, unread);
            })
            .collect(Collectors.toList());
        r.setParticipants(participantResponses);

        // Set myUnreadCount and otherParticipant
        for (ConversationParticipant cp : participants) {
            if (cp.getUser().getEmail().equals(currentUserEmail)) {
                long myUnread = participantRepository.countUnreadForParticipant(
                    conv.getId(), cp.getUser().getId());
                r.setMyUnreadCount(myUnread);
            } else {
                long otherUnread = participantRepository.countUnreadForParticipant(
                    conv.getId(), cp.getUser().getId());
                r.setOtherParticipant(toParticipantResponse(cp, otherUnread));
            }
        }

        // Load last message preview
        var lastMsgPage = messageRepository.findLatestByConversationId(
            conv.getId(), PageRequest.of(0, 1));
        if (!lastMsgPage.isEmpty()) {
            r.setLastMessage(toMessageResponse(lastMsgPage.getContent().get(0)));
        }

        return r;
    }
}
