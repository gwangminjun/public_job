import type { Metadata } from 'next';
import Link from 'next/link';
import { DiaryAuthGate } from '@/components/diary/DiaryAuthGate';
import './diary.css';

export const metadata: Metadata = {
  title: '우리 둘의 일기장',
  description: '둘만 보는 비공개 커플 일기장',
  robots: { index: false, follow: false },
};

export default function DiaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="diary-theme min-h-screen flex flex-col">
      <header className="diary-header sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
          <Link href="/diary" className="flex min-h-11 items-center gap-2 font-bold">
            <span className="text-xl">💌</span>
            <span>우리 둘의 일기장</span>
          </Link>
          <nav aria-label="일기장 메뉴" className="flex items-center gap-1 text-sm">
            <Link href="/diary/calendar" className="diary-nav-link">
              캘린더
            </Link>
            <Link href="/diary/write" className="diary-primary inline-flex items-center px-4">
              글쓰기
            </Link>
          </nav>
        </div>
      </header>

      <DiaryAuthGate>
        <main className="flex-1 max-w-2xl mx-auto w-full min-w-0 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      </DiaryAuthGate>

      <footer className="text-center py-4">
        <Link href="/" className="diary-muted inline-flex min-h-11 items-center text-xs hover:underline">
          ← 프로젝트 허브
        </Link>
      </footer>
    </div>
  );
}
