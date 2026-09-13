/**
 * src/Pages/recruiter/RecruiterMessagesPage.jsx
 *
 * Recruiter Studio Real-time Chat Page.
 *
 * Features:
 * - Clear identification of Candidates, their applied jobs, and profile credentials
 * - WebSocket real-time: instant sends, typing indicators, read receipts, live presence
 * - 100% mobile-responsive layout inside RecruiterLayout
 * - Removed mock call buttons in favor of professional recruitment tools
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Send,
  CheckCheck,
  Check,
  ArrowLeft,
  Lock,
  MessageSquare,
  Sparkles,
  Info,
  Loader2,
  Trash2,
  RefreshCw,
  WifiOff,
  Wifi,
  Users,
  Briefcase,
  UserCheck,
  X,
  Mail,
  FileText,
} from "lucide-react";
import RecruiterLayout from "../../components/recruiter/layout/RecruiterLayout";
import { useToast } from "../../components/ui/ToastNotification";
import { useChat } from "../../hooks/useChat";
import { useAppSelector } from "../../State/Store";
import { getAssetUrl } from "../../utils/assetUtils";
import { getOtherParticipant } from "../../api/chatApi";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const RECRUITER_QUICK_REPLIES = [
  "Thank you for applying! We'd love to schedule an interview.",
  "Could you share your availability for a 30-min screening call?",
  "We reviewed your resume and would like to move forward.",
  "What is your current notice period and expected compensation?",
  "Please let us know if you have any questions about the role.",
];

function formatMsgTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isYesterday) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getProfileImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return getAssetUrl(clean);
}

function getInitial(name) {
  return (name || "?").charAt(0).toUpperCase();
}

/* ─── Candidate Avatar with Live Online Badge ───────────────────────────────── */
function ChatAvatar({ user, size = "md", online = false }) {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
      ? "h-16 w-16 text-2xl"
      : "h-11 w-11 text-sm";
  const dotSize = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  const imgUrl = getProfileImageUrl(user?.profileImage);

  return (
    <div className="relative shrink-0">
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={user?.name || "Candidate"}
          className={`${sizeClass} rounded-2xl object-cover ring-2 ring-indigo-500/40`}
          onError={(e) => {
            e.target.style.display = "none";
            if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`${sizeClass} rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center font-extrabold text-white shadow-lg ${
          imgUrl ? "hidden" : "flex"
        }`}
      >
        {getInitial(user?.name)}
      </div>
      {online && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${dotSize} rounded-full bg-emerald-400 ring-2 ring-[#0f172a] shadow-sm`}
          title="Online"
        />
      )}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */

export default function RecruiterMessagesPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUser = useAppSelector((state) => state.auth.profile || state.auth.user);
  const currentUserId = currentUser?.id ?? currentUser?.userId;
  const currentUserEmail = (currentUser?.email || "").toLowerCase();

  const isMessageFromMe = useCallback(
    (msg) => {
      if (!msg) return false;
      if (msg._optimistic) return true;
      const senderId = msg.sender?.id ?? msg.sender?.userId;
      if (currentUserId != null && senderId != null) {
        if (senderId === currentUserId || String(senderId) === String(currentUserId)) {
          return true;
        }
      }
      const senderEmail = (msg.sender?.email || "").toLowerCase();
      if (currentUserEmail && senderEmail && currentUserEmail === senderEmail) {
        return true;
      }
      return false;
    },
    [currentUserId, currentUserEmail]
  );

  const chat = useChat();

  const urlConvId = searchParams.get("convId");
  const urlConvIdNum = urlConvId ? Number(urlConvId) : null;

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const prevConvIdRef = useRef(null);

  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
      });
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
        block: "end",
      });
    }
  }, []);

  // Auto-scroll when messages update or active conversation changes
  useEffect(() => {
    if (messages.length > 0) {
      const container = messagesContainerRef.current;
      if (!container) {
        scrollToBottom(false);
        return;
      }
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 250;
      if (isNearBottom || messages.some((m) => m._optimistic)) {
        requestAnimationFrame(() => scrollToBottom(true));
      }
    }
  }, [messages, scrollToBottom]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;
  const otherParticipant = useMemo(
    () => getOtherParticipant(activeConv, currentUserId, {}, currentUserEmail),
    [activeConv, currentUserId, currentUserEmail]
  );

  // Load conversations on mount
  useEffect(() => {
    loadAllConversations();
  }, []);

  const loadAllConversations = async () => {
    setLoadingConvs(true);
    try {
      const data = await chat.loadConversations();
      const list = Array.isArray(data) ? data : [];
      setConversations(list);

      // If URL has a specific convId, open it; else auto-select first on desktop
      if (urlConvIdNum && list.some((c) => c.id === urlConvIdNum)) {
        setActiveConvId(urlConvIdNum);
        setShowMobileChat(true);
      } else if (list.length > 0 && !activeConvId && window.innerWidth >= 768) {
        setActiveConvId(list[0].id);
      }
    } catch {
      toast.error("Failed to load conversations.");
    } finally {
      setLoadingConvs(false);
    }
  };

  // Load messages & subscribe when activeConvId changes
  useEffect(() => {
    if (!activeConvId) return;

    if (prevConvIdRef.current && prevConvIdRef.current !== activeConvId) {
      chat.unsubscribeFromConversation(prevConvIdRef.current);
    }
    prevConvIdRef.current = activeConvId;

    setMessages([]);
    setPage(0);
    setHasMore(false);
    setOtherTyping(false);

    const conv = conversations.find((c) => c.id === activeConvId);
    const other = getOtherParticipant(conv, currentUserId, {}, currentUserEmail);
    setOtherOnline(Boolean(other?.online));

    loadMessagesPage(activeConvId, 0);
    subscribeAndRead(activeConvId);

    // Background safety sync every 4s to guarantee real-time updates even during socket reconnects
    const pollTimer = setInterval(() => {
      chat.loadMessages(activeConvId, 0).then((pageData) => {
        const content = pageData?.content ?? (Array.isArray(pageData) ? pageData : []);
        if (content && content.length > 0) {
          const items = [...content].reverse();
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            let updated = [...prev];
            let changed = false;

            items.forEach((serverMsg) => {
              const optIndex = updated.findIndex(
                (p) => p._optimistic && p.content === serverMsg.content && isMessageFromMe(serverMsg)
              );
              if (optIndex !== -1) {
                updated[optIndex] = { ...serverMsg, _optimistic: false };
                existingIds.add(serverMsg.id);
                changed = true;
              } else if (!existingIds.has(serverMsg.id)) {
                updated.push(serverMsg);
                existingIds.add(serverMsg.id);
                changed = true;
              }
            });

            return changed ? updated : prev;
          });
        }
      }).catch(() => {});
    }, 4000);

    return () => {
      clearTimeout(typingTimerRef.current);
      clearInterval(pollTimer);
    };
  }, [activeConvId]);

  const loadMessagesPage = async (convId, pageNum) => {
    if (pageNum === 0) setLoadingMsgs(true);
    else setLoadingOlder(true);
    try {
      const pageData = await chat.loadMessages(convId, pageNum);
      const content = pageData?.content ?? (Array.isArray(pageData) ? pageData : []);
      const items = [...content].reverse();
      if (pageNum === 0) {
        setMessages(items);
        requestAnimationFrame(() => {
          scrollToBottom(false);
          setTimeout(() => scrollToBottom(false), 50);
          setTimeout(() => scrollToBottom(false), 200);
        });
      } else {
        setMessages((prev) => [...items, ...prev]);
      }
      setHasMore(!pageData?.last && content.length > 0);
      setPage(pageNum);
    } catch {
      if (pageNum === 0) toast.error("Failed to load messages.");
    } finally {
      setLoadingMsgs(false);
      setLoadingOlder(false);
    }
  };

  const subscribeAndRead = useCallback(
    (convId) => {
      chat.markAsRead(convId);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, myUnreadCount: 0, unreadCount: 0 } : c))
      );

      chat.subscribeToConversation(convId, {
        onMessage: (msg) => {
          const fromMe = isMessageFromMe(msg);
          setMessages((prev) => {
            const isOurOptimistic =
              fromMe &&
              prev.some((m) => m._optimistic && m.content === msg.content);
            if (isOurOptimistic) {
              return prev.map((m) =>
                m._optimistic && m.content === msg.content ? { ...msg, _optimistic: false } : m
              );
            }
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          requestAnimationFrame(() => scrollToBottom(true));

          if (!fromMe) {
            chat.markAsRead(convId);
            setConversations((prev) =>
              prev.map((c) =>
                c.id === convId ? { ...c, lastMessage: msg, lastMessageAt: msg.sentAt } : c
              )
            );
          }
        },
        onTyping: (data) => {
          const isMe =
            (currentUserId != null && String(data.userId) === String(currentUserId)) ||
            (currentUserEmail && (data.email || "").toLowerCase() === currentUserEmail);
          if (!isMe) setOtherTyping(data.typing === true);
        },
        onRead: () => {},
        onPresence: (presence) => {
          const isMe =
            (currentUserId != null && String(presence.user?.id) === String(currentUserId)) ||
            (currentUserEmail && (presence.user?.email || "").toLowerCase() === currentUserEmail);
          if (!isMe) {
            setOtherOnline(presence.online === true);
            setConversations((prev) =>
              prev.map((c) =>
                c.id !== convId
                  ? c
                  : {
                      ...c,
                      otherParticipant: {
                        ...(c.otherParticipant || {}),
                        online: presence.online === true,
                      },
                    }
              )
            );
          }
        },
      });
    },
    [chat, currentUserId, currentUserEmail, isMessageFromMe, scrollToBottom]
  );

  // Sync mobile chat view when convId query param changes
  useEffect(() => {
    if (urlConvIdNum) {
      setActiveConvId(urlConvIdNum);
      setShowMobileChat(true);
    }
  }, [urlConvIdNum]);

  // Handle mobile browser / device back button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("convId")) {
        setShowMobileChat(false);
        setShowInfoPanel(false);
        setSelectedMsgId(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectConv = (convId) => {
    setActiveConvId(convId);
    setShowMobileChat(true);
    setShowInfoPanel(false);
    setSelectedMsgId(null);
    setSearchParams({ convId: String(convId) }, { replace: false });
  };

  const handleBackToConversations = () => {
    setShowMobileChat(false);
    setShowInfoPanel(false);
    setSelectedMsgId(null);
    setSearchParams({}, { replace: false });
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeConvId) return;

    setInputText("");

    const optimisticMsg = {
      id: `opt-${Date.now()}`,
      _optimistic: true,
      conversationId: activeConvId,
      sender: {
        id: currentUserId,
        userId: currentUserId,
        name: currentUser?.name || "You",
        email: currentUserEmail,
      },
      content: text,
      displayContent: text,
      messageType: "TEXT",
      sentAt: new Date().toISOString(),
      deleted: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    requestAnimationFrame(() => scrollToBottom(true));

    clearTimeout(typingTimerRef.current);
    chat.sendTyping(activeConvId, false);

    const res = await chat.sendMessage(activeConvId, text);
    if (!res || !res.success) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      toast.error(res?.error || "Message failed to send. Please try again.");
    } else if (res.via === "rest" && res.data) {
      // Reconcile optimistic message with server persisted record
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? { ...res.data, _optimistic: false } : m))
      );
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    chat.sendTyping(activeConvId, true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => chat.sendTyping(activeConvId, false), 2000);
  };

  const handleDelete = async (msg) => {
    try {
      const updated = await chat.deleteMessage(activeConvId, msg.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? (updated || { ...m, deleted: true, content: "This message was deleted." }) : m
        )
      );
      toast.success("Message deleted.");
    } catch {
      toast.error("Failed to delete message.");
    }
  };

  // ── Multi-field Search Filter ─────────────────────────────────────────────
  const filteredConvs = useMemo(() => {
    return conversations.filter((c) => {
      const other = getOtherParticipant(c, currentUserId, {}, currentUserEmail);
      const name = (other?.name || "").toLowerCase();
      const email = (other?.email || "").toLowerCase();
      const jobTitle = (c.jobTitle || "").toLowerCase();
      const title = (c.title || "").toLowerCase();
      const lastMsg = (
        typeof c.lastMessage === "string"
          ? c.lastMessage
          : c.lastMessage?.displayContent || c.lastMessage?.content || ""
      ).toLowerCase();

      const q = search.toLowerCase().trim();
      const matches =
        !q ||
        name.includes(q) ||
        email.includes(q) ||
        jobTitle.includes(q) ||
        title.includes(q) ||
        lastMsg.includes(q);

      const unreadCount = c.myUnreadCount || c.unreadCount || 0;
      if (filter === "unread") return matches && unreadCount > 0;
      return matches;
    });
  }, [conversations, currentUserId, currentUserEmail, search, filter]);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.myUnreadCount || c.unreadCount || 0), 0);

  return (
    <RecruiterLayout
      noPadding={true}
    >
      {/* Full-height Responsive Chat Container */}
      <div className="flex-1 min-h-0 w-full bg-surface overflow-hidden border-0 md:border md:border-border md:rounded-2xl md:m-3 md:w-[calc(100%-1.5rem)] shadow-xl flex font-inter text-heading">

        {/* ── Conversation Sidebar ───────────────────────────────────────── */}
        <div
          className={`w-full md:w-[350px] lg:w-[380px] shrink-0 bg-surface-elevated border-r border-border flex flex-col ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="h-14 sm:h-16 bg-surface px-3.5 sm:px-4 flex items-center justify-between border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl gradient-bg-signature flex items-center justify-center font-extrabold text-white shadow-md shrink-0">
                <Users size={18} />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-xs sm:text-sm text-heading font-satoshi block leading-tight truncate">
                  Candidate Chats
                </span>
                {chat.connected ? (
                  <span className="text-[10px] sm:text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" /> Live Realtime
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] text-muted flex items-center gap-1.5 mt-0.5">
                    <WifiOff size={10} className="shrink-0" /> Offline Mode
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={loadAllConversations}
              title="Refresh Conversations"
              aria-label="Refresh conversations"
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-surface text-muted hover:text-heading hover:bg-surface-hover transition cursor-pointer active:scale-95"
            >
              <RefreshCw size={14} className={loadingConvs ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Search + Filters */}
          <div className="p-3 sm:p-3.5 bg-surface-elevated border-b border-border space-y-2.5 sm:space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates, roles, messages…"
                className="w-full rounded-xl border border-border bg-surface pl-10 pr-9 py-2.5 text-base sm:text-xs text-heading placeholder:text-muted outline-none focus:border-primary font-medium transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-heading p-1 rounded-lg"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 text-xs font-bold font-satoshi overflow-x-auto no-scrollbar pb-0.5">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 active:scale-95 ${
                  filter === "all"
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface border border-border text-muted hover:bg-surface-hover hover:text-heading"
                }`}
              >
                All Candidates
              </button>

              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  filter === "unread"
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface border border-border text-muted hover:bg-surface-hover hover:text-heading"
                }`}
              >
                <span>Unread</span>
                {totalUnread > 0 && (
                  <span className="bg-rose-500 text-white font-black px-1.5 rounded-full text-[10px]">
                    {totalUnread}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loadingConvs ? (
              <div className="flex flex-col items-center justify-center h-44 gap-3">
                <Loader2 size={24} className="text-primary animate-spin" />
                <span className="text-xs text-muted">Loading candidates…</span>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
                <MessageSquare size={32} className="text-muted/50" />
                <p className="text-xs font-semibold text-heading font-satoshi">
                  {search ? "No candidate chats match your search." : "No candidate conversations yet."}
                </p>
                <p className="text-[11px] text-muted">
                  Click "Message" on any applicant from the Applications or Candidates Studio page to start a chat.
                </p>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const isActive = conv.id === activeConvId;
                const other = getOtherParticipant(conv, currentUserId, {}, currentUserEmail);
                const isOnline = other?.online;
                const lastMsg = conv.lastMessage;
                const lastMsgIsMe = isMessageFromMe(lastMsg);
                const unread = conv.myUnreadCount || conv.unreadCount || 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                      isActive
                        ? "bg-primary/15 border-l-4 border-primary"
                        : "hover:bg-surface-hover"
                    }`}
                  >
                    <ChatAvatar user={other} online={isOnline} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-extrabold text-heading truncate font-satoshi">
                          {other?.name || "Candidate"}
                        </h4>
                        <span className="text-[10px] text-muted shrink-0">
                          {formatMsgTime(conv.lastMessageAt || conv.updatedAt)}
                        </span>
                      </div>

                      {/* Applied Role Badge */}
                      {conv.jobTitle && (
                        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 truncate mt-0.5 flex items-center gap-1">
                          <Briefcase size={10} className="shrink-0 text-primary" />
                          <span>{conv.jobTitle}</span>
                        </p>
                      )}

                      {/* Last Message */}
                      <p className="text-xs text-muted truncate mt-1 flex items-center gap-1">
                        {lastMsgIsMe && <CheckCheck size={13} className="text-primary shrink-0" />}
                        <span>
                          {lastMsg?.deleted
                            ? "This message was deleted."
                            : lastMsg?.displayContent || lastMsg?.content || (typeof lastMsg === "string" ? lastMsg : "No messages yet")}
                        </span>
                      </p>
                    </div>

                    {unread > 0 && (
                      <span className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Window ─────────────────────────────────────────────────── */}
        <div
          className={`flex-1 bg-surface flex flex-col relative ${
            !showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 gap-4 z-10">
              {showMobileChat && (
                <div className="md:hidden w-full flex justify-start mb-2">
                  <button
                    type="button"
                    onClick={handleBackToConversations}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border bg-surface text-heading transition cursor-pointer active:scale-95 shadow-xs"
                  >
                    <ArrowLeft size={16} /> Back to Chats
                  </button>
                </div>
              )}
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
                <MessageSquare size={32} className="text-primary sm:w-9 sm:h-9" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-heading font-satoshi">
                Candidate Direct Messaging
              </h2>
              <p className="text-xs text-muted max-w-sm font-medium leading-relaxed">
                Select a candidate conversation to screen qualifications, coordinate interview dates, and send instant updates.
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-surface-elevated border border-border px-3.5 py-1.5 text-xs text-muted">
                <Lock size={13} className="text-amber-500 shrink-0" />
                <span>End-to-end secured communications.</span>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-14 sm:h-16 bg-surface px-3 sm:px-6 flex items-center justify-between border-b border-border z-10 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
                  <button
                    type="button"
                    onClick={handleBackToConversations}
                    className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-muted hover:text-heading active:scale-95 transition"
                    aria-label="Back to candidate list"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <ChatAvatar
                    user={otherParticipant}
                    size="sm"
                    online={otherOnline || otherParticipant?.online}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-xs sm:text-sm font-black text-heading truncate font-satoshi">
                        {otherParticipant?.name || "Candidate"}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-300 font-extrabold text-[9px] px-1.5 py-0.5 shrink-0">
                        <UserCheck size={9} /> Candidate
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] truncate mt-0.5">
                      {otherTyping ? (
                        <span className="text-emerald-500 dark:text-emerald-400 font-bold animate-pulse">typing message…</span>
                      ) : otherOnline || otherParticipant?.online ? (
                        <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Active now
                        </span>
                      ) : otherParticipant?.lastSeenAt ? (
                        <span className="text-muted">last seen {formatMsgTime(otherParticipant.lastSeenAt)}</span>
                      ) : (
                        <span className="text-muted">Offline</span>
                      )}

                      {activeConv.jobTitle && (
                        <>
                          <span className="text-muted/60 hidden sm:inline">•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold hidden sm:inline truncate">
                            {activeConv.jobTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Connection Status Badge */}
                  <div
                    className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[10px] font-bold ${
                      chat.connectionStatus === "CONNECTED"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : chat.connectionStatus === "CONNECTING"
                        ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                        : chat.connectionStatus === "RECONNECTING"
                        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : "border-border bg-surface-elevated text-muted"
                    }`}
                    title={chat.wsError || `WebSocket: ${chat.connectionStatus}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        chat.connectionStatus === "CONNECTED"
                          ? "bg-emerald-500"
                          : chat.connectionStatus === "CONNECTING"
                          ? "bg-blue-500 animate-pulse"
                          : chat.connectionStatus === "RECONNECTING"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-slate-400"
                      }`}
                    />
                    <span>{chat.connectionStatus}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowInfoPanel(!showInfoPanel)}
                    aria-label="Toggle candidate details"
                    className={`flex h-9 px-2.5 sm:px-3 items-center gap-1.5 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95 ${
                      showInfoPanel
                        ? "bg-primary border-primary text-white shadow-md"
                        : "bg-surface-elevated border-border text-muted hover:text-heading hover:bg-surface-hover"
                    }`}
                  >
                    <Info size={15} />
                    <span className="hidden sm:inline">Candidate Profile</span>
                  </button>
                </div>
              </div>

              {/* Messages + Info Panel */}
              <div className="flex-1 flex overflow-hidden z-10">
                <div className="flex-1 flex flex-col overflow-hidden">
                  {hasMore && (
                    <div className="flex justify-center pt-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => loadMessagesPage(activeConvId, page + 1)}
                        disabled={loadingOlder}
                        className="rounded-full bg-surface-elevated hover:bg-surface-hover border border-border px-4 py-1 text-xs font-bold text-primary flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                      >
                        {loadingOlder && <Loader2 size={12} className="animate-spin" />}
                        Load older messages
                      </button>
                    </div>
                  )}

                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 sm:space-y-3 overscroll-contain">
                    <div className="flex justify-center my-1">
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-surface-elevated border border-border px-3.5 py-1.5 text-[11px] text-muted text-center font-medium max-w-md">
                        <Lock size={12} className="text-amber-500 shrink-0" />
                        <span>Direct conversation between candidate and recruiter. All communications are private.</span>
                      </div>
                    </div>

                    {loadingMsgs ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 size={28} className="text-primary animate-spin" />
                        <span className="text-xs text-muted font-medium">Loading candidate messages…</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <MessageSquare size={32} className="text-muted/50" />
                        <h4 className="text-sm font-bold text-heading font-satoshi">Start Screening Candidate</h4>
                        <p className="text-xs text-muted max-w-xs">
                          Send a message to introduce yourself or propose an interview time.
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = isMessageFromMe(msg);
                        const isDeleted = msg.deleted;
                        const isOptimistic = msg._optimistic;

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col w-full group ${isMe ? "items-end" : "items-start"}`}
                            onClick={() => setSelectedMsgId((prev) => (prev === msg.id ? null : msg.id))}
                          >
                            <div
                              className={`relative max-w-[86%] sm:max-w-[78%] md:max-w-md rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs leading-relaxed shadow-xs transition-all break-words [overflow-wrap:anywhere] ${
                                isMe
                                  ? "gradient-bg-signature text-white rounded-tr-none font-medium shadow-md ml-auto"
                                  : "bg-surface-elevated border border-border text-heading rounded-tl-none font-medium shadow-xs mr-auto"
                              } ${isDeleted ? "opacity-60 italic" : ""}`}
                            >
                              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                {isDeleted ? "This message was deleted." : msg.displayContent || msg.content}
                                {msg.edited && !isDeleted && (
                                  <em className="text-[10px] text-muted ml-1.5">(edited)</em>
                                )}
                              </p>

                              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-80">
                                <span>{formatMsgTime(msg.sentAt)}</span>
                                {isMe && !isDeleted && (
                                  isOptimistic ? (
                                    <Check size={12} className="text-white/60" />
                                  ) : (
                                    <CheckCheck size={13} className="text-white" />
                                  )
                                )}
                              </div>

                              {isMe && !isDeleted && !isOptimistic && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(msg);
                                  }}
                                  className={`absolute -top-2.5 -left-7 ${
                                    selectedMsgId === msg.id ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100"
                                  } p-1.5 rounded-full bg-surface border border-border text-rose-500 hover:text-rose-400 transition shadow-xs active:scale-90`}
                                  title="Delete message"
                                  aria-label="Delete message"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    <AnimatePresence>
                      {otherTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="flex items-center gap-2"
                        >
                          <div className="bg-surface-elevated border border-border rounded-2xl rounded-tl-none px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                            <span className="text-[11px] text-muted font-medium ml-1">typing…</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Recruiter Quick Replies */}
                  <div className="px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar border-t border-border shrink-0 bg-surface-elevated">
                    <span className="text-[11px] font-extrabold text-primary flex items-center gap-1 shrink-0 font-satoshi">
                      <Sparkles size={13} className="text-amber-500" />
                      <span className="hidden sm:inline">Quick Reply:</span>
                    </span>
                    {RECRUITER_QUICK_REPLIES.map((reply) => (
                      <button
                        key={reply}
                        type="button"
                        onClick={() => handleSend(reply)}
                        className="shrink-0 rounded-xl border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-body hover:bg-surface-hover hover:text-heading transition cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Candidate Info Panel / Drawer */}
                <AnimatePresence>
                  {showInfoPanel && (
                    <>
                      {/* Mobile Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowInfoPanel(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
                      />

                      <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-[340px] md:relative md:inset-auto md:w-[320px] shrink-0 bg-surface-elevated border-l border-border flex flex-col overflow-y-auto shadow-2xl pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
                      >
                        <div className="p-4 sm:p-5 space-y-4 sm:space-y-6">
                          <div className="flex items-center justify-between pb-3 border-b border-border">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-muted font-satoshi">
                              Candidate Profile
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowInfoPanel(false)}
                              aria-label="Close candidate profile"
                              className="text-muted hover:text-heading p-1.5 rounded-xl active:scale-95"
                            >
                              <X size={18} />
                            </button>
                          </div>

                          <div className="text-center space-y-2">
                            <ChatAvatar
                              user={otherParticipant}
                              size="lg"
                              online={otherOnline || otherParticipant?.online}
                            />
                            <h4 className="text-base font-black text-heading font-satoshi mt-3">
                              {otherParticipant?.name || "Candidate"}
                            </h4>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-300 font-extrabold text-[10px] px-2 py-0.5">
                              <UserCheck size={11} /> Registered Job Candidate
                            </span>
                            {otherParticipant?.email && (
                              <p className="text-xs text-muted truncate">{otherParticipant.email}</p>
                            )}
                          </div>

                          {/* Job Position Applied For */}
                          {activeConv?.jobTitle && (
                            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 space-y-1.5">
                              <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                                <Briefcase size={13} /> Job Application
                              </span>
                              <h5 className="font-bold text-heading text-xs">{activeConv.jobTitle}</h5>
                            </div>
                          )}

                          {/* Contact details */}
                          <div className="rounded-2xl border border-border bg-surface p-4 space-y-2 text-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                              Candidate Details
                            </span>
                            <div className="flex items-center gap-2 text-body">
                              <Mail size={13} className="text-muted" />
                              <span className="truncate">{otherParticipant?.email || "Email on file"}</span>
                            </div>
                          </div>

                          {/* Security notice */}
                          <div className="rounded-2xl border border-border bg-surface-elevated p-3 text-[11px] text-muted flex items-center gap-2">
                            <Lock size={14} className="text-amber-500 shrink-0" />
                            <span>Candidate data is synchronized with your recruitment studio.</span>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Input Bar */}
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-surface flex items-center gap-2 border-t border-border z-10 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={otherParticipant?.name ? `Message ${otherParticipant.name.split(" ")[0]}…` : "Type message to candidate…"}
                  maxLength={5000}
                  enterKeyHint="send"
                  className="flex-1 min-w-0 rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 sm:px-4 sm:py-2 text-base sm:text-xs text-heading placeholder:text-muted outline-none focus:border-primary font-medium transition min-h-[42px]"
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="h-10 w-10 sm:h-10 sm:w-10 rounded-xl gradient-bg-signature flex items-center justify-center text-white shadow-md transition-all active:scale-90 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </RecruiterLayout>
  );
}
