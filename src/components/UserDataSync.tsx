'use client';

import { useEffect, useMemo, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useRecentViewedStore } from '@/store/recentViewedStore';
import { useFilterPresetStore } from '@/store/filterPresetStore';
import { FilterPreset, Job, RecentJob } from '@/lib/types';

type UserDataResponse = {
  bookmarks: Job[];
  recentJobs: RecentJob[];
  presets: FilterPreset[];
};

export function UserDataSync() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const setBookmarks = useBookmarkStore((state) => state.setBookmarks);
  const recentJobs = useRecentViewedStore((state) => state.recentJobs);
  const setRecentJobs = useRecentViewedStore((state) => state.setRecentJobs);
  const presets = useFilterPresetStore((state) => state.presets);
  const setPresets = useFilterPresetStore((state) => state.setPresets);

  const isHydratingRef = useRef(false);
  const isReadyRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        isReadyRef.current = false;
        return;
      }

      try {
        const response = await fetch('/api/account/user-data');
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as UserDataResponse;

        isHydratingRef.current = true;
        setBookmarks(Array.isArray(data.bookmarks) ? data.bookmarks : []);
        setRecentJobs(Array.isArray(data.recentJobs) ? data.recentJobs : []);
        setPresets(Array.isArray(data.presets) ? data.presets : []);
        isHydratingRef.current = false;
        isReadyRef.current = true;
      } catch (error) {
        console.warn('[UserDataSync] bootstrap failed', error);
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        isReadyRef.current = false;
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, setBookmarks, setPresets, setRecentJobs]);

  useEffect(() => {
    if (!isReadyRef.current || isHydratingRef.current) {
      return;
    }

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(async () => {
      try {
        await fetch('/api/account/user-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookmarks,
            recentJobs,
            presets,
          }),
        });
      } catch (error) {
        console.warn('[UserDataSync] sync failed', error);
      }
    }, 500);

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [bookmarks, presets, recentJobs]);

  return null;
}
