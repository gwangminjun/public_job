'use client';

import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/useMounted';

export function TravelThemeToggle() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full p-2 text-sky-100 hover:bg-white/15 transition-colors"
      aria-label="테마 전환"
    >
      {mounted ? (theme === 'dark' ? '☀️' : '🌙') : <span className="inline-block w-5" />}
    </button>
  );
}
