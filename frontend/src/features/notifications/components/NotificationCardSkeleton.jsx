/**
 * src/features/notifications/components/NotificationCardSkeleton.jsx
 *
 * Skeleton loader component for notification list items.
 */

import React from "react";

export default function NotificationCardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 animate-pulse"
        >
          {/* Icon skeleton */}
          <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10" />

          {/* Text content skeleton */}
          <div className="flex-1 space-y-2 py-0.5">
            <div className="flex items-center justify-between gap-4">
              <div className="h-4 w-1/3 rounded bg-white/10" />
              <div className="h-3 w-16 rounded bg-white/5" />
            </div>
            <div className="h-3.5 w-5/6 rounded bg-white/10" />
            <div className="h-3 w-2/3 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
