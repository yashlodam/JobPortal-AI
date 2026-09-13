/**
 * src/Pages/MessagesPage.jsx
 *
 * Professional Real-time Chat for Job Seekers / Candidates.
 *
 * Features:
 * - Full Dark / Light Mode support via useTheme hook with high-contrast WCAG AA compliance
 * - Direct Recruiter & Company identification
 * - Clean layout without misplaced job titles on recruiter profile
 * - WebSocket real-time: instant sends, typing indicators, read receipts, live presence
 * - 100% mobile-responsive layout (fluid list / chat toggle, mobile details drawer)
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
  Building2,
  UserCheck,
  Briefcase,
  ShieldCheck,
  X,
} from "lucide-react";
import { useToast } from "../components/ui/ToastNotification";
import { useChat } from "../hooks/useChat";
import { useAppDispatch, useAppSelector } from "../State/Store";
import { getOtherParticipant } from "../api/chatApi";
import { fetchMyApplicationsThunk } from "../State/applicationThunk";
import { getAssetUrl } from "../utils/assetUtils";
import { useTheme } from "../context/ThemeContext";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const CANDIDATE_QUICK_REPLIES = [
  "I'm very interested in this role!",
  "Thank you for reaching out!",
  "I've submitted my resume for review.",
  "When is a good time to connect?",
  "Looking forward to the interview.",
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

/* ─── Professional Avatar with Role Indicator ──────────────────────────────── */
function ChatAvatar({ user, size = "md", online = false }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
      ? "h-16 w-16 text-2xl"
      : size === "xl"
      ? "h-20 w-20 text-3xl"
      : "h-11 w-11 text-sm";
  const dotSize = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  const imgUrl = getProfileImageUrl(user?.profileImage);

  const bgGradient = user?.isRecruiter
    ? "from-indigo-600 via-purple-600 to-pink-600"
    : "from-teal-600 to-emerald-600";

  return (
    <div className="relative shrink-0">
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={user?.name || "User"}
          className={`${sizeClass} rounded-2xl object-cover ring-2 ${
            user?.isRecruiter
              ? isLight ? "ring-indigo-300" : "ring-indigo-500/40"
              : isLight ? "ring-teal-300" : "ring-teal-500/40"
          }`}
          onError={(e) => {
            e.target.style.display = "none";
            if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`${sizeClass} rounded-2xl bg-gradient-to-tr ${bgGradient} flex items-center justify-center font-extrabold text-white shadow-lg ${
          imgUrl ? "hidden" : "flex"
        }`}
      >
        {getInitial(user?.name)}
      </div>
      {online && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${dotSize} rounded-full bg-emerald-500 ring-2 ${
            isLight ? "ring-white" : "ring-surface"
          } shadow-sm`}
          title="Online"
        />
      )}
    </div>
  );
}

/* ─── Role / Company Badge Component ────────────────────────────────────────── */
function RoleBadge({ isRecruiter, companyName, compact = false }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  if (isRecruiter) {
    if (companyName && companyName.trim()) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border font-extrabold font-satoshi shadow-xs ${
            isLight
              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
              : "bg-indigo-500/15 border-indigo-500/35 text-indigo-200"
          } ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}`}
        >
          <Building2 size={compact ? 11 : 13} className={isLight ? "text-indigo-600 shrink-0" : "text-indigo-400 shrink-0"} />
          <span className="truncate">{companyName}</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-lg border font-extrabold font-satoshi ${
          isLight
            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
            : "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
        } ${compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"}`}
      >
        <ShieldCheck size={compact ? 10 : 12} className={isLight ? "text-indigo-600 shrink-0" : "text-indigo-400 shrink-0"} />
        <span>Verified Recruiter</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border font-extrabold font-satoshi ${
        isLight
          ? "bg-teal-50 border-teal-200 text-teal-700"
          : "bg-teal-500/15 border-teal-500/30 text-teal-300"
      } ${compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"}`}
    >
      <UserCheck size={compact ? 9 : 11} className={isLight ? "text-teal-600 shrink-0" : "text-teal-400 shrink-0"} />
      <span>Candidate</span>
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */

export default function MessagesPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const toast = useToast();
  const dispatch = useAppDispatch();
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

  const myApplications = useAppSelector((state) => state.application?.myApplications || []);
  const allJobs = useAppSelector((state) => state.job?.jobs || state.job?.allJobs || []);

  const urlConvId = searchParams.get("convId");
  const urlConvIdNum = urlConvId ? Number(urlConvId) : null;

  const chat = useChat();

  // ── State ─────────────────────────────────────────────────────────────────
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
  const [filter, setFilter] = useState("all"); // "all" | "recruiters" | "unread"
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

  // ── Build known companies lookup map ──────────────────────────────────────
  const knownCompaniesMap = useMemo(() => {
    const map = {};
    if (Array.isArray(myApplications)) {
      myApplications.forEach((app) => {
        const comp =
          app.job?.company ||
          app.job?.companyName ||
          app.company ||
          app.companyName;
        if (comp) {
          if (app.id) map[`app_${app.id}`] = comp;
          if (app.job?.id) map[`job_${app.job.id}`] = comp;
          if (app.job?.title) map[`title_${app.job.title}`] = comp;
          if (app.job?.postedBy?.id) map[app.job.postedBy.id] = comp;
          if (app.job?.recruiter?.id) map[app.job.recruiter.id] = comp;
          if (app.job?.userId) map[app.job.userId] = comp;
        }
      });
    }
    if (Array.isArray(allJobs)) {
      allJobs.forEach((j) => {
        const comp = j.company || j.companyName;
        if (comp) {
          if (j.id) map[`job_${j.id}`] = comp;
          if (j.title) map[`title_${j.title}`] = comp;
          if (j.postedBy?.id) map[j.postedBy.id] = comp;
          if (j.recruiter?.id) map[j.recruiter.id] = comp;
          if (j.userId) map[j.userId] = comp;
        }
      });
    }
    return map;
  }, [myApplications, allJobs]);

  // ── Active conversation object ────────────────────────────────────────────
  const activeConv = conversations.find((c) => c.id === activeConvId) || null;
  const otherParticipant = useMemo(
    () => getOtherParticipant(activeConv, currentUserId, knownCompaniesMap, currentUserEmail),
    [activeConv, currentUserId, knownCompaniesMap, currentUserEmail]
  );

  // ── Load applications & conversations on mount ────────────────────────────
  useEffect(() => {
    dispatch(fetchMyApplicationsThunk()).catch(() => {});
    loadAllConversations();
  }, []);

  const loadAllConversations = async () => {
    setLoadingConvs(true);
    try {
      const data = await chat.loadConversations();
      const list = Array.isArray(data) ? data : [];
      setConversations(list);

      // Auto-select requested conversation or first conversation
      if (urlConvIdNum && list.some((c) => c.id === urlConvIdNum)) {
        setActiveConvId(urlConvIdNum);
        setShowMobileChat(true);
      } else if (list.length > 0 && !activeConvId && window.innerWidth >= 768) {
        setActiveConvId(list[0].id);
      }
    } catch {
      toast.error("Failed to load conversations. Check your connection.");
    } finally {
      setLoadingConvs(false);
    }
  };

  // ── Load messages & subscribe when activeConvId changes ──────────────────
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
    const other = getOtherParticipant(conv, currentUserId, knownCompaniesMap, currentUserEmail);
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
          if (!isMe) {
            setOtherTyping(data.typing === true);
          }
        },
        onRead: () => {},
        onPresence: (presence) => {
          const isMe =
            (currentUserId != null && String(presence.user?.id) === String(currentUserId)) ||
            (currentUserEmail && (presence.user?.email || "").toLowerCase() === currentUserEmail);
          if (!isMe) {
            setOtherOnline(presence.online === true);
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id !== convId) return c;
                return {
                  ...c,
                  otherParticipant: {
                    ...(c.otherParticipant || {}),
                    online: presence.online === true,
                  },
                };
              })
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
      edited: false,
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
    typingTimerRef.current = setTimeout(() => {
      chat.sendTyping(activeConvId, false);
    }, 2000);
  };

  const handleDelete = async (msg) => {
    try {
      const updated = await chat.deleteMessage(activeConvId, msg.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? updated || { ...m, deleted: true, content: "This message was deleted." }
            : m
        )
      );
      toast.success("Message deleted.");
    } catch {
      toast.error("Failed to delete message.");
    }
  };

  const handleLoadOlder = () => {
    if (!loadingOlder && hasMore) {
      loadMessagesPage(activeConvId, page + 1);
    }
  };

  // ── Multi-field Search & Role Filtering ───────────────────────────────────
  const filteredConvs = useMemo(() => {
    return conversations.filter((c) => {
      const other = getOtherParticipant(c, currentUserId, knownCompaniesMap, currentUserEmail);
      const name = (other?.name || "").toLowerCase();
      const email = (other?.email || "").toLowerCase();
      const company = (other?.companyName || "").toLowerCase();
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
        company.includes(q) ||
        lastMsg.includes(q);

      const unreadCount = c.myUnreadCount || c.unreadCount || 0;
      if (filter === "unread") return matches && unreadCount > 0;
      if (filter === "recruiters") return matches && other.isRecruiter;
      return matches;
    });
  }, [conversations, currentUserId, currentUserEmail, search, filter, knownCompaniesMap]);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.myUnreadCount || c.unreadCount || 0), 0);
  const totalRecruiters = conversations.filter(
    (c) => getOtherParticipant(c, currentUserId, knownCompaniesMap, currentUserEmail).isRecruiter
  ).length;

  return (
    <div className={`h-full w-full flex-1 min-h-0 font-inter flex flex-col overflow-hidden transition-colors ${
      isLight ? "bg-slate-100 text-slate-900" : "bg-background text-slate-100"
    }`}>
      {/* ── Main Container ── */}
      <div className={`flex-1 min-h-0 flex w-full max-w-[1600px] mx-auto overflow-hidden sm:shadow-2xl sm:border-t ${
        isLight ? "bg-white sm:border-slate-200" : "bg-surface sm:border-border"
      }`}>

        {/* ────────────────────────────────────────────────────────────────────
            LEFT SIDEBAR: Conversation List
           ──────────────────────────────────────────────────────────────────── */}
        <div
          className={`w-full md:w-[360px] lg:w-[400px] shrink-0 flex flex-col border-r ${
            isLight ? "bg-white border-slate-200" : "bg-surface border-border"
          } ${showMobileChat ? "hidden md:flex" : "flex"}`}
        >
          {/* Header */}
          <div className={`h-14 sm:h-16 px-3.5 sm:px-4 flex items-center justify-between border-b shrink-0 ${
            isLight ? "bg-slate-50/90 border-slate-200" : "bg-surface-elevated/95 border-border"
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center font-extrabold text-white shadow-lg shrink-0">
                {getInitial(currentUser?.name)}
              </div>
              <div className="min-w-0">
                <span className={`font-extrabold text-xs sm:text-sm font-satoshi block leading-tight truncate ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  Inbox & Messages
                </span>
                {chat.connected ? (
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" /> Live Realtime
                  </span>
                ) : (
                  <span className={`text-[10px] sm:text-[11px] flex items-center gap-1.5 mt-0.5 ${
                    isLight ? "text-slate-500" : "text-slate-400"
                  }`}>
                    <WifiOff size={10} className="shrink-0" /> Offline Mode
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadAllConversations}
                title="Refresh Conversations"
                aria-label="Refresh conversations"
                className={`h-9 w-9 flex items-center justify-center rounded-xl border transition cursor-pointer active:scale-95 ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-xs"
                    : "border-border bg-surface-elevated/40 text-slate-300 hover:text-white hover:bg-surface-elevated"
                }`}
              >
                <RefreshCw size={14} className={loadingConvs ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Search + Filter Tabs */}
          <div className={`p-3 sm:p-3.5 border-b space-y-2.5 sm:space-y-3 ${
            isLight ? "bg-slate-50/50 border-slate-200" : "bg-surface border-border"
          }`}>
            <div className="relative">
              <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                isLight ? "text-slate-400" : "text-slate-400"
              }`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recruiters, companies, messages…"
                className={`w-full rounded-xl border pl-10 pr-9 py-2.5 text-base sm:text-xs outline-none font-medium transition ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-xs"
                    : "border-white/10 bg-white/5 text-white placeholder-slate-400 focus:border-indigo-500/60"
                }`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg ${
                    isLight ? "text-slate-400 hover:text-slate-700" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-bold font-satoshi overflow-x-auto no-scrollbar pb-0.5">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 active:scale-95 ${
                  filter === "all"
                    ? "bg-indigo-600 text-white shadow-md"
                    : isLight
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                All Chats
              </button>

              <button
                type="button"
                onClick={() => setFilter("recruiters")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  filter === "recruiters"
                    ? "bg-indigo-600 text-white shadow-md"
                    : isLight
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Building2 size={12} />
                <span>Recruiters</span>
                {totalRecruiters > 0 && (
                  <span className={`text-[10px] px-1.5 rounded-full font-black ${
                    filter === "recruiters"
                      ? "bg-white/20 text-white"
                      : isLight
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-indigo-400/30 text-white"
                  }`}>
                    {totalRecruiters}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  filter === "unread"
                    ? "bg-indigo-600 text-white shadow-md"
                    : isLight
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
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

          {/* Conversations List */}
          <div className={`flex-1 overflow-y-auto divide-y ${
            isLight ? "divide-slate-100" : "divide-white/5"
          }`}>
            {loadingConvs ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Loader2 size={26} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
                <p className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  Loading your conversations…
                </p>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 gap-3 px-6 text-center">
                <MessageSquare size={32} className={isLight ? "text-slate-300" : "text-slate-600"} />
                <p className={`text-xs font-semibold font-satoshi ${isLight ? "text-slate-800" : "text-slate-300"}`}>
                  {search ? "No conversations match your search." : "No messages yet."}
                </p>
                <p className={`text-[11px] max-w-xs ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                  When a recruiter messages you, it will appear here.
                </p>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const isActive = conv.id === activeConvId;
                const other = getOtherParticipant(conv, currentUserId, knownCompaniesMap, currentUserEmail);
                const isOnline = other?.online;
                const lastMsg = conv.lastMessage;
                const lastMsgIsMe = isMessageFromMe(lastMsg);
                const unread = conv.myUnreadCount || conv.unreadCount || 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv.id)}
                    className={`p-3.5 flex items-start gap-3 transition-all cursor-pointer relative ${
                      isActive
                        ? isLight
                          ? "bg-indigo-50/90 border-l-4 border-indigo-600"
                          : "bg-indigo-600/15 border-l-4 border-indigo-500"
                        : isLight
                        ? "hover:bg-slate-50"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <ChatAvatar user={other} online={isOnline} />

                    <div className="flex-1 min-w-0">
                      {/* Name + Time */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className={`text-sm font-extrabold truncate font-satoshi ${
                            isLight ? "text-slate-900" : "text-white"
                          }`}>
                            {other?.name || "User"}
                          </h4>
                          {other.isRecruiter && (
                            <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" title="Verified Recruiter" />
                          )}
                        </div>
                        <span className={`text-[10px] font-medium shrink-0 ${
                          isLight ? "text-slate-500" : "text-slate-400"
                        }`}>
                          {formatMsgTime(conv.lastMessageAt || conv.updatedAt)}
                        </span>
                      </div>

                      {/* Recruiter / Company Badge */}
                      <div className="mt-1 flex items-center gap-1.5">
                        <RoleBadge
                          isRecruiter={other.isRecruiter}
                          companyName={other.companyName}
                          compact={true}
                        />
                      </div>

                      {/* Last Message Snippet */}
                      <p className={`text-xs truncate mt-1.5 flex items-center gap-1 ${
                        isLight ? "text-slate-600" : "text-slate-400"
                      }`}>
                        {lastMsgIsMe && (
                          <CheckCheck size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                        <span>
                          {lastMsg?.deleted
                            ? "This message was deleted."
                            : lastMsg?.displayContent || lastMsg?.content || (typeof lastMsg === "string" ? lastMsg : "No messages yet")}
                        </span>
                      </p>
                    </div>

                    {unread > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white shadow-md">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────────
            RIGHT: Active Chat Window
           ──────────────────────────────────────────────────────────────────── */}
        <div
          className={`flex-1 flex flex-col relative ${
            isLight ? "bg-slate-50" : "bg-surface"
          } ${!showMobileChat ? "hidden md:flex" : "flex"}`}
        >
          {/* Subtle wallpaper texture */}
          <div className={`absolute inset-0 pointer-events-none [background-size:24px_24px] ${
            isLight
              ? "opacity-25 bg-[radial-gradient(#94a3b8_1px,transparent_1px)]"
              : "opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)]"
          }`} />

          {!activeConv ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 gap-4 z-10">
              {showMobileChat && (
                <div className="md:hidden w-full flex justify-start mb-2">
                  <button
                    type="button"
                    onClick={handleBackToConversations}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer active:scale-95 ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <ArrowLeft size={16} /> Back to Messages
                  </button>
                </div>
              )}
              <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-3xl flex items-center justify-center shadow-xl border ${
                isLight
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "bg-indigo-600/10 border-indigo-500/20 text-indigo-400"
              }`}>
                <MessageSquare size={32} className="sm:w-9 sm:h-9" />
              </div>
              <h2 className={`text-lg sm:text-xl font-black font-satoshi ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                Professional Candidate Messaging
              </h2>
              <p className={`text-xs max-w-sm font-medium leading-relaxed ${
                isLight ? "text-slate-600" : "text-slate-400"
              }`}>
                Connect directly with recruiters, receive interview invitations, and discuss opportunities in real-time.
              </p>
              <div className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-medium shadow-xs ${
                isLight
                  ? "bg-white border-slate-200 text-slate-700"
                  : "bg-white/5 border-white/10 text-slate-300"
              }`}>
                <Lock size={13} className="text-amber-500 shrink-0" />
                <span>All communications are private and secure.</span>
              </div>
            </div>
          ) : (
            <>
              {/* Top Chat Header */}
              <div className={`h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between border-b z-10 shrink-0 backdrop-blur-md ${
                isLight ? "bg-white/95 border-slate-200" : "bg-surface-elevated/95 border-border"
              }`}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={handleBackToConversations}
                    className={`md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition cursor-pointer active:scale-95 ${
                      isLight
                        ? "bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
                        : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  {/* Avatar */}
                  <ChatAvatar
                    user={otherParticipant}
                    size="sm"
                    online={otherOnline || otherParticipant?.online}
                  />

                  {/* Header Titles & Role */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className={`text-xs sm:text-sm font-black truncate font-satoshi ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}>
                        {otherParticipant?.name || "User"}
                      </h3>
                      {otherParticipant.isRecruiter && (
                        <ShieldCheck size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" title="Verified Recruiter" />
                      )}
                      <div className="hidden sm:inline-flex shrink-0">
                        <RoleBadge
                          isRecruiter={otherParticipant.isRecruiter}
                          companyName={otherParticipant.companyName}
                          compact={true}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-[11px] truncate">
                      {otherTyping ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">typing message…</span>
                      ) : otherOnline || otherParticipant?.online ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Active now
                        </span>
                      ) : otherParticipant?.lastSeenAt ? (
                        <span className={isLight ? "text-slate-500" : "text-slate-400"}>
                          last seen {formatMsgTime(otherParticipant.lastSeenAt)}
                        </span>
                      ) : (
                        <span className={isLight ? "text-slate-400" : "text-slate-500"}>Offline</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Connection Status Badge */}
                  <div
                    className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[10px] font-bold ${
                      chat.connectionStatus === "CONNECTED"
                        ? isLight ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : chat.connectionStatus === "CONNECTING"
                        ? isLight ? "border-blue-200 bg-blue-50 text-blue-700" : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                        : chat.connectionStatus === "RECONNECTING"
                        ? isLight ? "border-amber-200 bg-amber-50 text-amber-700" : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/10 bg-white/5 text-slate-400"
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
                    aria-label="Toggle details panel"
                    className={`flex h-9 px-2.5 sm:px-3 items-center gap-1.5 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95 ${
                      showInfoPanel
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                        : isLight
                        ? "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Info size={15} className={showInfoPanel ? "text-white" : isLight ? "text-indigo-600" : "text-indigo-400"} />
                    <span className="hidden sm:inline">Details</span>
                  </button>
                </div>
              </div>

              {/* Chat Timeline & Details Panel */}
              <div className="flex-1 flex overflow-hidden z-10">
                {/* Message Timeline */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Load Older Messages */}
                  {hasMore && (
                    <div className="flex justify-center pt-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleLoadOlder}
                        disabled={loadingOlder}
                        className={`rounded-full px-4 py-1 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border shadow-xs ${
                          isLight
                            ? "bg-white hover:bg-slate-100 border-slate-200 text-indigo-700"
                            : "bg-white/5 hover:bg-white/10 border-white/10 text-indigo-300"
                        }`}
                      >
                        {loadingOlder && <Loader2 size={12} className="animate-spin" />}
                        Load older messages
                      </button>
                    </div>
                  )}

                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                    {/* Clean Security / Verified Header */}
                    <div className="flex justify-center my-1">
                      <div className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-[11px] text-center font-medium max-w-md ${
                        isLight
                          ? "bg-slate-100/90 border-slate-200 text-slate-600 shadow-xs"
                          : "bg-white/[0.03] border-white/10 text-slate-400"
                      }`}>
                        <Lock size={12} className="text-amber-500 shrink-0" />
                        <span>Direct conversation between candidate and verified recruiter.</span>
                      </div>
                    </div>

                    {loadingMsgs ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 size={28} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
                        <span className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          Loading message history…
                        </span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <MessageSquare size={32} className={isLight ? "text-slate-300" : "text-slate-600"} />
                        <h4 className={`text-sm font-bold font-satoshi ${isLight ? "text-slate-900" : "text-white"}`}>
                          Start the Conversation
                        </h4>
                        <p className={`text-xs max-w-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                          Say hello, share your availability, or ask any questions regarding opportunities.
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
                          {/* Message Bubble */}
                          <div
                            className={`relative max-w-[86%] sm:max-w-[78%] md:max-w-md rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs leading-relaxed shadow-xs transition-all break-words [overflow-wrap:anywhere] ${
                              isMe
                                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none font-medium shadow-md ml-auto"
                                : isLight
                                ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none font-medium shadow-xs mr-auto"
                                : "bg-surface-elevated border border-border text-slate-100 rounded-tl-none font-medium shadow-md mr-auto"
                            } ${isDeleted ? "opacity-60 italic" : ""}`}
                          >
                              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                {isDeleted
                                  ? "This message was deleted."
                                  : msg.displayContent || msg.content}
                                {msg.edited && !isDeleted && (
                                  <em className={`text-[10px] ml-1.5 ${isMe ? "text-white/80" : isLight ? "text-slate-500" : "text-slate-300"}`}>
                                    (edited)
                                  </em>
                                )}
                              </p>

                              <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                                isMe
                                  ? "text-white/80"
                                  : isLight
                                  ? "text-slate-400"
                                  : "text-slate-400"
                              }`}>
                                <span>{formatMsgTime(msg.sentAt)}</span>
                                {isMe && !isDeleted && (
                                  isOptimistic ? (
                                    <Check size={12} className="text-white/70" />
                                  ) : (
                                    <CheckCheck size={13} className="text-sky-200" />
                                  )
                                )}
                              </div>

                              {/* Delete Button — accessible via hover on desktop OR tap on mobile */}
                              {isMe && !isDeleted && !isOptimistic && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(msg);
                                  }}
                                  className={`absolute -top-2.5 -left-7 ${
                                    selectedMsgId === msg.id ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100"
                                  } p-1.5 rounded-full border transition-all cursor-pointer shadow-xs active:scale-90 ${
                                    isLight
                                      ? "bg-white border-slate-200 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                      : "bg-surface-elevated border-border text-rose-400 hover:text-rose-300 hover:bg-surface-elevated/80"
                                  }`}
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

                    {/* Real-time Typing Indicator */}
                    <AnimatePresence>
                      {otherTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="flex items-center gap-2"
                        >
                          <div className={`rounded-2xl rounded-tl-none px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 border shadow-sm ${
                            isLight
                              ? "bg-white border-slate-200"
                              : "bg-surface-elevated border-border"
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:300ms]" />
                            <span className={`text-[11px] font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                              typing…
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Reply Chips */}
                  <div className={`px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar border-t shrink-0 backdrop-blur-sm ${
                    isLight
                      ? "bg-white/95 border-slate-200"
                      : "bg-surface/70 border-border"
                  }`}>
                    <span className={`text-[11px] font-extrabold flex items-center gap-1 shrink-0 font-satoshi ${
                      isLight ? "text-indigo-700" : "text-indigo-400"
                    }`}>
                      <Sparkles size={13} className="text-amber-500" />
                      <span className="hidden sm:inline">Quick Reply:</span>
                    </span>
                    {CANDIDATE_QUICK_REPLIES.map((reply) => (
                      <button
                        key={reply}
                        type="button"
                        onClick={() => handleSend(reply)}
                        className={`shrink-0 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                          isLight
                            ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 shadow-xs"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-white"
                        }`}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Panel / Drawer (Desktop & Mobile) */}
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
                        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[340px] md:relative md:inset-auto md:w-[320px] shrink-0 border-l flex flex-col overflow-y-auto shadow-2xl pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] ${
                          isLight ? "bg-white border-slate-200" : "bg-surface border-border"
                        }`}
                      >
                        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
                          {/* Close button on panel */}
                          <div className={`flex items-center justify-between pb-3 border-b ${
                            isLight ? "border-slate-200" : "border-white/10"
                          }`}>
                            <span className={`text-xs font-extrabold uppercase tracking-wider font-satoshi ${
                              isLight ? "text-slate-600" : "text-slate-400"
                            }`}>
                              Recruiter Details
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowInfoPanel(false)}
                              aria-label="Close recruiter details"
                              className={`p-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
                                isLight ? "text-slate-400 hover:text-slate-800 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <X size={18} />
                            </button>
                          </div>

                          {/* Recruiter Avatar & Name */}
                          <div className="text-center space-y-2">
                            <ChatAvatar
                              user={otherParticipant}
                              size="lg"
                              online={otherOnline || otherParticipant?.online}
                            />
                            <h4 className={`text-base font-black font-satoshi mt-3 ${
                              isLight ? "text-slate-900" : "text-white"
                            }`}>
                              {otherParticipant?.name || "User"}
                            </h4>
                            {otherParticipant.email && (
                              <p className={`text-xs truncate ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                {otherParticipant.email}
                              </p>
                            )}
                          </div>

                          {/* Company Card if company exists */}
                          {otherParticipant.companyName ? (
                            <div className={`rounded-2xl border p-4 space-y-2 shadow-sm ${
                              isLight
                                ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
                                : "bg-gradient-to-br from-indigo-950/60 to-purple-950/50 border-indigo-500/40 shadow-lg"
                            }`}>
                              <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                isLight ? "text-indigo-700" : "text-indigo-300"
                              }`}>
                                <Building2 size={13} /> Organization
                              </span>
                              <h3 className={`text-base font-black font-satoshi ${
                                isLight ? "text-slate-900" : "text-white"
                              }`}>
                                {otherParticipant.companyName}
                              </h3>
                              <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                                isLight ? "text-emerald-700" : "text-emerald-400"
                              }`}>
                                <ShieldCheck size={13} /> Verified Employer Account
                              </span>
                            </div>
                          ) : (
                            <div className={`rounded-2xl border p-4 space-y-1 ${
                              isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                            }`}>
                              <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                isLight ? "text-slate-600" : "text-slate-400"
                              }`}>
                                <ShieldCheck size={13} className="text-indigo-600 dark:text-indigo-400" /> Recruiter Status
                              </span>
                              <h5 className={`font-bold text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                                Verified Hiring Recruiter
                              </h5>
                            </div>
                          )}

                          {/* Related Job Role in Details Panel */}
                          {activeConv?.jobTitle && (
                            <div className={`rounded-2xl border p-4 space-y-1.5 ${
                              isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                            }`}>
                              <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                isLight ? "text-slate-600" : "text-slate-400"
                              }`}>
                                <Briefcase size={12} /> Applied Job Role
                              </span>
                              <h5 className={`font-bold text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                                {activeConv.jobTitle}
                              </h5>
                            </div>
                          )}

                          {/* Conversation Details */}
                          <div className={`rounded-2xl border p-4 space-y-2 text-xs ${
                            isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                          }`}>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${
                              isLight ? "text-slate-600" : "text-slate-400"
                            }`}>
                              Channel Info
                            </span>
                            <div className="flex justify-between">
                              <span className={isLight ? "text-slate-500" : "text-slate-400"}>Status</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isLight ? "text-slate-500" : "text-slate-400"}>Started</span>
                              <span className={`font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
                                {formatMsgTime(activeConv.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Security Badge */}
                          <div className={`rounded-2xl border p-3 text-[11px] flex items-center gap-2 ${
                            isLight
                              ? "bg-slate-50 border-slate-200 text-slate-600"
                              : "bg-white/[0.02] border-white/5 text-slate-400"
                          }`}>
                            <Lock size={14} className="text-amber-500 shrink-0" />
                            <span>Messages are protected & stored securely with your JobPortal AI account.</span>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Input Bar */}
              <div className={`px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 border-t z-10 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
                isLight ? "bg-white/95 border-slate-200" : "bg-surface-elevated/95 border-border"
              }`}>
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={otherParticipant?.name ? `Message ${otherParticipant.name.split(" ")[0]}…` : "Type a message…"}
                  maxLength={5000}
                  enterKeyHint="send"
                  className={`flex-1 min-w-0 rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-2 text-base sm:text-xs outline-none font-medium transition min-h-[42px] ${
                    isLight
                      ? "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-xs"
                      : "border-white/10 bg-white/5 text-white placeholder-slate-400 focus:border-indigo-500/60"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="h-10 w-10 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md transition-all active:scale-90 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
