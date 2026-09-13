/**
 * src/features/notifications/components/NotificationBell.jsx
 *
 * Navbar Bell component with live unread badge, wiggle animation on unread,
 * and smart polling integration.
 */

import React from "react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import { toggleDropdown } from "../slices/notificationSlice";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { useTheme } from "../../../context/ThemeContext";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.notification.dropdownOpen);
  const { theme } = useTheme();
  const isLight = theme === "light";

  // Hook handles smart polling (every 30s) and visibility sync
  const { count, hasUnread } = useUnreadCount(30000);

  const displayCount = count > 99 ? "99+" : count;

  return (
    <div className="relative inline-block">
      {/* CSS Wiggle Keyframes style */}
      <style>{`
        @keyframes bell-wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(4deg); }
        }
        .animate-bell-wiggle {
          animation: bell-wiggle 1.8s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>

      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        type="button"
        onClick={() => dispatch(toggleDropdown())}
        aria-label={`Notifications, ${count} unread`}
        aria-expanded={isOpen}
        className={`relative flex h-9 w-9 items-center justify-center rounded-2xl border transition-all duration-200 cursor-pointer ${
          isOpen
            ? isLight
              ? "border-indigo-300 bg-indigo-50 text-indigo-600 shadow-sm"
              : "border-indigo-500/50 bg-indigo-500/15 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            : isLight
              ? "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 hover:border-slate-300"
              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20"
        }`}
      >
        <Bell
          size={17}
          strokeWidth={1.8}
          className={`transition-transform ${
            hasUnread && !isOpen
              ? "animate-bell-wiggle text-indigo-500"
              : isLight
                ? "text-slate-600"
                : "text-slate-300"
          }`}
        />

        {/* Unread Badge */}
        {hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={count}
            className={`absolute -top-1 -right-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-indigo-600 px-1 text-[10px] font-extrabold !text-white shadow-sm ring-2 ${
              isLight ? "ring-white" : "ring-[#06080f]"
            }`}
          >
            {displayCount}
          </motion.span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      <NotificationDropdown />
    </div>
  );
}
