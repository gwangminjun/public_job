import Link from 'next/link';
import type { PortfolioLinks, Profile } from '@/app/portfolio/portfolio-data';

type PortfolioHeroProps = {
  profile: Profile;
  links: PortfolioLinks;
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

export function PortfolioHero({ profile, links }: PortfolioHeroProps) {
  return (
    <header className="relative overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.22),transparent_36%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-5 sm:px-8 lg:px-10 lg:pb-28">
        <nav aria-label="포트폴리오 메뉴" className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className={`rounded-md text-sm font-semibold tracking-wide text-slate-200 transition-colors hover:text-white motion-reduce:transition-none ${focusRing}`}
          >
            MINJUN.Y
          </Link>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
            <a className={`rounded-md transition-colors hover:text-white motion-reduce:transition-none ${focusRing}`} href="#projects">
              프로젝트
            </a>
            <a className={`rounded-md transition-colors hover:text-white motion-reduce:transition-none ${focusRing}`} href="#career">
              이력
            </a>
            <a className={`rounded-md transition-colors hover:text-white motion-reduce:transition-none ${focusRing}`} href="#contact">
              연락처
            </a>
          </div>
        </nav>

        <div className="max-w-4xl pt-20 lg:pt-28">
          <p className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200">
            Java/Spring · Data Integration · GIS
          </p>
          <h1 className="text-5xl font-black tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
            {profile.name}
          </h1>
          <p className="mt-5 text-xl font-bold text-cyan-200 sm:text-2xl">{profile.role}</p>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9">
            {profile.headline}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#projects"
              className={`rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 motion-reduce:transition-none ${focusRing}`}
            >
              대표 프로젝트 보기
            </a>
            <a
              href="#career"
              className={`rounded-full border border-slate-600 px-6 py-3 text-sm font-bold text-white transition hover:border-slate-300 hover:bg-white/5 motion-reduce:transition-none ${focusRing}`}
            >
              이력 보기
            </a>
            <a
              href={`mailto:${links.email}`}
              className={`rounded-full border border-slate-600 px-6 py-3 text-sm font-bold text-white transition hover:border-slate-300 hover:bg-white/5 motion-reduce:transition-none ${focusRing}`}
            >
              이메일 보내기
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-5 text-sm font-medium text-slate-400">
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md transition-colors hover:text-cyan-200 motion-reduce:transition-none ${focusRing}`}
            >
              GitHub ↗
            </a>
            <a
              href={links.blog}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md transition-colors hover:text-cyan-200 motion-reduce:transition-none ${focusRing}`}
            >
              기술 블로그 ↗
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
