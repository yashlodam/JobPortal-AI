/**
 * src/components/FloatingAIChatbot.jsx
 *
 * Ultra-Premium Floating AI Career Copilot Widget for JobPortal.
 * Powered by Spring AI + Groq LLaMA 3.3.
 *
 * Key Features:
 * - Real-time conversational intelligence with rolling memory
 * - Text-to-Speech (TTS) voice narration with SpeechSynthesis API
 * - Helpful / Unhelpful reaction feedback buttons
 * - Mode Quick Switcher (Career Chat, Job Finder, ATS Resume, Interview Drill)
 * - Expandable Widescreen View (420px -> 640px)
 * - Enhanced Markdown parsing (Headers, Bold, Bullet points, Numbered lists, Callout boxes, Copyable Code)
 * - Interactive Matched Job Cards with 1-click navigation
 * - Dynamic suggested follow-up prompt chips with toggle
 * - Web Speech API Voice Dictation with animated pulse
 * - 100% WCAG AA contrast in both Light (#F8FAFC) and Dark (#05070D) themes
 */

import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Briefcase,
  Bookmark,
  MapPin,
  Trash2,
  ChevronRight,
  ArrowRight,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Mic,
  MicOff,
  Flame,
  Compass,
  FileText,
  Target,
  ArrowUpRight,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Download,
  Info,
} from "lucide-react";
import { useSelector } from "react-redux";
import { sendCopilotMessageApi } from "../api/copilotApi";
import { toast } from "./ui/ToastNotification";

