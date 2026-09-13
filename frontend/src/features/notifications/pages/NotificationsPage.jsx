/**
 * src/features/notifications/pages/NotificationsPage.jsx
 *
 * Full dedicated Notifications Page (`/notifications`) with advanced filtering,
 * debounced search, stats summary, bulk actions, and pagination.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Inbox,
} from "lucide-react";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import {
  setPage,
  toggleSelectId,
  clearSelection,
} from "../slices/notificationSlice";
import {
  useSearchNotificationsQuery,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
} from "../api/notificationApi";
import { useNotificationActions } from "../hooks/useNotificationActions";
import NotificationCard from "../components/NotificationCard";
import NotificationCardSkeleton from "../components/NotificationCardSkeleton";
import NotificationEmptyState from "../components/NotificationEmptyState";
import NotificationFilters from "../components/NotificationFilters";
import NotificationBulkActions from "../components/NotificationBulkActions";

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.notification.filters);
  const selectedIds = useAppSelector((state) => state.notification.selectedIds);
  const { markAllAsRead, archiveAll, deleteAll, isLoading: isActionLoading } =
    useNotificationActions();
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Fetch unread count for stats bar
  const { data: countData } = useGetUnreadCountQuery();
  const unreadCount = countData?.data?.count ?? countData?.count ?? 0;

  // Search query with active filters
  const { data: searchData, isLoading, isFetching } = useSearchNotificationsQuery(filters);

  // Extract page results
  const pageResult = searchData?.data || searchData || {};
  const notifications = pageResult.content || [];
  const totalElements = pageResult.totalElements || 0;
  const totalPages = pageResult.totalPages || 0;
  const currentPage = pageResult.number ?? filters.page ?? 0;

  const visibleIds = notifications.map((n) => n.id);

  // Clear selections when filters or page change
  useEffect(() => {
    dispatch(clearSelection());
  }, [filters, dispatch]);

  return (
    <div className="relative min-h-screen bg-background font-inter text-body py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 mesh-gradient" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-24 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[180px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/4 blur-[140px]"
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header & Stats Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <Bell className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-heading font-satoshi tracking-tight">
                  Notifications
                </h1>
                <p className="text-xs sm:text-sm text-muted mt-0.5">
                  Stay updated on your job applications, interviews, and recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 bg-surface border border-border p-2 rounded-2xl shadow-sm">
            <div className="px-4 py-1.5 text-center border-r border-border">
              <span className="block text-xs text-muted">Total</span>
              <span className="text-base font-extrabold text-heading font-satoshi">
                {totalElements}
              </span>
            </div>
            <div className="px-4 py-1.5 text-center border-r border-border">
              <span className="block text-xs text-muted">Unread</span>
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-satoshi">
                {unreadCount}
              </span>
            </div>
            <div className="px-4 py-1.5 text-center">
              <span className="block text-xs text-muted">Mode</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-satoshi">
                {filters.archived ? "Archived" : "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Global Page Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                disabled={isActionLoading}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={() => archiveAll()}
              disabled={isActionLoading}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-body hover:bg-surface-elevated hover:text-heading transition-all cursor-pointer disabled:opacity-50"
            >
              <Archive className="h-4 w-4" />
              <span>Archive All</span>
            </button>
          </div>

          <button
            onClick={() => setShowDeleteAllConfirm(true)}
            disabled={isActionLoading}
            className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete All</span>
          </button>
        </div>

        {/* Main Grid: Left Filter Panel + Right Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1">
            <NotificationFilters />
          </div>

          {/* Right Main Feed */}
          <div className="lg:col-span-3 space-y-4">
            {/* Bulk Actions Bar */}
            <NotificationBulkActions visibleIds={visibleIds} />

            {/* List / Skeleton / Empty State */}
            {isLoading || isFetching ? (
              <NotificationCardSkeleton count={5} />
            ) : notifications.length === 0 ? (
              <NotificationEmptyState
                type={filters.keyword ? "search" : filters.archived ? "archived" : "empty"}
              />
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <NotificationCard
                      key={item.id}
                      notification={item}
                      selectable={true}
                      isSelected={selectedIds.includes(item.id)}
                      onToggleSelect={(id) => dispatch(toggleSelectId(id))}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <p className="text-xs text-muted">
                  Page <span className="font-bold text-heading">{currentPage + 1}</span> of{" "}
                  <span className="font-bold text-heading">{totalPages}</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 0 || isLoading}
                    onClick={() => dispatch(setPage(currentPage - 1))}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-heading disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <button
                    disabled={currentPage >= totalPages - 1 || isLoading}
                    onClick={() => dispatch(setPage(currentPage + 1))}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-heading disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        opened={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={() => {
          setShowDeleteAllConfirm(false);
          deleteAll();
        }}
        title="Delete All Notifications"
        description="Are you sure you want to delete all notifications? This action cannot be undone."
        confirmLabel="Delete All"
        variant="danger"
      />
    </div>
  );
}
