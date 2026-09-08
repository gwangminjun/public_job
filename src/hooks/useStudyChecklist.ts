import { useEffect, useRef } from 'react';
import { useStudyStore } from '@/store/studyStore';

const SAVE_DEBOUNCE_MS = 800;

export function useStudyChecklist() {
  const checked = useStudyStore((s) => s.checked);
  const memos = useStudyStore((s) => s.memos);
  const hydrate = useStudyStore((s) => s.hydrate);
  const hydrated = useRef(false);

  useEffect(() => {
    fetch('/api/study/checklist')
      .then((res) => res.json())
      .then((data) => hydrate(data.checked ?? {}, data.memos ?? {}))
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
      });
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated.current) return;

    const timeout = setTimeout(() => {
      fetch('/api/study/checklist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-study-secret': process.env.NEXT_PUBLIC_STUDY_EDIT_SECRET ?? '',
        },
        body: JSON.stringify({ checked, memos }),
      }).catch(() => {});
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [checked, memos]);
}
