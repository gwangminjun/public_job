'use client';

import { useMemo, useState } from 'react';
import { GrandmaTimelineEvent } from '@/lib/grandma/shared';

interface TimelineAdminProps {
  initialEvents: GrandmaTimelineEvent[];
}

interface TimelineFormState {
  id: string | null;
  year: string;
  title: string;
  description: string;
  emoji: string;
  highlight: boolean;
  sort_order: string;
}

const EMPTY_FORM: TimelineFormState = {
  id: null,
  year: '',
  title: '',
  description: '',
  emoji: '',
  highlight: false,
  sort_order: '0',
};

function toFormState(event?: GrandmaTimelineEvent): TimelineFormState {
  if (!event) return EMPTY_FORM;

  return {
    id: event.id,
    year: String(event.year),
    title: event.title,
    description: event.description ?? '',
    emoji: event.emoji ?? '',
    highlight: event.highlight,
    sort_order: String(event.sort_order),
  };
}

export function TimelineAdmin({ initialEvents }: TimelineAdminProps) {
  const [events, setEvents] = useState(initialEvents);
  const [form, setForm] = useState<TimelineFormState>(() => ({ ...EMPTY_FORM, sort_order: '10' }));
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextSortOrder = useMemo(() => {
    if (events.length === 0) return '10';
    return String(Math.max(...events.map((event) => event.sort_order)) + 10);
  }, [events]);

  function resetForm() {
    setForm({ ...EMPTY_FORM, sort_order: nextSortOrder });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        year: Number.parseInt(form.year, 10),
        title: form.title.trim(),
        description: form.description.trim() || null,
        emoji: form.emoji.trim() || null,
        highlight: form.highlight,
        sort_order: Number.parseInt(form.sort_order, 10),
      };

      const response = await fetch(form.id ? `/api/grandma/timeline/${form.id}` : '/api/grandma/timeline', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { event?: GrandmaTimelineEvent; error?: string };

      if (!response.ok || !result.event) {
        throw new Error(result.error ?? '타임라인 저장에 실패했습니다.');
      }

      setEvents((prev) => {
        const next = form.id
          ? prev.map((item) => (item.id === result.event?.id ? result.event : item))
          : [...prev, result.event as GrandmaTimelineEvent];

        return [...next].sort((a, b) => a.sort_order - b.sort_order || a.year - b.year);
      });

      setMessage(form.id ? '타임라인 항목을 수정했습니다.' : '타임라인 항목을 추가했습니다.');
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '타임라인 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/grandma/timeline/${id}`, { method: 'DELETE' });
      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? '타임라인 삭제에 실패했습니다.');
      }

      setEvents((prev) => prev.filter((event) => event.id !== id));
      setMessage('타임라인 항목을 삭제했습니다.');
      if (form.id === id) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '타임라인 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl p-6 md:p-8 border shadow-sm" style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}>
      <div className="mb-6">
        <h2 className="text-lg font-bold" style={{ color: '#5C3317' }}>
          타임라인 관리
        </h2>
        <p className="text-sm mt-1" style={{ color: '#A07850' }}>
          인생 이벤트를 추가, 수정, 삭제하고 표시 순서를 직접 관리합니다.
        </p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>연도</label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>표시 순서</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>이모지</label>
          <input
            type="text"
            value={form.emoji}
            onChange={(e) => setForm((prev) => ({ ...prev, emoji: e.target.value }))}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
            maxLength={4}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>설명</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
        </div>
        <label className="md:col-span-2 inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#7B4F2E' }}>
          <input
            type="checkbox"
            checked={form.highlight}
            onChange={(e) => setForm((prev) => ({ ...prev, highlight: e.target.checked }))}
          />
          하이라이트 이벤트로 표시
        </label>

        {(message || error) && (
          <div
            className="md:col-span-2 rounded-xl px-3 py-2 text-sm"
            style={{
              backgroundColor: error ? '#FEE2E2' : '#ECFDF3',
              color: error ? '#B91C1C' : '#166534',
            }}
          >
            {error ?? message}
          </div>
        )}

        <div className="md:col-span-2 flex flex-wrap justify-end gap-2">
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-sm font-semibold border"
              style={{ borderColor: '#C49A6C', color: '#7B4F2E', backgroundColor: '#FFFDF7' }}
            >
              편집 취소
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#7B4F2E' }}
          >
            {saving ? '저장 중...' : form.id ? '타임라인 수정' : '타임라인 추가'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl border px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            style={{ backgroundColor: event.highlight ? '#FFF3DC' : '#FFFDF7', borderColor: '#E8C99A' }}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#E8C99A', color: '#5C3317' }}>
                  #{event.sort_order}
                </span>
                <span className="text-sm font-semibold" style={{ color: '#5C3317' }}>
                  {event.emoji ?? '📝'} {event.year}년 {event.title}
                </span>
                {event.highlight && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#7B4F2E', color: 'white' }}>
                    하이라이트
                  </span>
                )}
              </div>
              {event.description && (
                <p className="text-sm" style={{ color: '#7B4F2E' }}>
                  {event.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm(toFormState(event))}
                className="px-3 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: '#C49A6C', color: '#7B4F2E', backgroundColor: '#FFFDF7' }}
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => handleDelete(event.id)}
                disabled={deletingId === event.id}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: '#B91C1C' }}
              >
                {deletingId === event.id ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
