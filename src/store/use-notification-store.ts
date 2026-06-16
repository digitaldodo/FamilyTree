import { create } from 'zustand';

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    // Mock initial notification for demonstration
    {
      id: '1',
      title: 'Welcome to FamilyTree',
      message: 'Start building your legacy by adding your first family member.',
      type: 'INFO',
      read: false,
      createdAt: new Date(),
    }
  ],
  unreadCount: 1,
  
  addNotification: (notif) => set((state) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      createdAt: new Date(),
    };
    return {
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),

  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.read).length,
    };
  }),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  removeNotification: (id) => set((state) => {
    const updated = state.notifications.filter(n => n.id !== id);
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.read).length,
    };
  }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
