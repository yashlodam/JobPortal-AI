/**
 * src/features/notifications/api/notificationApi.js
 *
 * RTK Query API service for Velora Notification System.
 * Handles cache invalidation for notification lists and unread count tags.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      // Attach Bearer token from localStorage for dual-mode cross-origin authentication
      try {
        const token = localStorage.getItem("jobportal_token");
        if (token && !headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      } catch {
        // Non-browser or storage restricted
      }

      // Attach CSRF token if present in cookie
      const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
      if (match) {
        headers.set("X-XSRF-TOKEN", decodeURIComponent(match[1]));
      }
      return headers;
    },
  }),
  tagTypes: ["Notifications", "UnreadCount"],

  endpoints: (builder) => ({
    // 1. Paginated active feed (all)
    getNotifications: builder.query({
      query: ({ page = 0, size = 20, sort = "createdAt,desc" } = {}) => ({
        url: "/notifications",
        params: { page, size, sort },
      }),
      providesTags: (result) =>
        result?.data?.content
          ? [
              ...result.data.content.map(({ id }) => ({ type: "Notifications", id })),
              { type: "Notifications", id: "LIST" },
            ]
          : [{ type: "Notifications", id: "LIST" }],
    }),

    // 2. Single notification by ID
    getNotificationById: builder.query({
      query: (id) => `/notifications/${id}`,
      providesTags: (result, error, id) => [{ type: "Notifications", id }],
    }),

    // 3. Paginated unread feed
    getUnreadNotifications: builder.query({
      query: ({ page = 0, size = 20 } = {}) => ({
        url: "/notifications/unread",
        params: { page, size },
      }),
      providesTags: ["Notifications", "UnreadCount"],
    }),

    // 4. Unread count badge query
    getUnreadCount: builder.query({
      query: () => "/notifications/unread-count",
      providesTags: ["UnreadCount"],
    }),

    // 5. Search and filter notifications
    searchNotifications: builder.query({
      query: (params = {}) => {
        const queryParams = {};
        if (params.keyword) queryParams.keyword = params.keyword;
        if (params.type && params.type !== "ALL") queryParams.type = params.type;
        if (params.priority && params.priority !== "ALL") queryParams.priority = params.priority;
        if (params.read !== undefined && params.read !== "ALL") queryParams.read = params.read;
        if (params.archived !== undefined) queryParams.archived = params.archived;
        if (params.fromDate) queryParams.fromDate = params.fromDate;
        if (params.toDate) queryParams.toDate = params.toDate;
        queryParams.page = params.page ?? 0;
        queryParams.size = params.size ?? 20;

        return {
          url: "/notifications/search",
          params: queryParams,
        };
      },
      providesTags: ["Notifications"],
    }),

    // 6. Mark single notification as read
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notifications", id },
        { type: "Notifications", id: "LIST" },
        "UnreadCount",
      ],
    }),

    // 7. Mark all notifications as read
    markAllAsRead: builder.mutation({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    // 8. Archive single notification
    archiveNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/archive/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notifications", id },
        { type: "Notifications", id: "LIST" },
        "UnreadCount",
      ],
    }),

    // 9. Archive all notifications
    archiveAll: builder.mutation({
      query: () => ({
        url: "/notifications/archive-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    // 10. Delete single notification
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notifications", id },
        { type: "Notifications", id: "LIST" },
        "UnreadCount",
      ],
    }),

    // 11. Delete all notifications
    deleteAll: builder.mutation({
      query: () => ({
        url: "/notifications/delete-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    // 12. Create test notification
    createTestNotification: builder.mutation({
      query: (body = {}) => ({
        url: "/notifications/test",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useGetUnreadNotificationsQuery,
  useGetUnreadCountQuery,
  useSearchNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useArchiveNotificationMutation,
  useArchiveAllMutation,
  useDeleteNotificationMutation,
  useDeleteAllMutation,
  useCreateTestNotificationMutation,
} = notificationApi;
