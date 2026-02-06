import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UIState, Notification } from '../types';
import { v4 as uuidv4 } from 'uuid';

// SSR-safe localStorage access
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  }
  return 'dark';
};

// Initial State
const initialState: UIState = {
  sidebarOpen: true,
  theme: getInitialTheme(),
  notifications: [],
  modalOpen: false,
  modalContent: null,
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;

      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        // Update document theme
        if (action.payload === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;

      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
        // Update document theme
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        id: uuidv4(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((notif) => notif.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<string | null>) => {
      state.modalOpen = true;
      state.modalContent = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.modalContent = null;
    },
    toggleModal: (state) => {
      state.modalOpen = !state.modalOpen;
      if (!state.modalOpen) {
        state.modalContent = null;
      }
    },
  },
});

// Actions
export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleModal,
} = uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectModalOpen = (state: { ui: UIState }) => state.ui.modalOpen;
export const selectModalContent = (state: { ui: UIState }) => state.ui.modalContent;
export const selectUI = (state: { ui: UIState }) => state.ui;

// Memoized Selectors
export const selectUnreadNotificationsCount = (state: { ui: UIState }) =>
  state.ui.notifications.length;

export const selectRecentNotifications = (limit: number = 5) => (state: { ui: UIState }) =>
  state.ui.notifications
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

export const selectNotificationsByType = (type: Notification['type']) => (state: { ui: UIState }) =>
  state.ui.notifications.filter((notif) => notif.type === type);

export default uiSlice.reducer;
