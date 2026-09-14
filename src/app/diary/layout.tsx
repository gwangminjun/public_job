import type { Metadata } from 'next';
import Link from 'next/link';
import { DiaryAuthGate } from '@/components/diary/DiaryAuthGate';

export const metadata: Metadata = {
  title: '우리 둘의 일기장',
  description: '둘만 보는 비공개 커플 일기장',
  robots: { index: false, follow: false },
};

export default function DiaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-rose-50 dark:bg-gray-950 dark:text-gray-100">
      <header className="bg-rose-500 dark:bg-rose-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/diary" className="flex items-center gap-2 text-white font-bold">
            <span className="text-xl">💌</span>
            <span>우리 둘의 일기장</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-rose-100">
            <Link href="/diary/calendar" className="hover:text-white transition-colors">
              캘린더
            </Link>
            <Link href="/diary/write" className="hover:text-white transition-colors">
              글쓰기
            </Link>
          </nav>
        </div>
      </header>

      <DiaryAuthGate>
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">{children}</main>
      </DiaryAuthGate>

      <footer className="text-center py-4">
        <Link href="/" className="text-rose-400 dark:text-rose-500 text-xs hover:underline">
          ← 프로젝트 허브
        </Link>
      </footer>
    </div>
  );
}
