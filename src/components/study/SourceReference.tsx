'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const StudyMarkdown = dynamic(() => import('./StudyMarkdown').then(module => module.StudyMarkdown), {
  loading: () => <p className="text-sm text-slate-400">원문을 표시하는 중입니다…</p>,
});

export default function SourceReference({ topicId }: { topicId: string }) {
  const [notes, setNotes] = useState<{ title: string; markdown: string }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    if (notes || loading) return;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/study/notes/${topicId}`);
      if (!response.ok) throw new Error('Could not load notes');
      const data = await response.json();
      setNotes(data.notes);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <details className="mt-5 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3" onToggle={event => { if (event.currentTarget.open) void load(); }}>
      <summary className="cursor-pointer text-sm font-semibold text-sky-300">원문 참고</summary>
      {loading && <p role="status" className="mt-4 text-sm text-slate-400">원문을 불러오는 중입니다…</p>}
      {error && <div className="mt-4 text-sm text-amber-200">원문을 불러오지 못했습니다. <button onClick={() => void load()} className="underline">다시 시도</button></div>}
      {notes && <div data-source-content className="mt-5 max-h-[65vh] space-y-8 overflow-y-auto overscroll-contain pr-2">
        {notes.map(note => <section key={note.title}><p className="mb-4 text-xs text-slate-400">원문 · {note.title}</p><StudyMarkdown>{note.markdown}</StudyMarkdown></section>)}
      </div>}
    </details>
  );
}
