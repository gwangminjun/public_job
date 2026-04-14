import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '민준양 포트폴리오 | Dev Projects',
};

const PROJECTS = [
  {
    title: '공공기관 채용정보 포털',
    description: '공공데이터포털 API 기반 실시간 채용공고 검색 · 필터 · 북마크 · Slack 알림',
    tech: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    href: '/public-job',
    status: 'live' as const,
  },
  {
    title: '🌸 할머니 팔순잔치 기념',
    description: '할머니의 소중한 80번째 생신을 축하하는 가족 기념 사이트 · 카운트다운 · 사진첩 · 방명록',
    tech: ['Next.js', 'Supabase', 'Tailwind CSS'],
    href: '/grandma',
    status: 'live' as const,
  },
];

export default function HubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-white">내 프로젝트</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 w-full">
        <div className="mb-16 text-center">
          <p className="text-4xl mb-4">👋</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            안녕하세요
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            개발자의 프로젝트 모음입니다.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PROJECTS.map((project) => (
              <Link
                key={project.href}
                href={project.href}
                className="group flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  {project.status === 'live' && (
                    <span className="ml-2 shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                  바로가기 →
                </span>
              </Link>
            ))}

            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-6 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Coming Soon...</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
