'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function PokemonTcgShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // KR 라우트에서는 /pokemon-tcg/kr/layout.tsx 가 전체 레이아웃을 담당
  if (pathname?.startsWith('/pokemon-tcg/kr')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-red-600 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/pokemon-tcg/sets" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-white font-bold text-lg tracking-tight">Pokemon TCG 도감</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/pokemon-tcg/sets"
              className="px-3 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
            >
              세트 목록
            </Link>
            <Link
              href="/pokemon-tcg/search"
              className="px-3 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors"
            >
              카드 검색
            </Link>
            <span className="w-px h-4 bg-white/30 mx-1" />
            <Link
              href="/pokemon-tcg/kr/sets"
              className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-xs transition-colors"
            >
              🇰🇷 KR
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-white/50 hover:text-white/80 text-xs transition-colors"
            >
              ← 메인
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>

      <footer className="bg-red-600 text-center py-3">
        <p className="text-white/60 text-xs">Pokemon TCG 도감 · Data by pokemontcg.io</p>
      </footer>
    </div>
  );
}
