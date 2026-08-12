import { create } from 'zustand';

export const useStore = create((set) => ({
  unreadMessages: 0,
  incrementMessages: () => set((state) => ({ unreadMessages: state.unreadMessages + 1 })),
}));