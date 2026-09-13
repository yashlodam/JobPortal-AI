import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, PlusCircle, Sparkles, MessageSquare, ShieldCheck, Clock } from "lucide-react";
import NotificationBell from "../../../features/notifications/components/NotificationBell";
import ProfileMenu from "../../../Header/ProfileMenu";
import { useAppSelector } from "../../../State/Store";
import { getUnreadCountApi } from "../../../api/chatApi";
import { useTheme } from "../../../context/ThemeContext";

export default function RecruiterNavbar({ onOpenMobileSidebar }) {
  const user = useAppSelector((state) => state.auth.profile);
  const { recruiterVerification } = useAppSelector((state) => state.verification);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme } = useTheme();
  const isLight = theme === "light";

  const verificationStatus = (
    recruiterVerification?.status ||
    recruiterVerification?.data?.status ||
    user?.verificationStatus ||
    user?.status ||
    "PENDING_VERIFICATION"
  ).toUpperCase();

  const isApproved = verificationStatus === "APPROVED" || verificationStatus === "VERIFIED";

  useEffect(() => {
    if (!user || !isApproved) return;
    const fetchUnread = () => {
      getUnreadCountApi().then(setUnreadCount).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, isApproved]);

  return (
    <header className={`sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-4 sm:px-6 backdrop-blur-2xl transition-colors duration-300 ${
      isLight ? "bg-white/95 border-slate-200" : "bg-[#070b12]/80 border-white/10"
    }`}>
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className={`flex md:hidden h-10 w-10 items-center justify-center rounded-xl border transition cursor-pointer ${
            isLight
              ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-4">
        {/* Post Job Quick CTA */}
        <Link
          to={isApproved ? "/upload-job" : "/recruiter/verification"}
          className={`hidden lg:flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold !text-white shadow-md transition-all ${
            isApproved
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-500/20 hover:scale-105"
              : "bg-indigo-900/40 hover:bg-indigo-900/60 !text-slate-200"
          }`}
        >
          {isApproved ? <PlusCircle className="h-4 w-4 !text-white" /> : <ShieldCheck className="h-4 w-4 text-amber-400" />}
          <span className="!text-white">{isApproved ? "Post Job" : "Verification Required"}</span>
        </Link>

        {/* Verification / Role Badge */}
        {isApproved ? (
          <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${
            isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Verified Recruiter
          </span>
        ) : (
          <Link
            to="/recruiter/verification"
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold transition cursor-pointer ${
              isLight ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" : "bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
            }`}
          >
            <Clock className="h-3 w-3 animate-pulse text-amber-500" /> Pending Review
          </Link>
        )}

        {/* Messages Quick Icon Button (for approved recruiters) */}
        {isApproved && (
          <button
            type="button"
            onClick={() => navigate("/recruiter/messages")}
            title="Candidate Messages"
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition cursor-pointer ${
              isLight
                ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <MessageSquare size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-lg animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* Profile Menu */}
        <ProfileMenu />
      </div>
    </header>
  );
}
