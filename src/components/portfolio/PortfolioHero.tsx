import Link from 'next/link';
import type { Highlight, PortfolioLinks, Profile } from '@/app/portfolio/portfolio-data';
import { SectionHeading } from './SectionHeading';

type PortfolioHeroProps = {
  profile: Profile;
  links: PortfolioLinks;
  highlights: Highlight[];
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2';

const menuLink = `rounded-md transition-colors hover:text-violet-600 motion-reduce:transition-none ${focusRing}`;

export function PortfolioHero({ profile, links, highlights }: PortfolioHeroProps) {
  return (
    <header className="bg-white">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-5 sm:px-8 lg:px-10 lg:pb-28">
        <nav aria-label="포트폴리오 메뉴" className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className={`text-sm font-black tracking-wide text-slate-950 ${menuLink}`}>
            MINJUN.Y
          </Link>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
            <a className={menuLink} href="#projects">
              Experience
            </a>
            <a className={menuLink} href="#career">
              Career
            </a>
            <a className={menuLink} href="#contact">
              Contact
            </a>
          </div>
        </nav>

        <div className="grid gap-14 pt-20 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:pt-28">
          <div className="min-w-0">
            <p className="mb-4 text-lg font-semibold text-slate-600">안녕하세요, {profile.name}입니다</p>
            <SectionHeading id="hero-heading" level="h1" title={profile.role} />
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{profile.headline}</p>
            <p className="mt-3 text-sm font-semibold text-slate-500">{profile.employer}</p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#projects"
                className={`rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-700 motion-reduce:transition-none ${focusRing}`}
              >
                대표 프로젝트 보기
              </a>
              <a
                href={`mailto:${links.email}`}
                className={`rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-900 transition hover:border-violet-600 hover:text-violet-600 motion-reduce:transition-none ${focusRing}`}
              >
                이메일 보내기
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-5 text-sm font-medium text-slate-500">
              <a href={links.github} target="_blank" rel="noopener noreferrer" className={menuLink}>
                GitHub ↗
              </a>
              <a href={links.blog} target="_blank" rel="noopener noreferrer" className={menuLink}>
                기술 블로그 ↗
              </a>
            </div>
          </div>

          {/* gap-px over a tinted background draws the inner grid lines */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-violet-100 bg-violet-100">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="flex min-w-0 flex-col-reverse gap-2 bg-white p-5 sm:p-6">
                <dt className="break-words text-sm leading-6 text-slate-600">{highlight.label}</dt>
                <dd className="text-2xl font-black tracking-tight text-violet-600 sm:text-3xl">{highlight.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </header>
  );
}
