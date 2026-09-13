package com.jobportal.chat.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.jobportal.chat.dto.request.CreateConversationRequest;
import com.jobportal.chat.dto.response.ChatUnreadCountResponse;
import com.jobportal.chat.dto.response.ConversationResponse;
import com.jobportal.chat.dto.response.MessageResponse;
import com.jobportal.chat.entity.Conversation;
import com.jobportal.chat.entity.Message;
import com.jobportal.exception.JobPortalException;

public interface ChatService {

    /** Create or return existing conversation between authenticated user and another user. */
    ConversationResponse createOrGetConversation(CreateConversationRequest request, String currentUserEmail)
        throws JobPortalException;

    /** All conversations for the authenticated user, sorted by last activity. */
    List<ConversationResponse> getMyConversations(String currentUserEmail) throws JobPortalException;

    /** Single conversation detail - throws 403 if user is not a participant. */
    ConversationResponse getConversation(Long conversationId, String currentUserEmail)
        throws JobPortalException;

    /** Paginated messages for a conversation, newest first. */
    Page<MessageResponse> getMessages(Long conversationId, String currentUserEmail, Pageable pageable)
        throws JobPortalException;

    /** Mark all messages in a conversation as read for the authenticated user. */
    void markAsRead(Long conversationId, String currentUserEmail) throws JobPortalException;

    /** Total unread message count across all conversations. */
    ChatUnreadCountResponse getTotalUnreadCount(String currentUserEmail) throws JobPortalException;

    /** Soft-delete a message. Only the sender can delete their own message. */
    MessageResponse deleteMessage(Long conversationId, Long messageId, String currentUserEmail)
        throws JobPortalException;

    /** Internal: save a new message entity (called by WebSocket controller). */
    Message saveMessage(Long conversationId, String content, String senderEmail)
        throws JobPortalException;

    /** Internal: validate the user is a participant (throws 403 if not). */
    Conversation validateAndGetConversation(Long conversationId, String currentUserEmail)
        throws JobPortalException;
}
