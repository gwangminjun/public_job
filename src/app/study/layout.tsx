import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '정보보안기사 필기 체크리스트',
  description: '정보보안기사 필기 시험 대비 D-DAY 학습 체크리스트',
};

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="study-layout min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/study/review" className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">📖</span>
            <span className="font-bold text-lg tracking-wide">학습 노트</span>
          </Link>
          <Link href="/" className="text-sky-300 text-sm hover:text-white transition-colors">
            프로젝트 허브 →
          </Link>
        </div>
        <nav aria-label="학습 메뉴" className="max-w-6xl mx-auto flex flex-wrap gap-x-5 gap-y-2 px-4 pb-3 text-xs text-slate-400">
          <Link href="/study/review" className="hover:text-white">시험 직전 복습</Link>
          <Link href="/study/recall" className="hover:text-white">백지 공부</Link>
          <Link href="/study" className="hover:text-white">정보보안기사 체크리스트</Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
