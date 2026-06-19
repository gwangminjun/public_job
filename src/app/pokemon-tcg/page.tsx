'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STORAGE_KEY = 'ptcg-lang';

export default function PokemonTcgLandingPage() {
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en') router.replace('/pokemon-tcg/sets');
    else if (saved === 'kr') router.replace('/pokemon-tcg/kr/sets');
  }, [router]);

  function choose(lang: 'en' | 'kr') {
    localStorage.setItem(STORAGE_KEY, lang);
    router.push(lang === 'en' ? '/pokemon-tcg/sets' : '/pokemon-tcg/kr/sets');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center mb-10">
        <p className="text-5xl mb-4">⚡</p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pokemon TCG 도감</h1>
        <p className="text-gray-500 dark:text-gray-400">어떤 버전을 이용하시겠어요?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl">
        {/* 영문판 */}
        <button
          onClick={() => choose('en')}
          className="group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 hover:border-red-500 dark:hover:border-red-500 hover:shadow-lg transition-all duration-200"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200">
            🌐
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">English</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">영문판 · pokemontcg.io</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">20,000+ 카드 · TCGPlayer 시세</p>
          </div>
          <span className="text-sm font-medium text-red-600 dark:text-red-400 group-hover:underline">
            영문판으로 →
          </span>
        </button>

        {/* 한국판 */}
        <button
          onClick={() => choose('kr')}
          className="group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200"
        >
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200">
            🇰🇷
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-gray-900 dark:text-white mb-1">한국판</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">포켓몬 코리아 공식 카드</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">DP~SV 시리즈 · 한국어 텍스트</p>
          </div>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
            한국판으로 →
          </span>
        </button>
      </div>

      <Link
        href="/"
        className="mt-10 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        ← 메인으로
      </Link>
    </div>
  );
}
