'use client';

import { useState } from 'react';
import { GuestbookEntry, GuestbookForm } from './GuestbookForm';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GuestbookListProps {
  initialEntries: GuestbookEntry[];
}

export function GuestbookList({ initialEntries }: GuestbookListProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);

  function handleAdded(entry: GuestbookEntry) {
    setEntries((prev) => [entry, ...prev]);
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
                <div className="flex items-center gap-3 mb-2">
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
                <p className="text-sm leading-relaxed" style={{ color: '#7B4F2E' }}>
                  {entry.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
