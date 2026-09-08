import type { Metadata } from 'next';
import Link from 'next/link';
import { TravelThemeToggle } from '@/components/travel/TravelThemeToggle';

export const metadata: Metadata = {
  title: '여행 플래너 | Trip Planner',
  description: '일정 · 지도 · 준비물 · 예산을 한 곳에서 관리하는 여행 플래너',
};

export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-sky-50 dark:bg-slate-950 transition-colors">
      <header className="bg-sky-700 dark:bg-sky-950 shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/travel" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-white font-bold text-lg tracking-wide">여행 플래너</span>
          </Link>
          <div className="flex items-center gap-2">
            <TravelThemeToggle />
            <Link href="/" className="text-sky-200 text-sm hover:text-white transition-colors">
              프로젝트 허브 →
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-sky-700 dark:bg-sky-950 text-center py-4">
        <p className="text-sky-200 text-sm">✈️ Your trips. Your plan.</p>
        <a
          href="https://github.com/mauriceboe/TREK"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-300/60 text-xs hover:text-sky-200 transition-colors mt-1 inline-block"
        >
          Inspired by TREK
        </a>
      </footer>
    </div>
  );
}
