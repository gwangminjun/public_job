'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useMounted } from '@/hooks/useMounted';
import { useTheme } from 'next-themes';

export function Header() {
  const pathname = usePathname();
  const mounted = useMounted();
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <Link href="/" className="text-2xl md:text-3xl font-bold hover:text-blue-100 transition-colors">
            공공기관 채용정보
          </Link>
          <p className="mt-2 text-blue-100 text-sm md:text-base">
            공공데이터포털 API를 활용한 실시간 채용정보 서비스
          </p>
        </div>

        <div className="flex items-center gap-4">
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

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {mounted ? (
              theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
