/**
 * src/api/chatApi.js
 *
 * REST API client for the Chat Module.
 * Base URL: http://localhost:8080/api/chat
 * All requests auto-attach JWT via the shared `api` Axios instance.
 */

import { api } from "../config/Api";
import { searchTalent } from "./talentApi";

/**
 * Create or get an existing conversation with a participant.
 * POST /chat/conversations
 * Idempotent — returns existing conversation if one already exists.
 */
export const createOrGetConversationApi = async (participantId, jobApplicationId = null) => {
  const numericParticipantId = Number(participantId);
  const body = {
    participantId: !isNaN(numericParticipantId) && numericParticipantId > 0 ? numericParticipantId : participantId,
  };
  if (jobApplicationId && !isNaN(Number(jobApplicationId)) && Number(jobApplicationId) > 0) {
    body.jobApplicationId = Number(jobApplicationId);
  }
  const response = await api.post("/chat/conversations", body);
  return response.data?.data ?? response.data;
};

/**
 * Send a message via REST API.
 * POST /chat/conversations/{id}/messages
 * Guaranteed delivery even if WebSocket is disconnected or re-connecting.
 */
export const sendChatMessageApi = async (conversationId, content) => {
  const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
    conversationId: Number(conversationId),
    content: (content || "").trim(),
  });
  return response.data?.data ?? response.data;
};

/**
 * Get all conversations for the current authenticated user.
 * GET /chat/conversations
 */
export const getConversationsApi = async () => {
  const response = await api.get("/chat/conversations");
  return response.data?.data ?? response.data ?? [];
};

/**
 * Get a single conversation by ID.
 * GET /chat/conversations/{id}
 */
export const getConversationByIdApi = async (conversationId) => {
  const response = await api.get(`/chat/conversations/${conversationId}`);
  return response.data?.data ?? response.data;
};

/**
 * Get paginated messages for a conversation.
 * GET /chat/conversations/{id}/messages?page=0&size=30
 * NOTE: Backend returns newest-first — reverse the array before rendering.
 */
export const getMessagesApi = async (conversationId, page = 0, size = 30) => {
  const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, size },
  });
  return response.data?.data ?? response.data;
};

/**
 * Mark conversation as read (persist lastReadAt in DB).
 * PATCH /chat/conversations/{id}/read
 */
export const markAsReadApi = async (conversationId) => {
  const response = await api.patch(`/chat/conversations/${conversationId}/read`);
  return response.data;
};

/**
 * Get total unread message count for nav badge.
 * GET /chat/unread-count
 */
export const getUnreadCountApi = async () => {
  const response = await api.get("/chat/unread-count");
  const data = response.data?.data ?? response.data;
  return typeof data?.totalUnread === "number" ? data.totalUnread : 0;
};

/**
 * Soft delete a message.
 * DELETE /chat/conversations/{id}/messages/{msgId}
 */
