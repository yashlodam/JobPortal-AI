/**
 * src/features/notifications/components/NotificationBulkActions.jsx
 *
 * Bulk actions bar for selecting and performing batch actions on notifications.
 */

import React from "react";
import { CheckCheck, Archive, Trash2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import { selectAllIds, clearSelection } from "../slices/notificationSlice";
import { useNotificationActions } from "../hooks/useNotificationActions";

export default function NotificationBulkActions({ visibleIds = [] }) {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector((state) => state.notification.selectedIds);
  const { markAsRead, archiveNotification, deleteNotification, isLoading } =
    useNotificationActions();

  const isAllSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAllIds(visibleIds));
    }
  };

  const handleBulkMarkRead = async () => {
    for (const id of selectedIds) {
      await markAsRead(id);
    }
    dispatch(clearSelection());
  };

  const handleBulkArchive = async () => {
    for (const id of selectedIds) {
      await archiveNotification(id);
    }
    dispatch(clearSelection());
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteNotification(id);
    }
    dispatch(clearSelection());
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-md">
      {/* Select All Checkbox & Counter */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-heading cursor-pointer">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleToggleSelectAll}
            className="h-4 w-4 rounded border-border bg-surface-elevated text-primary focus:ring-primary/40 cursor-pointer"
          />
          <span>Select page ({visibleIds.length})</span>
        </label>

        {selectedIds.length > 0 && (
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/25">
            {selectedIds.length} selected
          </span>
        )}
      </div>

      {/* Bulk Action Buttons */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkMarkRead}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark Read</span>
          </button>

          <button
            onClick={handleBulkArchive}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Archive</span>
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>

          <button
            onClick={() => dispatch(clearSelection())}
            className="p-1.5 text-muted hover:text-heading rounded-lg hover:bg-surface-hover transition-colors"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