/* Helper to sanitize prompt strings: remove quotes, bullets, numbers, brackets */
function cleanPromptText(text) {
  if (!text) return "";
  return text
    .trim()
    .replace(/^['"`]+|['"`]+$/g, "")
    .replace(/^[\-\•\*\d\.\)\:\s]+/, "")
    .replace(/^['"`]+|['"`]+$/g, "")
    .replace(/^\[|\]$/g, "")
    .trim();
}

/* ── 3D Futuristic AI Robot Avatar Logo ── */
function BotAvatarIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.5" fill="#F59E0B" />
      <rect x="4" y="6" width="16" height="12" rx="4" fill="url(#botGradAiFloat)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <circle cx="9" cy="11" r="1.5" fill="#38BDF8" />
      <circle cx="15" cy="11" r="1.5" fill="#38BDF8" />
      <path d="M9.5 15C9.5 15 10.75 16.5 12 16.5C13.25 16.5 14.5 15 14.5 15" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="botGradAiFloat" x1="4" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Capability Modes ── */
const COPILOT_MODES = [
  { id: "all", label: "Career Chat", icon: Compass, prompt: "Hello! What can I help you achieve in your job search today?" },
  { id: "jobs", label: "Job Finder", icon: Briefcase, prompt: "💼 Show me the highest paying active remote engineering roles" },
  { id: "ats", label: "ATS Resume", icon: FileText, prompt: "⚡ How do I optimize my resume keywords for a 95%+ ATS score?" },
  { id: "prep", label: "Interview Drill", icon: Target, prompt: "🎯 Give me 3 high-bar technical interview questions for full-stack developer" },
];

const DEFAULT_PROMPTS = [
  "💼 Show active Tech & Remote Jobs",
  "⚡ How to score 90%+ on Resume ATS?",
  "🎯 Practice 3 Technical Interview Questions",
  "✍️ Write a high-converting Cover Letter",
];

/* ── Platform Action Cards Dictionary ── */
const ACTION_PREVIEWS = {
  RESUME_BUILDER: {
    icon: FileText,
    badge: "Resume Tool",
    title: "Interactive Resume Builder",
    description: "Build a sleek, ATS-optimized CV with live real-time preview and instant PDF export.",
    cta: "Launch Builder",
    color: "from-indigo-500/10 to-violet-500/10 border-indigo-500/20 text-indigo-500",
  },
  ATS_TIP: {
    icon: Sparkles,
    badge: "AI Analysis",
    title: "AI Resume & ATS Analyzer",
    description: "Scan your resume against job requirements to detect missing keywords and boost your match rate.",
    cta: "Scan Resume",
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-500",
  },
  INTERVIEW_DRILL: {
    icon: Target,
    badge: "Interview Prep",
    title: "AI Mock Interview Practice",
    description: "Practice technical and behavioral questions tailored to your target job title with instant scoring.",
    cta: "Start Drill",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-500",
  },
  APPLICATIONS: {
    icon: Briefcase,
    badge: "Applications",
    title: "Application Pipeline Tracker",
    description: "Review submitted applications, recruiter review stages, and interview invites in one dashboard.",
    cta: "View Pipeline",
    color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-500",
  },
  SAVED_JOBS: {
    icon: Bookmark,
    badge: "Saved Jobs",
    title: "Saved Opportunities",
    description: "Quickly access and apply to bookmarked positions before applications close.",
    cta: "View Saved Jobs",
    color: "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-500",
  },
  PROFILE: {
    icon: Compass,
    badge: "Profile",
    title: "Update Skills & Profile",
    description: "Add your latest tech stack, education, and achievements to receive higher relevance scores.",
    cta: "Edit Profile",
    color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-500",
  },
  INTERVIEWS: {
    icon: Target,
    badge: "Live Rounds",
    title: "Scheduled Interviews",
    description: "Check upcoming interview dates, round formats, and hiring manager instructions.",
    cta: "Open Timeline",
    color: "from-emerald-500/10 to-indigo-500/10 border-emerald-500/20 text-emerald-500",
  },
};

/* ── Rich Markdown Formatter with Copyable Code blocks, Callouts & Headers ── */
function FormattedMessageText({ text }) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  if (!text) return null;

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const lines = text.split("\n");
  return (
    <div className="space-y-2 leading-relaxed text-xs">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Detect code block backticks `code` or ```
        if (trimmed.startsWith("```") || trimmed.endsWith("```")) {
          const codeSnippet = trimmed.replace(/```/g, "").trim();
          return (
            <div key={idx} className="relative my-2.5 rounded-xl bg-slate-900 border border-slate-700/60 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto shadow-inner">
              <button
                type="button"
                onClick={() => handleCopyCode(codeSnippet, idx)}
                className="absolute right-2 top-2 rounded-lg bg-slate-800 border border-slate-700 px-2 py-0.5 text-[9px] text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                {copiedCodeIdx === idx ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                {copiedCodeIdx === idx ? "Copied" : "Copy"}
              </button>
              <code>{codeSnippet}</code>
            </div>
          );
        }

        // Markdown Headings (### or ##)
        if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
          const headingText = trimmed.replace(/^#{2,3}\s*/, "");
          return (
            <h5 key={idx} className="font-extrabold text-[13px] text-heading font-satoshi pt-1 pb-0.5 flex items-center gap-1.5 border-b border-border/40">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {headingText}
            </h5>
          );
        }

        // Callout boxes (💡 Tip:, ⚡ Note:, 🚀, ⚠️)
        if (
          trimmed.startsWith("💡") ||
          trimmed.startsWith("⚡") ||
          trimmed.startsWith("🚀") ||
          trimmed.startsWith("⚠️") ||
          trimmed.startsWith(">")
        ) {
          const calloutText = trimmed.replace(/^>\s*/, "");
          return (
            <div key={idx} className="my-2 rounded-xl bg-primary/10 border border-primary/25 p-2.5 text-heading font-medium text-[11px] flex items-start gap-2 shadow-xs">
              <Info size={14} className="text-primary shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{calloutText}</div>
            </div>
          );
        }

        // Numbered list (1. , 2. )
        const isNumbered = /^\d+\.\s+/.test(trimmed);
        if (isNumbered) {
          const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numberMatch) {
            const num = numberMatch[1];
            const content = numberMatch[2];
            return (
              <div key={idx} className="flex items-start gap-2 pl-0.5 my-1">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-[10px] mt-0.5">
                  {num}
                </span>
                <span className="flex-1 text-body font-medium">{formatInlineTokens(content)}</span>
              </div>
            );
          }
        }

        // Bullet points (•, -, *)
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("* ");
        if (isBullet) {
          const content = trimmed.replace(/^[•\-\*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 my-0.5">
              <span className="text-primary font-black text-sm leading-none mt-0.5">•</span>
              <span className="flex-1 text-body">{formatInlineTokens(content)}</span>
            </div>
          );
        }

        return <p key={idx} className="text-body">{formatInlineTokens(line)}</p>;
      })}
    </div>
  );
}

