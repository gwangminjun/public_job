'use client';

import { useState } from 'react';
import { containsBlockedWords } from '@/lib/grandma/moderation';
import { GrandmaGuestbookEntry } from '@/lib/grandma/shared';

const EMOJIS = ['❤️', '🌸', '🎂', '🥰', '🙏', '🌺', '✨', '💐'];

interface GuestbookFormProps {
  onAdded: (entry: GrandmaGuestbookEntry) => void;
}

export function GuestbookForm({ onAdded }: GuestbookFormProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('❤️');
  const [deletePin, setDeletePin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !/^\d{4}$/.test(deletePin)) return;

    if (containsBlockedWords(name) || containsBlockedWords(message)) {
      setError('예의를 지키는 축하 메시지만 남길 수 있어요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/grandma/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, emoji, deletePin }),
      });

      const result = (await response.json()) as { entry?: GrandmaGuestbookEntry; error?: string };

      if (!response.ok || !result.entry) {
        throw new Error(result.error ?? '메시지 전송에 실패했습니다. 다시 시도해주세요.');
      }

      onAdded(result.entry);
      setName('');
      setMessage('');
      setEmoji('❤️');
      setDeletePin('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '메시지 전송에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl p-6 border shadow-sm"
      style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}
    >
      <h2 className="text-base font-bold mb-5" style={{ color: '#5C3317' }}>
        축하 메시지 남기기
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl text-sm text-center font-medium" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
          🎉 메시지가 전달되었습니다!
        </div>
      )}

        <div className="space-y-4">
        {/* 이름 */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#7B4F2E' }}>
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            maxLength={20}
            required
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
        </div>

        {/* 이모지 선택 */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: '#7B4F2E' }}>
            이모지
          </label>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className="w-9 h-9 rounded-xl text-lg transition-all border-2"
                style={
                  emoji === e
                    ? { backgroundColor: '#7B4F2E', borderColor: '#7B4F2E' }
                    : { backgroundColor: '#FFF3DC', borderColor: 'transparent' }
                }
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* 메시지 */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#7B4F2E' }}>
            메시지
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="할머니께 따뜻한 축하 메시지를 남겨주세요..."
            maxLength={300}
            required
            rows={3}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none focus:ring-2"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
          <p className="text-right text-xs mt-1" style={{ color: '#A07850' }}>
            {message.length}/300
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#7B4F2E' }}>
            삭제 비밀번호
          </label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]{4}"
            value={deletePin}
            onChange={(e) => setDeletePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="4자리 숫자"
            maxLength={4}
            required
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
            style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
          />
          <p className="text-right text-xs mt-1" style={{ color: '#A07850' }}>
            본인 메시지를 지울 때 사용합니다.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim() || !message.trim() || !/^\d{4}$/.test(deletePin)}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#7B4F2E' }}
        >
          {submitting ? '전송 중...' : '메시지 전달하기 🌸'}
        </button>
      </div>
    </form>
  );
}
