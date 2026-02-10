'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useMounted } from '@/hooks/useMounted';

export function Header() {
  const pathname = usePathname();
  const mounted = useMounted();
  const bookmarks = useBookmarkStore((state) => state.bookmarks);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <Link href="/" className="text-2xl md:text-3xl font-bold hover:text-blue-100 transition-colors">
            공공기관 채용정보
          </Link>
          <p className="mt-2 text-blue-100 text-sm md:text-base">
            공공데이터포털 API를 활용한 실시간 채용정보 서비스
          </p>
        </div>

        <nav className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-1 pl-2 pr-2">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${pathname === '/' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-white hover:bg-white/10'}`}
          >
            채용공고
          </Link>
          <Link
            href="/bookmarks"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
              ${pathname === '/bookmarks' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-white hover:bg-white/10'}`}
          >
            관심공고
            {mounted && bookmarks.length > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full
                ${pathname === '/bookmarks' ? 'bg-blue-100 text-blue-700' : 'bg-red-500 text-white'}`}>
                {bookmarks.length > 99 ? '99+' : bookmarks.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

