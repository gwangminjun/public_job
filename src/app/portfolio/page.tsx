import type { Metadata } from 'next';
import { ExperienceSummary } from '@/components/portfolio/ExperienceSummary';
import { PortfolioHero } from '@/components/portfolio/PortfolioHero';
import { highlights, links, profile, strengths } from './portfolio-data';

export const metadata: Metadata = {
  title: '양민준 | 백엔드·스마트시티/GIS 개발자',
  description:
    'Java/Spring 기반 공공 정보시스템과 GIS·데이터 연계 경험을 소개하는 양민준의 개발자 포트폴리오입니다.',
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PortfolioHero profile={profile} links={links} />
      <main>
        <ExperienceSummary
          highlights={highlights}
          strengths={strengths}
          employer={profile.employer}
        />

        <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-8 bg-white py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
            <h2 id="projects-heading" className="text-3xl font-black tracking-tight text-slate-950">
              대표 프로젝트
            </h2>
          </div>
        </section>

        <section id="career" aria-labelledby="career-heading" className="scroll-mt-8 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
            <h2 id="career-heading" className="text-3xl font-black tracking-tight text-slate-950">
              경력 타임라인
            </h2>
          </div>
        </section>
      </main>

      <footer id="contact" className="scroll-mt-8 bg-slate-950 px-5 py-12 text-center text-slate-300">
        <p className="text-sm">함께 일할 개발자를 찾고 계신다면 연락해주세요.</p>
        <a className="mt-3 inline-block font-bold text-cyan-300 hover:text-cyan-200" href={`mailto:${links.email}`}>
          {links.email}
        </a>
      </footer>
    </div>
  );
}
