import { Notification } from "@/types/user/notification";
import { create } from "zustand";

interface RoleBucket {
  top10: Notification[];
  unread: number;
}

interface RealtimeNotiState {
  userId: string | null;
  activeRole: string | null;

  buckets: Record<string, RoleBucket>; // USER → {}, LECTURER → {}, ADMIN → {}

  init: (role: string, userId: string) => void;
  hydrate: (role: string, items: Notification[], unread: number) => void;
  add: (role: string, noti: Notification) => void;
  updateUnreadCount: (role: string, count: number) => void;
  markAsRead: (role: string, id: string) => void;
  markAllRead: (role: string) => void;
  clearAll: () => void; // khi logout
}

export const useRealtimeNotiStore = create<RealtimeNotiState>((set, get) => ({
  userId: null,
  activeRole: null,
  buckets: {},

  // Khi chuyển role → đảm bảo bucket tồn tại
  init: (role, userId) => {
    const state = get();

    // Reset toàn bộ nếu đổi user
    if (state.userId !== userId) {
      set({
        userId,
        activeRole: role,
        buckets: {
          [role]: { top10: [], unread: 0 },
        },
      });
      return;
    }

    // Nếu cùng user nhưng role mới → tạo bucket nếu chưa có (không reset nếu đã có data)
    if (!state.buckets[role]) {
      set({
        activeRole: role,
        buckets: {
          ...state.buckets,
          [role]: { top10: [], unread: 0 },
        },
      });
    } else {
      // Chỉ update activeRole, giữ nguyên data trong bucket
      set({ activeRole: role });
    }
  },

  // Hydrate từ API (mới vào web)
  hydrate: (role: string, items: Notification[], unread: number) => {
    const state = get();
    if (!state.buckets[role]) {
      set({
        buckets: {
          ...state.buckets,
          [role]: {
            top10: items,
            unread,
          },
        },
      });
    } else {
      set({
        buckets: {
          ...state.buckets,
          [role]: {
            top10: items,
            unread,
          },
        },
      });
    }
  },

  // Nhận realtime từ WS
  add: (role, noti) => {
    const state = get();
    const bucket = state.buckets[role];

    if (!bucket) return; // chưa init role này → bỏ qua

    // tránh duplicate
    if (bucket.top10.some((n) => n.id === noti.id)) return;

    set({
      buckets: {
        ...state.buckets,
        [role]: {
          top10: [noti, ...bucket.top10].slice(0, 10),
          unread: bucket.unread + 1,
        },
      },
    });
  },

  // Cập nhật unread count từ WS
  updateUnreadCount: (role, count) => {
    const state = get();
    const bucket = state.buckets[role];

    if (!bucket) return;

    set({
      buckets: {
        ...state.buckets,
        [role]: {
          ...bucket,
          unread: count,
        },
      },
    });
  },

  markAsRead: (role, id) => {
    const state = get();
    const bucket = state.buckets[role];
    if (!bucket) return;

    const updatedTop10 = bucket.top10.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );

    const newUnread = Math.max(0, bucket.unread - 1);

    set({
      buckets: {
        ...state.buckets,
        [role]: {
          top10: updatedTop10,
          unread: newUnread,
        },
      },
    });
  },

  markAllRead: (role) => {
    const state = get();
    const bucket = state.buckets[role];
    if (!bucket) return;

    const updatedTop10 = bucket.top10.map((n) => ({
      ...n,
      isRead: true,
    }));

    set({
      buckets: {
        ...state.buckets,
        [role]: {
          top10: updatedTop10,
          unread: 0,
        },
      },
    });
  },

  clearAll: () =>
    set({
      userId: null,
      activeRole: null,
      buckets: {},
    }),
}));
