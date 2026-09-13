/**
 * src/features/notifications/hooks/useNotificationActions.js
 *
 * Custom hook wrapping RTK Query mutation triggers for notifications.
 * Provides clean action handlers for read, archive, and delete operations.
 */

import { useCallback } from "react";
import {
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useArchiveNotificationMutation,
  useArchiveAllMutation,
  useDeleteNotificationMutation,
  useDeleteAllMutation,
  useCreateTestNotificationMutation,
} from "../api/notificationApi";

export function useNotificationActions() {
  const [markAsReadMutation, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const [markAllAsReadMutation, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation();
  const [archiveMutation, { isLoading: isArchiving }] = useArchiveNotificationMutation();
  const [archiveAllMutation, { isLoading: isArchivingAll }] = useArchiveAllMutation();
  const [deleteMutation, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [deleteAllMutation, { isLoading: isDeletingAll }] = useDeleteAllMutation();
  const [createTestMutation, { isLoading: isCreatingTest }] = useCreateTestNotificationMutation();

  const markAsRead = useCallback(
    async (id) => {
      try {
        await markAsReadMutation(id).unwrap();
      } catch (err) {
        // Handled silently
      }
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation().unwrap();
    } catch (err) {
      // Handled silently
    }
  }, [markAllAsReadMutation]);

  const archiveNotification = useCallback(
    async (id) => {
      try {
        await archiveMutation(id).unwrap();
      } catch (err) {
        // Handled silently
      }
    },
    [archiveMutation]
  );

  const archiveAll = useCallback(async () => {
    try {
      await archiveAllMutation().unwrap();
    } catch (err) {
      // Handled silently
    }
  }, [archiveAllMutation]);

  const deleteNotification = useCallback(
    async (id) => {
      try {
        await deleteMutation(id).unwrap();
      } catch (err) {
        // Handled silently
      }
    },
    [deleteMutation]
  );

  const deleteAll = useCallback(async () => {
    try {
      await deleteAllMutation().unwrap();
    } catch (err) {
      // Handled silently
    }
  }, [deleteAllMutation]);

  const createTestNotification = useCallback(
    async (type = "SYSTEM") => {
      try {
        await createTestMutation({ type }).unwrap();
      } catch (err) {
        // Handled silently
      }
    },
    [createTestMutation]
  );

  return {
    markAsRead,
    markAllAsRead,
    archiveNotification,
    archiveAll,
    deleteNotification,
    deleteAll,
    createTestNotification,
    isLoading:
      isMarkingRead ||
      isMarkingAllRead ||
      isArchiving ||
      isArchivingAll ||
      isDeleting ||
      isDeletingAll ||
      isCreatingTest,
  };
}
