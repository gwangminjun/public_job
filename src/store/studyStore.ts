import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface StudyState {
  checked: Record<string, boolean>;
  memos: Record<string, string>;

  toggleTask: (taskId: string) => void;
  setChecked: (taskIds: string[], value: boolean) => void;
  setMemo: (date: string, value: string) => void;
  resetAll: () => void;
  hydrate: (checked: Record<string, boolean>, memos: Record<string, string>) => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      checked: {},
      memos: {},

      toggleTask: (taskId) =>
        set((state) => ({ checked: { ...state.checked, [taskId]: !state.checked[taskId] } })),

      setChecked: (taskIds, value) =>
        set((state) => {
          const checked = { ...state.checked };
          taskIds.forEach((id) => (checked[id] = value));
          return { checked };
        }),

      setMemo: (date, value) =>
        set((state) => ({ memos: { ...state.memos, [date]: value } })),

      resetAll: () => set({ checked: {}, memos: {} }),

      hydrate: (checked, memos) => set({ checked, memos }),
    }),
    {
      name: 'study-security-engineer-20260923',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
