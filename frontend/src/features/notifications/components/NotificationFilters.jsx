/**
 * src/features/notifications/components/NotificationFilters.jsx
 *
 * Comprehensive filter sidebar / toolbar for the full Notifications Page.
 * Supports debounced keyword search, type pills, priority filters, date pickers,
 * and test notification triggers.
 */

import React, { useState, useEffect } from "react";
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  Plus,
  Calendar,
  Filter,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import { setFilter, resetFilters } from "../slices/notificationSlice";
import { useNotificationActions } from "../hooks/useNotificationActions";

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "NEW_JOB", label: "New Jobs" },
  { value: "JOB_MATCH", label: "Job Matches" },
  { value: "APPLICATION_SUBMITTED", label: "Applied" },
  { value: "APPLICATION_SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interviews" },
  { value: "OFFER_RECEIVED", label: "Offers" },
  { value: "AI_JOB_RECOMMENDATION", label: "AI Recommendations" },
  { value: "COMPANY_UPDATE", label: "Company Updates" },
  { value: "SECURITY", label: "Security & Account" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All Priorities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const READ_STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "false", label: "Unread" },
  { value: "true", label: "Read" },
];

export default function NotificationFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.notification.filters);
  const { createTestNotification, isLoading } = useNotificationActions();

  // Local state for debounced keyword input
  const [searchTerm, setSearchTerm] = useState(filters.keyword || "");

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.keyword) {
        dispatch(setFilter({ keyword: searchTerm }));
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.keyword, dispatch]);

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-heading font-satoshi">Filters</h3>
        </div>

        <button
          onClick={() => {
            setSearchTerm("");
            dispatch(resetFilters());
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-heading transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Keyword Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notifications..."
          className="w-full rounded-2xl border border-border bg-surface-elevated pl-10 pr-4 py-2.5 text-xs text-heading placeholder-muted focus:border-indigo-500 focus:outline-none transition-all"
        />
      </div>

      {/* Read Status Radio / Pills */}
      <div>
        <label className="block text-xs font-semibold text-heading mb-2">
          Read Status
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border">
          {READ_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => dispatch(setFilter({ read: opt.value }))}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filters.read === opt.value
                  ? "!bg-indigo-600 !text-white shadow-sm"
                  : "text-muted hover:text-heading hover:bg-surface"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-heading mb-2">
          Notification Type
        </label>
        <select
          value={filters.type}
          onChange={(e) => dispatch(setFilter({ type: e.target.value }))}
          className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-xs text-heading focus:border-indigo-500 focus:outline-none cursor-pointer"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface text-heading">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filters */}
      <div>
        <label className="block text-xs font-semibold text-heading mb-2">
          Priority
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => dispatch(setFilter({ priority: opt.value }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                filters.priority === opt.value
                  ? "!bg-indigo-600 !text-white border-indigo-500 shadow-sm"
                  : "border-border bg-surface-elevated text-muted hover:border-indigo-500/40 hover:text-heading"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Show Archived Toggle */}
      <div className="flex items-center justify-between py-2 border-t border-border">
        <span className="text-xs font-semibold text-heading">
          Show Archived
        </span>
        <button
          onClick={() => dispatch(setFilter({ archived: !filters.archived }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
            filters.archived ? "bg-indigo-600" : "bg-surface-elevated border border-border"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              filters.archived ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Date Pickers */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="block text-xs font-semibold text-heading">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="block text-[10px] text-muted mb-1 font-bold">From</span>
            <input
              type="date"
              value={filters.fromDate || ""}
              onChange={(e) => dispatch(setFilter({ fromDate: e.target.value }))}
              className="w-full rounded-xl border border-border bg-surface-elevated px-2.5 py-1.5 text-[11px] text-heading focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <span className="block text-[10px] text-muted mb-1 font-bold">To</span>
            <input
              type="date"
              value={filters.toDate || ""}
              onChange={(e) => dispatch(setFilter({ toDate: e.target.value }))}
              className="w-full rounded-xl border border-border bg-surface-elevated px-2.5 py-1.5 text-[11px] text-heading focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Test Notification Generator Button */}
      <div className="pt-3 border-t border-border">
        <button
          onClick={() => createTestNotification("JOB_MATCH")}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 py-2.5 px-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-all cursor-pointer disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Generate Test Notification</span>
        </button>
      </div>
    </div>
  );
}
