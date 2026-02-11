import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Job, RecentJob } from '@/lib/types';

interface RecentViewedState {
  recentJobs: RecentJob[];
  addRecent: (job: Job) => void;
  clearRecent: () => void;
}

export const useRecentViewedStore = create<RecentViewedState>()(
  persist(
    (set, get) => ({
      recentJobs: [],
      addRecent: (job) => {
        const { recentJobs } = get();
        const now = new Date().toISOString();
        
        // Remove existing if present (deduplication)
        const filtered = recentJobs.filter(
          (item) => item.job.recrutPblntSn !== job.recrutPblntSn
        );
        
        // Add to front, limit to 10
        const newRecent = [{ job, viewedAt: now }, ...filtered].slice(0, 10);
        
        set({ recentJobs: newRecent });
      },
      clearRecent: () => set({ recentJobs: [] }),
    }),
    {
      name: 'recent-viewed-jobs',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
