package com.jobportal.chat.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jobportal.chat.dto.request.CreateConversationRequest;
import com.jobportal.chat.dto.response.ChatUnreadCountResponse;
import com.jobportal.chat.dto.response.ConversationResponse;
import com.jobportal.chat.dto.response.MessageResponse;
import com.jobportal.chat.entity.Conversation;
import com.jobportal.chat.entity.ConversationParticipant;
import com.jobportal.chat.entity.Message;
import com.jobportal.chat.mapper.ChatMapper;
import com.jobportal.chat.repository.ConversationParticipantRepository;
import com.jobportal.chat.repository.ConversationRepository;
import com.jobportal.chat.repository.MessageRepository;
import com.jobportal.domain.AccountType;
import com.jobportal.domain.RecruiterStatus;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Recruiter;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.UserRepository;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final RecruiterRepository recruiterRepository;
    private final ChatMapper chatMapper;
    private final ApplicationEventPublisher eventPublisher;

    public ChatServiceImpl(
            ConversationRepository conversationRepository,
            ConversationParticipantRepository participantRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            JobApplicationRepository jobApplicationRepository,
            RecruiterRepository recruiterRepository,
            ChatMapper chatMapper,
            ApplicationEventPublisher eventPublisher) {
        this.conversationRepository = conversationRepository;
        this.participantRepository  = participantRepository;
        this.messageRepository      = messageRepository;
        this.userRepository         = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.recruiterRepository    = recruiterRepository;
        this.chatMapper             = chatMapper;
        this.eventPublisher         = eventPublisher;
    }

    // ── Create / Get Conversation ────────────────────────────────────────

    @Override
    public ConversationResponse createOrGetConversation(
            CreateConversationRequest request, String currentUserEmail) throws JobPortalException {

        User me = findUserByEmail(currentUserEmail);
        User other = userRepository.findById(request.getParticipantId())
            .orElseThrow(() -> JobPortalException.notFound("User not found: " + request.getParticipantId()));

        if (me.getId().equals(other.getId())) {
            throw JobPortalException.badRequest("You cannot start a conversation with yourself.");
        }

        // ── Rule: Block suspended users immediately ───────────────────────────
        validateNotSuspended(me);
        validateNotSuspended(other);

        // Idempotency: return existing conversation if one exists between these two users
        // PENDING/REJECTED recruiters ARE permitted to continue existing conversations
        return conversationRepository.findByParticipantPair(me.getId(), other.getId())
            .map(existing -> {
                log.debug("Returning existing conversation id=[{}] for users [{},{}]",
                    existing.getId(), me.getEmail(), other.getEmail());
                return chatMapper.toConversationResponse(existing, currentUserEmail);
            })
            .orElseGet(() -> {
                // ── SECURITY GATE: Only APPROVED recruiters can START new conversations ──
                if (me.getAccountType() == AccountType.EMPLOYER) {
                    Recruiter recruiter = recruiterRepository.findByUser(me).orElse(null);
                    if (recruiter == null || recruiter.getStatus() != RecruiterStatus.APPROVED) {
                        RecruiterStatus status = (recruiter != null) ? recruiter.getStatus() : RecruiterStatus.PENDING_VERIFICATION;
                        throw JobPortalException.forbidden(
                            "Your recruiter account is currently " + status + ". "
                            + "Only APPROVED recruiters can initiate new conversations.");
                    }
                }

                Conversation conv = new Conversation();
                conv.setTitle(buildTitle(request, me, other));

                if (request.getJobApplicationId() != null) {
                    jobApplicationRepository.findById(request.getJobApplicationId())
                        .ifPresent(conv::setJobApplication);
                }

                Conversation saved = conversationRepository.save(conv);

                ConversationParticipant p1 = new ConversationParticipant(saved, me);
                ConversationParticipant p2 = new ConversationParticipant(saved, other);
                participantRepository.save(p1);
                participantRepository.save(p2);

                log.info("Created conversation id=[{}] between [{}] and [{}]",
                    saved.getId(), me.getEmail(), other.getEmail());
                return chatMapper.toConversationResponse(saved, currentUserEmail);
            });
    }

    // ── Read Conversations ───────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getMyConversations(String currentUserEmail) throws JobPortalException {
        List<Conversation> conversations = conversationRepository.findAllByUserEmail(currentUserEmail);
        return conversations.stream()
            .map(c -> chatMapper.toConversationResponse(c, currentUserEmail))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationResponse getConversation(Long conversationId, String currentUserEmail)
            throws JobPortalException {
        Conversation conv = validateAndGetConversation(conversationId, currentUserEmail);
        return chatMapper.toConversationResponse(conv, currentUserEmail);
    }

    // ── Messages ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(
            Long conversationId, String currentUserEmail, Pageable pageable) throws JobPortalException {
        validateAndGetConversation(conversationId, currentUserEmail);
        Pageable sorted = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by("sentAt").descending()
        );
        return messageRepository.findByConversationId(conversationId, sorted)
            .map(chatMapper::toMessageResponse);
    }

    @Override
    public Message saveMessage(Long conversationId, String content, String senderEmail)
            throws JobPortalException {
        Conversation conv = validateAndGetConversation(conversationId, senderEmail);
        User sender = findUserByEmail(senderEmail);

        Message msg = new Message();
        msg.setConversation(conv);
        msg.setSender(sender);
        msg.setContent(content.trim());
        msg.setSentAt(LocalDateTime.now());
        Message saved = messageRepository.save(msg);

        // Update denormalised lastMessageAt on conversation
        conv.setLastMessageAt(saved.getSentAt());
        conversationRepository.save(conv);

        log.debug("Message id=[{}] saved in conversation id=[{}] by [{}]",
            saved.getId(), conversationId, senderEmail);
        return saved;
    }

    @Override
    public MessageResponse deleteMessage(
            Long conversationId, Long messageId, String currentUserEmail) throws JobPortalException {
        validateAndGetConversation(conversationId, currentUserEmail);

        Message msg = messageRepository.findByIdAndConversationId(messageId, conversationId)
            .orElseThrow(() -> JobPortalException.notFound("Message not found: " + messageId));

        if (!msg.getSender().getEmail().equals(currentUserEmail)) {
            throw JobPortalException.forbidden("You can only delete your own messages.");
        }
        if (msg.isDeleted()) {
            throw JobPortalException.badRequest("Message is already deleted.");
        }

        msg.setDeletedAt(LocalDateTime.now());
        Message saved = messageRepository.save(msg);
        log.info("Message id=[{}] soft-deleted by [{}]", messageId, currentUserEmail);
        return chatMapper.toMessageResponse(saved);
    }

    // ── Read Receipts & Unread ───────────────────────────────────────────

    @Override
    public void markAsRead(Long conversationId, String currentUserEmail) throws JobPortalException {
        User me = findUserByEmail(currentUserEmail);
        if (!conversationRepository.isParticipant(conversationId, currentUserEmail)) {
            throw JobPortalException.forbidden("Access denied to conversation: " + conversationId);
        }
        participantRepository.markConversationAsRead(conversationId, me.getId());
        log.debug("Conversation id=[{}] marked as read by [{}]", conversationId, currentUserEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatUnreadCountResponse getTotalUnreadCount(String currentUserEmail) throws JobPortalException {
        User me = findUserByEmail(currentUserEmail);
        long total = participantRepository.countTotalUnreadForUser(me.getId());
        return new ChatUnreadCountResponse(total);
    }

    // ── Internal helpers ─────────────────────────────────────────────────

    @Override
    public Conversation validateAndGetConversation(Long conversationId, String currentUserEmail)
            throws JobPortalException {
        User user = findUserByEmail(currentUserEmail);
        validateNotSuspended(user);

        return conversationRepository.findByIdAndParticipantEmail(conversationId, currentUserEmail)
            .orElseThrow(() -> JobPortalException.forbidden(
                "You do not have access to conversation: " + conversationId));
    }

    private void validateNotSuspended(User user) throws JobPortalException {
        if (user != null && user.getAccountType() == AccountType.EMPLOYER) {
            recruiterRepository.findByUser(user).ifPresent(recruiter -> {
                if (recruiter.getStatus() == RecruiterStatus.SUSPENDED) {
                    throw JobPortalException.forbidden("Your recruiter account is suspended. Chat functionality is disabled.");
                }
            });
        }
    }

    private User findUserByEmail(String email) throws JobPortalException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> JobPortalException.notFound("User not found: " + email));
    }

    private String buildTitle(CreateConversationRequest req, User me, User other) {
        if (req.getTitle() != null && !req.getTitle().isBlank()) return req.getTitle().trim();
        return me.getName() + " & " + other.getName();
    }
}
