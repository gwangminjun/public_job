'use client';

import { create } from 'zustand';

type Rating = 'again' | 'done';
interface RecallEntry { answer: string; rating?: Rating }
interface RecallState {
  entries: Record<string, RecallEntry>;
  hydrated: boolean;
  storageError: boolean;
  hydrate: () => void;
  setAnswer: (id: string, answer: string) => void;
  setRating: (id: string, rating: Rating) => void;
}

const STORAGE_KEY = 'study-recall-v1';

export const useStudyRecallStore = create<RecallState>()((set, get) => {
  function persist(entries: Record<string, RecallEntry>) {
    set({ entries });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      set({ storageError: false });
    } catch {
      set({ storageError: true });
    }
  }

  return {
    entries: {},
    hydrated: false,
    storageError: false,
    hydrate: () => {
      if (get().hydrated) return;
      try {
        const raw: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid drafts');
        const entries: Record<string, RecallEntry> = {};
        for (const [id, value] of Object.entries(raw)) {
          if (value && typeof value === 'object' && 'answer' in value && typeof value.answer === 'string') {
            const rating = 'rating' in value && (value.rating === 'again' || value.rating === 'done') ? value.rating : undefined;
            entries[id] = { answer: value.answer, rating };
          }
        }
        set({ entries, hydrated: true });
      } catch {
        set({ hydrated: true, storageError: true });
      }
    },
    setAnswer: (id, answer) => persist({ ...get().entries, [id]: { ...get().entries[id], answer } }),
    setRating: (id, rating) => persist({ ...get().entries, [id]: { answer: get().entries[id]?.answer ?? '', rating } }),
  };
});
