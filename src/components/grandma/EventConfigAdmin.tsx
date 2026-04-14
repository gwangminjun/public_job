'use client';

import { useState } from 'react';
import { GrandmaEventConfig } from '@/lib/grandma/shared';

interface EventConfigAdminProps {
  initialConfig: GrandmaEventConfig;
}

export function EventConfigAdmin({ initialConfig }: EventConfigAdminProps) {
  const [form, setForm] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof GrandmaEventConfig>(key: K, value: GrandmaEventConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/grandma/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = (await response.json()) as { config?: GrandmaEventConfig; error?: string };

      if (!response.ok || !result.config) {
        throw new Error(result.error ?? '잔치 정보 저장에 실패했습니다.');
      }

      setForm(result.config);
      setMessage('잔치 정보를 저장했습니다.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '잔치 정보 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl p-6 md:p-8 border shadow-sm" style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#5C3317' }}>
            잔치 정보 관리
          </h2>
          <p className="text-sm mt-1" style={{ color: '#A07850' }}>
            메인 페이지에 보여줄 날짜, 장소, 주최 정보를 수정합니다.
          </p>
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>행사 날짜</label>
          <input
            type="date"
            value={form.event_date}
            onChange={(e) => updateField('event_date', e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>행사 시간</label>
          <input
            type="time"
            value={form.event_time}
            onChange={(e) => updateField('event_time', e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>장소</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>장소 상세</label>
          <input
            type="text"
            value={form.location_detail ?? ''}
            onChange={(e) => updateField('location_detail', e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>주최</label>
          <input
            type="text"
            value={form.host}
            onChange={(e) => updateField('host', e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>축하 영상 제목</label>
          <input
            type="text"
            value={form.celebration_video_title ?? ''}
            onChange={(e) => updateField('celebration_video_title', e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>축하 영상 URL</label>
          <input
            type="url"
            value={form.celebration_video_url ?? ''}
            onChange={(e) => updateField('celebration_video_url', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
        </div>

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

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#7B4F2E' }}
          >
            {saving ? '저장 중...' : '잔치 정보 저장'}
          </button>
        </div>
      </form>
    </section>
  );
}
