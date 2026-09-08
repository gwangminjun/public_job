import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '정보보안기사 필기 체크리스트',
  description: '정보보안기사 필기 시험 대비 D-DAY 학습 체크리스트',
};

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/study" className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <span className="font-bold text-lg tracking-wide">시험 체크리스트</span>
          </Link>
          <Link href="/" className="text-sky-300 text-sm hover:text-white transition-colors">
            프로젝트 허브 →
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
