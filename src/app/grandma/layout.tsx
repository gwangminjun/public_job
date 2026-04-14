import type { Metadata } from 'next';
import Link from 'next/link';
import { GrandmaNavigation } from '@/components/grandma/GrandmaNavigation';

export const metadata: Metadata = {
  title: '할머니 팔순잔치 기념',
  description: '소중한 할머니의 80번째 생신을 온 가족이 함께 축하합니다.',
};

export default function GrandmaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF8EE', fontFamily: "'Georgia', serif" }}>
      {/* 헤더 */}
      <header style={{ backgroundColor: '#7B4F2E' }} className="shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between relative">
          <Link href="/grandma" className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="text-white font-bold text-lg tracking-wide">팔순잔치 기념</span>
          </Link>
          <GrandmaNavigation />
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      {/* 푸터 */}
      <footer style={{ backgroundColor: '#7B4F2E' }} className="text-center py-4">
        <p className="text-amber-200 text-sm">
          🌸 할머니의 팔순을 진심으로 축하드립니다 🌸
        </p>
        <Link href="/" className="text-amber-300/60 text-xs hover:text-amber-300 transition-colors mt-1 inline-block">
          ← 메인으로
        </Link>
      </footer>
    </div>
  );
}
