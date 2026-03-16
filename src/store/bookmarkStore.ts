import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Job } from '@/lib/types';

interface BookmarkState {
  bookmarks: Job[];
  setBookmarks: (jobs: Job[]) => void;
  addBookmark: (job: Job) => void;
  removeBookmark: (jobId: number) => void;
  toggleBookmark: (job: Job) => void;
  isBookmarked: (jobId: number) => boolean;
  clearBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      setBookmarks: (jobs) => {
        const deduped = jobs.filter(
          (job, index, arr) => arr.findIndex((candidate) => candidate.recrutPblntSn === job.recrutPblntSn) === index
        );
        set({ bookmarks: deduped });
      },
      
      addBookmark: (job) => {
        const { bookmarks } = get();
        if (!bookmarks.some((b) => b.recrutPblntSn === job.recrutPblntSn)) {
          set({ bookmarks: [job, ...bookmarks] });
        }
      },

      removeBookmark: (jobId) => {
        set({
          bookmarks: get().bookmarks.filter((b) => b.recrutPblntSn !== jobId),
        });
      },

      toggleBookmark: (job) => {
        const { bookmarks } = get();
        const exists = bookmarks.some((b) => b.recrutPblntSn === job.recrutPblntSn);
        
        if (exists) {
          set({
            bookmarks: bookmarks.filter((b) => b.recrutPblntSn !== job.recrutPblntSn),
          });
        } else {
          set({ bookmarks: [job, ...bookmarks] });
        }
      },

      isBookmarked: (jobId) => {
        return get().bookmarks.some((b) => b.recrutPblntSn === jobId);
      },

      clearBookmarks: () => {
        set({ bookmarks: [] });
      },
    }),
    {
      name: 'job-bookmarks', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