export const deleteMessageApi = async (conversationId, messageId) => {
  const response = await api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`);
  return response.data?.data ?? response.data;
};

/**
 * Universal helper to extract the other participant's profile details,
 * company name, and professional badge indicators (Recruiter vs Candidate)
 * from any conversation shape returned by Spring Boot.
 */
export function getOtherParticipant(conv, currentUserId, knownCompaniesMap = {}, currentUserEmail = null) {
  if (!conv) {
    return { name: "User", email: "", online: false, isRecruiter: false, role: "", companyName: "" };
  }

  let rawUser = null;
  let isOnline = false;
  let lastSeen = null;

  const normalizedUserId = currentUserId != null ? String(currentUserId) : null;
  const normalizedUserEmail = currentUserEmail ? String(currentUserEmail).toLowerCase() : null;

  const isMeChecker = (candidate) => {
    if (!candidate) return false;
    const cid = candidate.userId ?? candidate.id ?? candidate.user?.userId ?? candidate.user?.id;
    if (normalizedUserId && cid != null && String(cid) === normalizedUserId) {
      return true;
    }
    const cEmail = (candidate.email || candidate.user?.email || "").toLowerCase();
    if (normalizedUserEmail && cEmail && cEmail === normalizedUserEmail) {
      return true;
    }
    return false;
  };

  // Search all possible company fields across the conversation structure
  let company =
    conv.companyName ||
    conv.company ||
    conv.job?.companyName ||
    conv.job?.company ||
    conv.jobApplication?.job?.companyName ||
    conv.jobApplication?.job?.company ||
    conv.jobApplication?.companyName ||
    conv.jobApplication?.company ||
    conv.recruiter?.companyName ||
    conv.recruiter?.company ||
    conv.recruiterProfile?.companyName ||
    conv.recruiterProfile?.company ||
    conv.employerProfile?.companyName ||
    conv.employerProfile?.company ||
    conv.employer?.companyName ||
    conv.employer?.company ||
    "";

  // 1. Check conv.otherParticipant
  if (conv.otherParticipant) {
    const op = conv.otherParticipant;
    rawUser = op.user || op.profile || op;
    isOnline = Boolean(op.online ?? rawUser.online ?? false);
    lastSeen = op.lastSeenAt || rawUser.lastSeenAt || null;
    company = company || op.companyName || op.company || rawUser.companyName || rawUser.company || "";
  }
  // 2. Check conv.otherUser
  else if (conv.otherUser) {
    rawUser = conv.otherUser;
    isOnline = Boolean(rawUser.online ?? false);
    lastSeen = rawUser.lastSeenAt || null;
    company = company || rawUser.companyName || rawUser.company || "";
  }
  // 3. Check conv.candidate / conv.recruiter
  else if (conv.candidate || conv.recruiter) {
    const isCurrentUserRecruiter = isMeChecker(conv.recruiter);
    const target = isCurrentUserRecruiter
      ? conv.candidate || conv.recruiter
      : conv.recruiter || conv.candidate;
    rawUser = target?.user || target;
    isOnline = Boolean(target.online ?? false);
    lastSeen = target.lastSeenAt || null;
    company = company || target.companyName || target.company || rawUser.companyName || rawUser.company || "";
  }
  // 4. Check conv.participants array
  else if (Array.isArray(conv.participants) && conv.participants.length > 0) {
    const other =
      conv.participants.find((p) => !isMeChecker(p)) || conv.participants[0];
    rawUser = other.user || other.profile || other;
    isOnline = Boolean(other.online ?? rawUser.online ?? false);
    lastSeen = other.lastSeenAt || rawUser.lastSeenAt || null;
    company = company || other.companyName || other.company || rawUser.companyName || rawUser.company || "";
  }
  // 5. Direct fields fallback
  else {
    rawUser = {
      id: conv.recipientId || conv.participantId || conv.targetUserId || null,
      name: conv.participantName || conv.recipientName || conv.title || "User",
      email: conv.participantEmail || conv.recipientEmail || "",
      profileImage: conv.participantImage || conv.recipientImage || null,
      accountType: conv.participantRole || "",
    };
    isOnline = Boolean(conv.online ?? false);
    lastSeen = conv.lastSeenAt || null;
  }

  const otherId = rawUser.id || rawUser.userId;

  // Cross-reference with knownCompaniesMap (applications / jobs / recruiter IDs)
  if (!company && knownCompaniesMap) {
    if (otherId && knownCompaniesMap[otherId]) {
      company = knownCompaniesMap[otherId];
    } else if (conv.jobApplicationId && knownCompaniesMap[`app_${conv.jobApplicationId}`]) {
      company = knownCompaniesMap[`app_${conv.jobApplicationId}`];
    } else if (conv.jobId && knownCompaniesMap[`job_${conv.jobId}`]) {
      company = knownCompaniesMap[`job_${conv.jobId}`];
    } else if (conv.jobTitle && knownCompaniesMap[`title_${conv.jobTitle}`]) {
      company = knownCompaniesMap[`title_${conv.jobTitle}`];
    }
  }

  // If company is still not found, check if title contains "at [Company]" or "from [Company]"
  if (!company && (conv.title || conv.jobTitle)) {
    const fullTitle = conv.title || conv.jobTitle || "";
    const match = fullTitle.match(/(?:at|@|from|for)\s+([A-Za-z0-9&.\s_-]+)$/i);
    if (match && match[1]) {
      company = match[1].trim();
    }
  }

  const accountType = (
    rawUser.accountType ||
    rawUser.role ||
    rawUser.userType ||
    ""
  ).toUpperCase();

  const isRecruiter =
    accountType === "EMPLOYER" ||
    accountType === "RECRUITER" ||
    accountType.includes("RECRUIT") ||
    accountType.includes("EMPLOY") ||
    Boolean(company) ||
    Boolean(conv.jobTitle);

  return {
    id: otherId || null,
    name: rawUser.name || rawUser.fullName || rawUser.username || (isRecruiter ? "Hiring Manager" : "Candidate"),
    email: rawUser.email || "",
    profileImage: rawUser.profileImage || rawUser.avatar || null,
    accountType: accountType || (isRecruiter ? "RECRUITER" : "JOB_SEEKER"),
    isRecruiter,
    companyName: company || "",
    headline: rawUser.headline || rawUser.title || rawUser.role || (isRecruiter ? (company ? `Recruiter @ ${company}` : "Verified Recruiter") : "Job Applicant"),
    online: isOnline,
    lastSeenAt: lastSeen,
  };
}

/**
 * Universal resolver to find a candidate's User ID from any candidate / application object.
 * Searches all standard fields synchronously first, then falls back to email/name lookup via talent directory API.
 */
export async function resolveCandidateUserId(candidateOrApp) {
  if (!candidateOrApp) return null;

  // 1. Direct synchronous checks
  const syncId =
    candidateOrApp.userId ||
    candidateOrApp.candidateUserId ||
    candidateOrApp.applicantUserId ||
    candidateOrApp.applicantId ||
    candidateOrApp.candidateId ||
    candidateOrApp.talentUserId ||
    candidateOrApp.jobSeekerId ||
    candidateOrApp.appliedById ||
    candidateOrApp.createdById ||
    candidateOrApp.user?.id ||
    candidateOrApp.user?.userId ||
    candidateOrApp.applicant?.id ||
    candidateOrApp.applicant?.userId ||
    candidateOrApp.applicant?.user?.id ||
    candidateOrApp.candidate?.id ||
    candidateOrApp.candidate?.userId ||
    candidateOrApp.candidate?.user?.id ||
    candidateOrApp.jobSeeker?.id ||
    candidateOrApp.jobSeeker?.userId ||
    candidateOrApp.jobSeekerProfile?.userId ||
    candidateOrApp.jobSeekerProfile?.user?.id ||
    candidateOrApp.jobSeekerProfile?.id ||
    candidateOrApp.profile?.userId ||
    candidateOrApp.profile?.user?.id ||
    candidateOrApp.raw?.userId ||
    candidateOrApp.raw?.user?.id ||
    candidateOrApp.raw?.id ||
    candidateOrApp.realTalentId ||
    candidateOrApp.talentId ||
    null;

  if (syncId && !isNaN(Number(syncId)) && Number(syncId) > 0) {
    return Number(syncId);
  }

  // 2. Lookup via talent search API by email
  const email =
    candidateOrApp.applicantEmail ||
    candidateOrApp.email ||
    candidateOrApp.user?.email ||
    candidateOrApp.candidateEmail;

  if (email && typeof email === "string" && email.trim()) {
    try {
      const res = await searchTalent({ keyword: email.trim() });
      const list = res?.data?.content || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        const exact = list.find((t) => (t.email || t.applicantEmail || "").toLowerCase() === email.trim().toLowerCase()) || list[0];
        const foundId = exact.userId || exact.user?.id || exact.id;
        if (foundId && !isNaN(Number(foundId)) && Number(foundId) > 0) {
          return Number(foundId);
        }
      }
    } catch (e) {
      console.warn("[resolveCandidateUserId] Talent search by email notice:", e?.message);
    }
  }

  // 3. Lookup via talent search API by name
  const name =
    candidateOrApp.candidateName ||
    candidateOrApp.applicantName ||
    candidateOrApp.name ||
    candidateOrApp.user?.name;

  if (name && typeof name === "string" && name.trim()) {
    try {
      const res = await searchTalent({ keyword: name.trim() });
      const list = res?.data?.content || res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list) && list.length > 0) {
        const exact = list.find((t) => (t.name || t.fullName || "").toLowerCase() === name.trim().toLowerCase()) || list[0];
        const foundId = exact.userId || exact.user?.id || exact.id;
        if (foundId && !isNaN(Number(foundId)) && Number(foundId) > 0) {
          return Number(foundId);
        }
      }
    } catch (e) {
      console.warn("[resolveCandidateUserId] Talent search by name notice:", e?.message);
    }
  }

  // 4. Final fallback: if candidateOrApp.id is a numeric id (and not a "talent-*" string)
  if (candidateOrApp.id && typeof candidateOrApp.id === "number") {
    return candidateOrApp.id;
  }

  return null;
}
