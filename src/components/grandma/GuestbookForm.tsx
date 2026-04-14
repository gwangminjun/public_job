'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const EMOJIS = ['❤️', '🌸', '🎂', '🥰', '🙏', '🌺', '✨', '💐'];

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  emoji: string;
  created_at: string;
}

interface GuestbookFormProps {
  onAdded: (entry: GuestbookEntry) => void;
}

export function GuestbookForm({ onAdded }: GuestbookFormProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('❤️');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitting(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('grandma_guestbook')
      .insert({ name: name.trim(), message: message.trim(), emoji })
      .select()
      .single();

    setSubmitting(false);

    if (dbError) {
      setError('메시지 전송에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    onAdded(data as GuestbookEntry);
    setName('');
    setMessage('');
    setEmoji('❤️');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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

        <button
          type="submit"
          disabled={submitting || !name.trim() || !message.trim()}
          className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#7B4F2E' }}
        >
          {submitting ? '전송 중...' : '메시지 전달하기 🌸'}
        </button>
      </div>
    </form>
  );
}
