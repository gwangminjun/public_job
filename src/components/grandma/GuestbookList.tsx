'use client';

import { useState } from 'react';
import { GrandmaGuestbookEntry } from '@/lib/grandma/shared';
import { GuestbookForm } from './GuestbookForm';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GuestbookListProps {
  initialEntries: GrandmaGuestbookEntry[];
}

export function GuestbookList({ initialEntries }: GuestbookListProps) {
  const [entries, setEntries] = useState<GrandmaGuestbookEntry[]>(initialEntries);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePin, setDeletePin] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleAdded(entry: GrandmaGuestbookEntry) {
    setEntries((prev) => [entry, ...prev]);
  }

  async function handleDelete(entryId: string) {
    if (!/^\d{4}$/.test(deletePin)) {
      setDeleteError('삭제 비밀번호 4자리를 입력해주세요.');
      return;
    }

    setDeletingId(entryId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/grandma/guestbook/${entryId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletePin }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? '메시지 삭제에 실패했습니다.');
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      setDeleteId(null);
      setDeletePin('');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : '메시지 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <GuestbookForm onAdded={handleAdded} />

      <div>
        <h2 className="text-base font-bold mb-4" style={{ color: '#5C3317' }}>
          축하 메시지 {entries.length}개
        </h2>

        {entries.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#A07850' }}>
            <p className="text-3xl mb-3">✉️</p>
            <p className="text-sm">첫 번째 축하 메시지를 남겨주세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl p-5 border shadow-sm"
                style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.emoji}</span>
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#5C3317' }}>
                        {entry.name}
                      </p>
                      <p className="text-xs" style={{ color: '#A07850' }}>
                        {formatDistanceToNow(new Date(entry.created_at), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setDeletePin('');
                      setDeleteId((prev) => (prev === entry.id ? null : entry.id));
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                    style={{ borderColor: '#E8C99A', color: '#7B4F2E', backgroundColor: '#FFFDF7' }}
                  >
                    삭제
                  </button>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#7B4F2E' }}>
                  {entry.message}
                </p>
                {deleteId === entry.id && (
                  <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: '#E8C99A', backgroundColor: '#FFFDF7' }}>
                    <label className="block text-xs font-semibold mb-2" style={{ color: '#7B4F2E' }}>
                      삭제 비밀번호 4자리
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="password"
                        value={deletePin}
                        onChange={(e) => setDeletePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        inputMode="numeric"
                        className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
                        style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                        style={{ backgroundColor: '#B91C1C' }}
                      >
                        {deletingId === entry.id ? '삭제 중...' : '메시지 삭제'}
                      </button>
                    </div>
                    {deleteError && (
                      <p className="mt-2 text-xs" style={{ color: '#B91C1C' }}>
                        {deleteError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