/* Helper to parse **bold** and `code` inline tokens */
function formatInlineTokens(str) {
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={pIdx} className="font-extrabold text-heading">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={pIdx} className="rounded bg-primary/10 px-1 py-0.5 text-[11px] font-mono text-primary border border-primary/20">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/* Clean markdown for text-to-speech */
function cleanTextForTTS(rawText) {
  return rawText
    .replace(/[*#`_~>]/g, "")
    .replace(/•/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function FloatingAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState("all");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [followUps, setFollowUps] = useState(DEFAULT_PROMPTS);
  const [showFollowUps, setShowFollowUps] = useState(true);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [feedback, setFeedback] = useState({});

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const location = useLocation();

  const user = useSelector((state) => state.auth?.user);
  const CHAT_STORAGE_KEY = "jobportal_copilot_chat_history";

  // Initialize personalized greeting or restore persisted chat on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to restore copilot chat:", e);
    }

    const greetingName = user?.name ? ` ${user.name.split(" ")[0]}` : "";
    setMessages([
      {
        id: 1,
        sender: "ai",
        timestamp: "Just now",
        text: `Hello${greetingName}! I'm your **JobPortal AI Career Copilot**. I can help you discover matching jobs, optimize your resume for ATS screening, drill technical interview questions, and track your applications.\n\nHow can I assist your career search today?`,
        matchedJobs: [],
        suggestedFollowUps: DEFAULT_PROMPTS,
      },
    ]);
  }, [user]);

  // Persist messages to sessionStorage (last 25 messages)
  useEffect(() => {
    if (messages && messages.length > 0) {
      try {
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-25)));
      } catch (e) {
        // storage quota full or restricted
      }
    }
  }, [messages]);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowTooltip(false);
    }
  }, [messages, isOpen, isTyping]);

  // Clean up speech synthesis on unmount or close
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice Dictation (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) {
      toast.warning("Voice speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // Recognition unavailable or denied
      }
    }
  };

  // Text to Speech narration handler
  const handleToggleSpeak = (msgId, text) => {
    if (!window.speechSynthesis) {
      toast.warning("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = cleanTextForTTS(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleFeedback = (msgId, type) => {
    setFeedback((prev) => ({ ...prev, [msgId]: type }));
    toast.success(type === "up" ? "Thanks for your feedback! 👍" : "Feedback noted. We will improve! 🙏");
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = {
      id: Date.now(),
      sender: "user",
      timestamp: timeStr,
      text: query,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // Prepare rolling conversation history
    const historyPayload = newMessages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const response = await sendCopilotMessageApi({
        message: query,
        history: historyPayload,
        activePage: location.pathname,
      });

      const copilotData = response.data?.data;
      const aiReply = copilotData?.reply || "I've analyzed your request and our AI intelligence engine is ready.";
      const matchedJobs = copilotData?.matchedJobs || [];
      const actionType = copilotData?.actionType;
      // Handle actionLink as string or object { label, url }
      const actionLink = typeof copilotData?.actionLink === "object"
        ? copilotData?.actionLink?.url
        : copilotData?.actionLink;
      const newFollowUps =
        copilotData?.suggestedFollowUps?.length > 0
          ? copilotData.suggestedFollowUps
          : [];

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: aiReply,
          matchedJobs: matchedJobs,
          actionType: actionType,
          actionLink: actionLink,
          suggestedFollowUps: newFollowUps,
        },
      ]);
      setFollowUps(newFollowUps);
      setShowFollowUps(true);
    } catch (err) {
      const fallbackPrompts = DEFAULT_PROMPTS.slice(0, 3);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: "I'm connected to JobPortal's AI engine. You can browse active roles in **Find Jobs**, evaluate your ATS match in **Career Hub**, or ask me specific technical interview drill questions!",
          matchedJobs: [],
          actionType: "NONE",
          actionLink: null,
          suggestedFollowUps: fallbackPrompts,
        },
      ]);
      setFollowUps(fallbackPrompts);
      setShowFollowUps(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleExportChat = () => {
    const chatContent = messages
      .map((m) => `[${m.timestamp || "Time"}] ${m.sender === "user" ? "You" : "AI Copilot"}:\n${m.text}\n`)
      .join("\n---\n\n");
    const blob = new Blob([chatContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `JobPortal_AI_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Conversation downloaded!");
  };

  const handleClearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMsgId(null);
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (e) {}
    const greetingName = user?.name ? ` ${user.name.split(" ")[0]}` : "";
    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        timestamp: "Just now",
        text: `Conversation cleared. What would you like to explore next${greetingName}?`,
        matchedJobs: [],
        suggestedFollowUps: DEFAULT_PROMPTS,
      },
    ]);
    setFollowUps(DEFAULT_PROMPTS);
    setShowFollowUps(true);
  };

  const handleModeClick = (mode) => {
    setActiveMode(mode.id);
    handleSend(mode.prompt);
  };

  const hasStickyBottomBar =
    location.pathname.startsWith("/jobs/") ||
    location.pathname.startsWith("/apply-jobs") ||
    location.pathname.includes("resume-builder");

  return (
    <aside
      className="fixed right-3 sm:right-8 bottom-20 sm:bottom-10 z-50 font-inter pointer-events-none transition-all duration-300"
      aria-label="JobPortal AI Career Copilot"
    >
      <div className="relative pointer-events-auto flex flex-col items-end">
        {/* ── Chat Window Drawer ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed inset-x-2.5 bottom-2 sm:static sm:inset-auto mb-0 sm:mb-4 rounded-3xl border border-border bg-surface/98 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.95)] flex flex-col text-heading overflow-hidden origin-bottom-right transition-all duration-300 z-50 ${
                isExpanded
                  ? "w-auto sm:w-[640px] h-[min(680px,calc(100dvh-20px))] sm:h-[min(680px,calc(100dvh-90px))]"
                  : "w-auto sm:w-[420px] h-[min(580px,calc(100dvh-24px))] sm:h-[min(580px,calc(100dvh-110px))]"
              }`}
            >
              {/* ── Top Header ── */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0 bg-surface">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/20">
                    <BotAvatarIcon className="w-6 h-6 text-white" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-surface shadow-sm animate-pulse" />
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-heading font-satoshi flex items-center gap-1.5">
                      JobPortal AI Copilot
                      <CheckCircle2 size={13} className="text-emerald-500" />
                    </h4>
                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5 font-satoshi">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LLaMA 3.3 70B • Real-time DB Context
                    </p>
                  </div>
                </div>

                {/* Header Action Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleExportChat}
                    title="Export conversation"
                    className="rounded-xl p-1.5 text-muted hover:bg-surface-hover hover:text-heading transition cursor-pointer"
                  >
                    <Download size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Collapse View" : "Expand Widescreen"}
                    className="hidden sm:inline-flex rounded-xl p-1.5 text-muted hover:bg-surface-hover hover:text-heading transition cursor-pointer"
                  >
                    {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearChat}
                    title="Clear Conversation"
                    className="rounded-xl p-1.5 text-muted hover:bg-surface-hover hover:text-rose-500 transition cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                      setSpeakingMsgId(null);
                      setIsOpen(false);
                    }}
                    aria-label="Close Chat"
                    className="rounded-xl p-1.5 text-muted hover:bg-surface-hover hover:text-heading transition cursor-pointer"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* ── Mode Capabilities Quick Switcher Bar ── */}
              <div className="px-3 py-2 border-b border-border bg-surface-elevated/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {COPILOT_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleModeClick(mode)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "border border-border bg-surface text-muted hover:text-heading hover:bg-surface-hover"
                      }`}
                    >
                      <Icon size={11} className={isActive ? "text-white" : "text-muted"} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Messages Body ── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {messages.map((msg, index) => {
                  const isLatestAiMsg =
                    msg.sender === "ai" &&
                    index === messages.map((m) => m.sender).lastIndexOf("ai");

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1.5 ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`group relative flex gap-2.5 max-w-[92%] ${
                          msg.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.sender === "ai" && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mt-0.5 shadow-2xs">
                            <BotAvatarIcon className="w-4 h-4 text-primary" />
                          </div>
                        )}

                        <div
                          className={`rounded-2xl p-3.5 leading-relaxed text-xs shadow-sm relative transition-all ${
                            msg.sender === "user"
                              ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-tr-xs font-medium font-satoshi shadow-md"
                              : "bg-surface-elevated border border-border text-body rounded-tl-xs font-normal"
                          }`}
                        >
                          <FormattedMessageText text={msg.text} />

                          {/* Action Link CTA if provided by AI (e.g. Analyze Resume, Browse Jobs) */}
                          {msg.actionLink && (
                            <div className="mt-3 pt-2.5 border-t border-border/50">
                              <Link
                                to={msg.actionLink.url}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:scale-[1.02] transition cursor-pointer"
                              >
                                <span>{msg.actionLink.label}</span>
                                <ArrowUpRight size={12} />
                              </Link>
                            </div>
                          )}

                          {/* Interactive Toolbar for AI replies: Copy, TTS, Feedback */}
                          {msg.sender === "ai" && (
                            <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-[10px] text-muted">
                              <div className="flex items-center gap-1">
                                {/* TTS Voice Narration */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleSpeak(msg.id, msg.text)}
                                  title={speakingMsgId === msg.id ? "Stop voice narration" : "Listen to answer"}
                                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 transition cursor-pointer ${
                                    speakingMsgId === msg.id
                                      ? "bg-primary text-white font-bold shadow-2xs"
                                      : "hover:bg-surface hover:text-heading"
                                  }`}
                                >
                                  {speakingMsgId === msg.id ? (
                                    <>
                                      <VolumeX size={11} className="animate-pulse" />
                                      <span>Speaking...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 size={11} />
                                      <span>Listen</span>
                                    </>
                                  )}
                                </button>

                                {/* Copy button */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyMessage(msg.id, msg.text)}
                                  title="Copy reply"
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 hover:bg-surface hover:text-heading transition cursor-pointer"
                                >
                                  {copiedMsgId === msg.id ? (
                                    <>
                                      <Check size={10} className="text-emerald-500" />
                                      <span className="text-emerald-500 font-semibold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={10} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Thumbs Up / Down Reaction */}
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleFeedback(msg.id, "up")}
                                  title="Helpful answer"
                                  className={`p-1 rounded-lg transition cursor-pointer ${
                                    feedback[msg.id] === "up"
                                      ? "text-emerald-500 bg-emerald-500/15"
                                      : "hover:text-heading hover:bg-surface"
                                  }`}
                                >
                                  <ThumbsUp size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFeedback(msg.id, "down")}
                                  title="Needs improvement"
                                  className={`p-1 rounded-lg transition cursor-pointer ${
                                    feedback[msg.id] === "down"
                                      ? "text-rose-500 bg-rose-500/15"
                                      : "hover:text-heading hover:bg-surface"
                                  }`}
                                >
                                  <ThumbsDown size={11} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[9px] text-muted px-1 font-mono">
                        {msg.timestamp || "Just now"}
                      </span>

                      {/* ── Matched Interactive Job Cards ── */}
                      {msg.matchedJobs && msg.matchedJobs.length > 0 && (
                        <div className="w-full space-y-2 pt-1 pl-9">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                            <Flame size={12} className="text-amber-500" />
                            <span>Matched Opportunities in Database:</span>
                          </div>

                          <div className={`grid gap-2 ${isExpanded ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                            {msg.matchedJobs.map((job) => (
                              <div
                                key={job.id}
                                className="rounded-2xl border border-border bg-surface p-3.5 flex flex-col justify-between gap-3 shadow-sm hover:border-primary/50 hover:bg-surface-hover transition-all group/job"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs">
                                        {(job.companyName || "J").charAt(0)}
                                      </div>
                                      <h5 className="font-black text-heading text-xs font-satoshi line-clamp-1 group-hover/job:text-primary transition">
                                        {job.title}
                                      </h5>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {job.matchScore != null && job.matchScore > 0 && (
                                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold font-mono border ${
                                          job.matchScore >= 80
                                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                            : job.matchScore >= 60
                                            ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                                            : "bg-surface-elevated text-body border-border"
                                        }`}>
                                          🎯 {job.matchScore}% Match
                                        </span>
                                      )}
                                      {job.workMode && (
                                        <span className="rounded-full bg-surface-elevated border border-border px-2 py-0.5 text-[9px] font-bold text-body shrink-0">
                                          {job.workMode}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <p className="text-[11px] font-semibold text-primary truncate pl-9">
                                    {job.companyName}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted pl-9 pt-0.5">
                                    <span className="flex items-center gap-1">
                                      <MapPin size={10} className="text-muted" />
                                      {job.location}
                                    </span>
                                    {job.salary && (
                                      <span className="font-extrabold text-amber-600 dark:text-amber-400 font-satoshi">
                                        {job.salary}
                                      </span>
                                    )}
                                  </div>

                                  {/* Top Skill Tags */}
                                  {job.skills && job.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pl-9 pt-1">
                                      {job.skills.map((skill, sIdx) => (
                                        <span
                                          key={sIdx}
                                          className="inline-block rounded-md bg-surface-elevated border border-border px-1.5 py-0.5 text-[9px] font-medium text-body"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                  <span className="text-[9px] text-muted font-medium">
                                    {job.jobType || "Full-time"}
                                  </span>
                                  <Link
                                    to={`/jobs/${job.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-[10px] font-bold text-white shadow-md hover:scale-105 transition cursor-pointer shrink-0"
                                  >
                                    <span>View Job</span>
                                    <ArrowUpRight size={11} />
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Rich Platform Action Card ── */}
                      {msg.actionType && msg.actionType !== "NONE" && msg.actionType !== "JOBS_LIST" && ACTION_PREVIEWS[msg.actionType] && (
                        <div className="w-full pt-1 pl-9">
                          {(() => {
                            const act = ACTION_PREVIEWS[msg.actionType];
                            const ActIcon = act.icon;
                            const targetLink = msg.actionLink || "/find-jobs";
                            return (
                              <div className={`rounded-2xl border bg-gradient-to-br p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${act.color}`}>
                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface border border-border text-primary shadow-xs mt-0.5">
                                    <ActIcon size={16} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-extrabold text-heading text-xs font-satoshi">
                                        {act.title}
                                      </h5>
                                      <span className="rounded-full bg-surface border border-border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
                                        {act.badge}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-body line-clamp-2 mt-0.5">
                                      {act.description}
                                    </p>
                                  </div>
                                </div>
                                <Link
                                  to={targetLink}
                                  onClick={() => setIsOpen(false)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-3 py-1.5 text-[10px] font-bold shadow-sm hover:opacity-95 hover:scale-[1.02] transition cursor-pointer shrink-0 self-end sm:self-center"
                                >
                                  <span>{act.cta}</span>
                                  <ArrowRight size={11} />
                                </Link>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* ── Inline Suggested Follow-ups on Latest AI Message ── */}
                      {isLatestAiMsg && showFollowUps && !isTyping && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="w-full pl-9 pr-1 pt-1.5 space-y-2"
                        >
                          <div className="flex items-center justify-between px-0.5">
                            <span className="text-[10px] font-black text-primary flex items-center gap-1.5 uppercase tracking-wider font-satoshi">
                              <Sparkles size={11} className="text-amber-500 fill-amber-500/20 animate-pulse" />
                              Suggested Follow-ups
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowFollowUps(false)}
                              title="Dismiss suggestions"
                              className="rounded-lg p-1 text-muted hover:text-heading hover:bg-surface-elevated transition cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {msg.suggestedFollowUps.slice(0, 3).map((prompt, pIdx) => {
                              const cleaned = cleanPromptText(prompt);
                              if (!cleaned) return null;
                              return (
                                <button
                                  key={pIdx}
                                  type="button"
                                  disabled={isTyping}
                                  onClick={() => handleSend(cleaned)}
                                  className="group w-full rounded-2xl border border-border bg-surface px-3 py-2 text-left text-xs font-medium text-body hover:border-primary/50 hover:bg-surface-elevated hover:text-heading transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-start gap-2.5 shadow-2xs hover:shadow-xs"
                                >
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                                  </div>
                                  <span className="leading-snug flex-1 font-medium">{cleaned}</span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}

                {/* ── Typing Indicator Bubble ── */}
                {isTyping && (
                  <div className="flex items-start gap-2.5 max-w-[92%]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mt-0.5 shadow-2xs">
                      <BotAvatarIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="rounded-2xl rounded-tl-xs border border-border bg-surface-elevated px-4 py-2.5 shadow-xs flex items-center gap-3">
                      <div className="flex space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce" />
                      </div>
                      <span className="text-xs font-medium text-muted">AI Copilot is thinking…</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Input Form Bar ── */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 flex items-center gap-2 shrink-0 border-t border-border bg-surface"
              >
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={input}
                    disabled={isTyping}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      isListening
                        ? "Listening to voice input..."
                        : "Ask AI about jobs, ATS resume, interviews…"
                    }
                    className={`w-full rounded-2xl border bg-surface-elevated pl-4 pr-16 py-2.5 text-xs text-heading placeholder-muted outline-none transition ${
                      isListening
                        ? "border-rose-500/70 bg-rose-500/10 animate-pulse"
                        : "border-border focus:border-primary"
                    }`}
                  />

                  <div className="absolute right-2.5 flex items-center gap-1">
                    {/* Suggestions Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowFollowUps((prev) => !prev)}
                      title={showFollowUps ? "Hide suggestions" : "Show suggested follow-ups"}
                      className={`rounded-xl p-1.5 transition cursor-pointer ${
                        showFollowUps
                          ? "text-amber-500 bg-amber-500/15"
                          : "text-muted hover:text-heading hover:bg-surface"
                      }`}
                    >
                      <Sparkles size={14} className={showFollowUps ? "fill-amber-500/20" : ""} />
                    </button>

                    {/* Microphone Dictation Trigger */}
                    <button
                      type="button"
                      onClick={toggleVoiceDictation}
                      title={isListening ? "Stop Voice Input" : "Voice Input (Speech-to-Text)"}
                      className={`rounded-xl p-1.5 transition cursor-pointer ${
                        isListening
                          ? "text-rose-500 bg-rose-500/20"
                          : "text-muted hover:text-heading hover:bg-surface"
                      }`}
                    >
                      {isListening ? <MicOff size={14} className="animate-pulse" /> : <Mic size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md hover:scale-105 transition cursor-pointer shrink-0 disabled:opacity-40 disabled:hover:scale-100"
                >
                  {isTyping ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Floating Launcher Trigger (Callout Pill + 3D Robot Button) ── */}
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {!isOpen && showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                onClick={() => setIsOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-surface/95 px-4 py-2 text-xs font-black text-heading shadow-xl backdrop-blur-xl hover:border-primary/60 hover:scale-105 transition cursor-pointer font-satoshi"
              >
                <Sparkles size={14} className="text-amber-500 fill-amber-500/20 animate-pulse" />
                <span>JobPortal AI Copilot</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle JobPortal AI Career Copilot Chatbot"
            className="group relative flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white shadow-[0_0_40px_rgba(99,102,241,0.7)] border border-white/25 cursor-pointer shrink-0"
          >
            <BotAvatarIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />

            {/* AI Chip Badge */}
            <span className="absolute -top-1 -right-1 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow-md">
              AI
            </span>

            {/* Glowing Neon Ring */}
            <span className="absolute -inset-1.5 rounded-full bg-indigo-500/35 blur-md animate-ping pointer-events-none" />
          </motion.button>
        </div>
      </div>
    </aside>
  );
}

