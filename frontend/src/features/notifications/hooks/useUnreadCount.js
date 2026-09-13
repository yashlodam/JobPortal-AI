/**
 * src/features/notifications/hooks/useUnreadCount.js
 *
 * Custom hook for smart polling the unread notification count.
 * Automatically pauses polling when the browser tab is hidden to conserve bandwidth,
 * and resumes when the tab regains focus/visibility.
 */

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../State/Store";
import { useGetUnreadCountQuery } from "../api/notificationApi";
import { setUnreadCount } from "../slices/notificationSlice";

export function useUnreadCount(pollIntervalMs = 30000) {
  const dispatch = useAppDispatch();
  const isAuthenticated = Boolean(useAppSelector((state) => state.auth.profile));
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document !== "undefined" ? document.visibilityState === "visible" : true
  );

  // Poll only when tab is visible and user is authenticated
  const { data, refetch, isError, isLoading } = useGetUnreadCountQuery(undefined, {
    pollingInterval: isTabVisible && isAuthenticated ? pollIntervalMs : 0,
    skip: !isAuthenticated,
  });

  // Handle visibility change
  useEffect(() => {
    const handleVisibility = () => {
      const visible = document.visibilityState === "visible";
      setIsTabVisible(visible);
      if (visible && isAuthenticated) {
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [refetch, isAuthenticated]);

  // Sync count to Redux store
  useEffect(() => {
    if (data?.data) {
      dispatch(
        setUnreadCount({
          count: data.data.count ?? 0,
          hasUnread: data.data.hasUnread ?? data.data.count > 0,
        })
      );
    } else if (data?.count !== undefined) {
      dispatch(
        setUnreadCount({
          count: data.count,
          hasUnread: data.hasUnread ?? data.count > 0,
        })
      );
    }
  }, [data, dispatch]);

  const count = data?.data?.count ?? data?.count ?? 0;
  const hasUnread = data?.data?.hasUnread ?? data?.hasUnread ?? count > 0;

  return {
    count,
    hasUnread,
    refetch,
    isError,
    isLoading,
  };
}
