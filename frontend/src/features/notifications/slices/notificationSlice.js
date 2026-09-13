/**
 * src/features/notifications/slices/notificationSlice.js
 *
 * Local UI state management slice for Velora Notifications.
 */

import { createSlice } from "@reduxjs/toolkit";

const initialFilterState = {
  keyword: "",
  type: "ALL",
  priority: "ALL",
  read: "ALL", // "ALL" | "true" | "false"
  archived: false,
  fromDate: "",
  toDate: "",
  page: 0,
  size: 20,
};

const initialState = {
  unreadCount: 0,
  hasUnread: false,
  dropdownOpen: false,
  activeTab: "all", // "all" | "unread" | "archived"
  selectedIds: [],
  filters: initialFilterState,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload.count ?? 0;
      state.hasUnread = action.payload.hasUnread ?? state.unreadCount > 0;
    },
    toggleDropdown: (state) => {
      state.dropdownOpen = !state.dropdownOpen;
    },
    setDropdownOpen: (state, action) => {
      state.dropdownOpen = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    toggleSelectId: (state, action) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((item) => item !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAllIds: (state, action) => {
      state.selectedIds = action.payload;
    },
    clearSelection: (state) => {
      state.selectedIds = [];
    },
    setFilter: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: action.payload.page !== undefined ? action.payload.page : 0, // Reset to page 0 on filter change unless specified
      };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialFilterState;
    },
  },
});

export const {
  setUnreadCount,
  toggleDropdown,
  setDropdownOpen,
  setActiveTab,
  toggleSelectId,
  selectAllIds,
  clearSelection,
  setFilter,
  setPage,
  resetFilters,
} = notificationSlice.actions;

export default notificationSlice.reducer;
