'use client';

import { useEffect, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { FilterPreset, Job, RecentJob } from '@/lib/types';

type PersistEnvelope<T> = {
  state?: T;
};

function readPersistedState<T>(storageKey: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistEnvelope<T>;
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

export function LocalToDbMigration() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      const migrationKey = `local-to-db-migrated:${user.id}:v1`;
      if (window.localStorage.getItem(migrationKey) === 'done') {
        return;
      }

      const bookmarkState = readPersistedState<{ bookmarks?: Job[] }>('job-bookmarks');
      const recentState = readPersistedState<{ recentJobs?: RecentJob[] }>('recent-viewed-jobs');
      const presetState = readPersistedState<{ presets?: FilterPreset[] }>('filter-presets');

      const bookmarks = bookmarkState?.bookmarks ?? [];
      const recentJobs = recentState?.recentJobs ?? [];
      const presets = presetState?.presets ?? [];

      if (bookmarks.length === 0 && recentJobs.length === 0 && presets.length === 0) {
        window.localStorage.setItem(migrationKey, 'done');
        return;
      }

      const response = await fetch('/api/account/migrate-local', {
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

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        console.warn('[LocalToDbMigration] failed:', data.message || response.status);
        return;
      }

      window.localStorage.setItem(migrationKey, 'done');
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return null;
}
