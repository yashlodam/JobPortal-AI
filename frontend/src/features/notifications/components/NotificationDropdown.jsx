/**
 * src/features/notifications/components/NotificationDropdown.jsx
 *
 * Floating dropdown panel (desktop) / Bottom sheet modal (mobile)
 * rendering real-time notification feeds with tab filtering and quick actions.
 */

import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCheck,
  Archive,
  ArrowRight,
  X,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import {
  setActiveTab,
  setDropdownOpen,
} from "../slices/notificationSlice";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useSearchNotificationsQuery,
} from "../api/notificationApi";
import { useNotificationActions } from "../hooks/useNotificationActions";
import NotificationCard from "./NotificationCard";
import NotificationCardSkeleton from "./NotificationCardSkeleton";
import NotificationEmptyState from "./NotificationEmptyState";

export default function NotificationDropdown() {
  const dispatch = useAppDispatch();
  const dropdownRef = useRef(null);

  const isOpen = useAppSelector((state) => state.notification.dropdownOpen);
  const activeTab = useAppSelector((state) => state.notification.activeTab);
  const unreadCount = useAppSelector((state) => state.notification.unreadCount);

  const { markAllAsRead, archiveAll, createTestNotification, isLoading: isActionLoading } =
    useNotificationActions();

  // Determine query parameters based on activeTab
  const isUnreadTab = activeTab === "unread";
  const isArchivedTab = activeTab === "archived";

  const {
    data: allData,
    isLoading: isAllLoading,
    isFetching: isAllFetching,
  } = useGetNotificationsQuery(
    { page: 0, size: 15 },
    { skip: !isOpen || isUnreadTab || isArchivedTab }
  );

  const {
    data: unreadData,
    isLoading: isUnreadLoading,
    isFetching: isUnreadFetching,
  } = useGetUnreadNotificationsQuery(
    { page: 0, size: 15 },
    { skip: !isOpen || !isUnreadTab }
  );

  const {
    data: archivedData,
    isLoading: isArchivedLoading,
    isFetching: isArchivedFetching,
  } = useSearchNotificationsQuery(
    { archived: true, page: 0, size: 15 },
    { skip: !isOpen || !isArchivedTab }
  );

  // Close on Escape key or outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        dispatch(setDropdownOpen(false));
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Only close if click wasn't on bell icon button
        if (!e.target.closest("#notification-bell-btn")) {
          dispatch(setDropdownOpen(false));
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  // Active dataset
  const activeData = isUnreadTab
    ? unreadData
    : isArchivedTab
    ? archivedData
    : allData;

  const notifications = activeData?.data?.content || activeData?.content || [];
  const isLoading = isUnreadTab
    ? isUnreadLoading || isUnreadFetching
    : isArchivedTab
    ? isArchivedLoading || isArchivedFetching
    : isAllLoading || isAllFetching;

  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", count: unreadCount },
    { id: "archived", label: "Archived" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          role="dialog"
          aria-modal="true"
          aria-label="Notifications Panel"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="fixed md:absolute right-2 md:right-0 top-16 md:top-full mt-2 w-[calc(100vw-1rem)] sm:w-[420px] max-h-[85vh] flex flex-col rounded-3xl border border-border bg-surface backdrop-blur-2xl shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-heading font-satoshi tracking-tight">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => createTestNotification()}
                title="Create Test Notification"
                aria-label="Create test notification"
                className="p-1.5 text-muted hover:text-heading hover:bg-surface-elevated rounded-xl transition-colors cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
              </button>

              <button
                onClick={() => dispatch(setDropdownOpen(false))}
                className="p-1.5 text-muted hover:text-heading hover:bg-surface-elevated rounded-xl transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Row & Tabs */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-surface-elevated/40">
            {/* Tabs */}
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => dispatch(setActiveTab(tab.id))}
                  className={`relative px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "!bg-indigo-600 !text-white shadow-sm"
                      : "text-muted hover:text-heading hover:bg-surface-elevated"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`ml-1.5 text-[10px] font-extrabold ${activeTab === tab.id ? "!text-white" : "text-indigo-600 dark:text-indigo-400"}`}>
                      ({tab.count})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  disabled={isActionLoading}
                  className="flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}

              <button
                onClick={() => archiveAll()}
                disabled={isActionLoading}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer disabled:opacity-50"
                title="Archive all"
              >
                <Archive className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Archive all</span>
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[420px] scrollbar-thin scrollbar-thumb-border">
            {isLoading ? (
              <NotificationCardSkeleton count={4} />
            ) : notifications.length === 0 ? (
              <NotificationEmptyState
                type={isArchivedTab ? "archived" : "empty"}
              />
            ) : (
              <AnimatePresence mode="popLayout">
                {notifications.map((item) => (
                  <NotificationCard
                    key={item.id}
                    notification={item}
                    onCloseDropdown={() => dispatch(setDropdownOpen(false))}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-surface text-center">
            <Link
              to="/notifications"
              onClick={() => dispatch(setDropdownOpen(false))}
              className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-all group"
            >
              <span>View all notifications</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
