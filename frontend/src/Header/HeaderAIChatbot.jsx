/**
 * src/Header/HeaderAIChatbot.jsx
 *
 * Ultra-Premium AI Chatbot Widget integrated into the Top Header.
 * Renders a glowing 3D Bot Avatar trigger button with a popover chat window
 * anchored directly beneath the main navigation bar.
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, CheckCircle2, RefreshCw, Sparkles, Copy, Check, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function BotAvatarIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="2" r="1.5" fill="#F59E0B" />
      <rect x="4" y="6" width="16" height="12" rx="4" fill="url(#botGradientHeader)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      <circle cx="9" cy="11" r="1.5" fill="#38BDF8" />
      <circle cx="15" cy="11" r="1.5" fill="#38BDF8" />
      <path d="M9.5 15C9.5 15 10.75 16.5 12 16.5C13.25 16.5 14.5 15 14.5 15" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="botGradientHeader" x1="4" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "ai",
    text: "Hello! I'm your AI Career Advisor. Ask me anything about job matching, cover letters, or interview prep!",
  },
];

const QUICK_PROMPTS = [
  "✨ Generate AI Cover Letter",
  "⚡ How to boost ATS score?",
  "💼 Show Remote Engineer jobs",
];

export default function HeaderAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  /* Clean up speech on close */
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  /* Outside click listener */
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setSpeakingId(null);
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id, text) => {
    if (!window.speechSynthesis) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { id: Date.now(), sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "I'm analyzing your request against top engineering hiring data...";
      const lower = query.toLowerCase();

      if (lower.includes("cover letter") || lower.includes("generate")) {
        replyText = "I can generate tailored cover letters for any application! Open any job post to generate yours.";
      } else if (lower.includes("ats") || lower.includes("resume")) {
        replyText = "To boost your ATS score above 90%, include exact target role keywords like React 19, TypeScript, and Spring Boot.";
      } else if (lower.includes("remote") || lower.includes("job")) {
        replyText = "We have active Remote & Hybrid engineering roles listed with competitive salaries and instant apply!";
      } else {
        replyText = `Great query on "${query}". Explore active roles in Find Jobs or evaluate your ATS score in the Career Hub!`;
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: replyText }]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* ── Header Trigger Button ── */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Career Assistant"
        className="flex items-center gap-2 rounded-2xl gradient-bg-signature px-3.5 py-1.5 text-xs font-black text-white shadow-button border border-white/20 hover:opacity-95 transition-all cursor-pointer font-satoshi shrink-0"
      >
        <BotAvatarIcon className="w-5 h-5 text-white" />
        <span className="hidden sm:inline">Ask AI</span>
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      </motion.button>

      {/* ── Header Popover Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-3xl border p-4 shadow-2xl z-50 h-[470px] flex flex-col font-inter backdrop-blur-2xl ${
              isLight
                ? "bg-white/98 border-slate-200 text-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.15)]"
                : "bg-[#090d16]/98 border-white/15 text-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between pb-3 border-b shrink-0 ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl gradient-bg-signature shadow-md">
                  <BotAvatarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className={`text-xs font-extrabold font-satoshi flex items-center gap-1 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    JobPortal AI Assistant <CheckCircle2 size={12} className="text-emerald-500" />
                  </h4>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-satoshi">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active & Ready
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setSpeakingId(null);
                  setIsOpen(false);
                }}
                className={`rounded-xl p-1 transition cursor-pointer ${
                  isLight ? "text-slate-400 hover:bg-slate-100 hover:text-slate-900" : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs relative group ${
                      msg.sender === "user"
                        ? "gradient-bg-signature !text-white rounded-tr-none shadow-md font-semibold"
                        : isLight
                        ? "bg-slate-100 border border-slate-200 text-slate-900 rounded-tl-none font-medium"
                        : "bg-white/10 border border-white/10 text-slate-100 rounded-tl-none font-medium"
                    }`}
                  >
                    <span className={msg.sender === "user" ? "!text-white" : "text-heading"}>{msg.text}</span>

                    {msg.sender === "ai" && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-white/10 flex items-center gap-2 text-[10px] text-muted">
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className="hover:text-primary transition flex items-center gap-1 cursor-pointer"
                        >
                          {speakingId === msg.id ? <VolumeX size={11} className="text-primary animate-pulse" /> : <Volume2 size={11} />}
                          <span>{speakingId === msg.id ? "Stop" : "Listen"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-primary transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold">
                  <RefreshCw size={12} className="animate-spin" /> AI is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className={`py-2 flex flex-wrap gap-1.5 shrink-0 border-t ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className={`rounded-xl border px-2.5 py-1 text-[10px] font-bold transition cursor-pointer ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 shadow-xs"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white"
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className={`mt-2 flex items-center gap-2 shrink-0 pt-2 border-t ${
                isLight ? "border-slate-200" : "border-white/10"
              }`}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI anything..."
                className={`flex-1 rounded-2xl border px-3.5 py-2 text-xs outline-none transition ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 shadow-xs"
                    : "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-indigo-500/60"
                }`}
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-xl gradient-bg-signature !text-white shadow-button hover:opacity-90 transition cursor-pointer shrink-0"
              >
                <Send size={13} className="!text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

