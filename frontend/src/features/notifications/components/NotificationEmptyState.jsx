/**
 * src/features/notifications/components/NotificationEmptyState.jsx
 *
 * Friendly empty state display for Notifications dropdown and page.
 */

import React from "react";
import { BellOff, SearchX, CheckCircle } from "lucide-react";

export default function NotificationEmptyState({
  type = "empty", // "empty" | "search" | "archived"
  title,
  message,
  actionButton,
}) {
  const configs = {
    empty: {
      icon: CheckCircle,
      iconColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      defaultTitle: "You're all caught up!",
      defaultMessage: "No new notifications. We'll alert you when there are updates on jobs, applications, or interviews.",
    },
    search: {
      icon: SearchX,
      iconColor: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
      defaultTitle: "No notifications found",
      defaultMessage: "We couldn't find any notifications matching your filters or search keywords.",
    },
    archived: {
      icon: BellOff,
      iconColor: "text-slate-400 bg-slate-400/10 border-slate-400/20",
      defaultTitle: "No archived notifications",
      defaultMessage: "Notifications you archive will appear here for future reference.",
    },
  };

  const config = configs[type] || configs.empty;
  const IconComponent = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-inner ${config.iconColor}`}
      >
        <IconComponent className="h-8 w-8 animate-pulse" />
      </div>
      <h3 className="text-base font-bold text-heading font-satoshi">
        {title || config.defaultTitle}
      </h3>
      <p className="mt-1.5 max-w-sm text-xs text-muted leading-relaxed font-medium">
        {message || config.defaultMessage}
      </p>
      {actionButton && <div className="mt-5">{actionButton}</div>}
    </div>
  );
}
