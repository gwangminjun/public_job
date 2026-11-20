import type { Metadata } from 'next';
import { CareerTimeline } from '@/components/portfolio/CareerTimeline';
import { CaseStudyTabs } from '@/components/portfolio/CaseStudyTabs';
import { Credentials } from '@/components/portfolio/Credentials';
import { ExperienceSummary } from '@/components/portfolio/ExperienceSummary';
import { PortfolioFooter } from '@/components/portfolio/PortfolioFooter';
import { PortfolioHero } from '@/components/portfolio/PortfolioHero';
import { ProjectArchive } from '@/components/portfolio/ProjectArchive';
import { ProjectGantt } from '@/components/portfolio/ProjectGantt';
import { SectionHeading } from '@/components/portfolio/SectionHeading';
import {
  activities,
  archiveGroups,
  careerTimeline,
  caseStudies,
  credentialGroups,
  education,
  highlights,
  links,
  otherProjects,
  profile,
  projectSpans,
  sideProjects,
  skillGroups,
  strengths,
} from './portfolio-data';

export const metadata: Metadata = {
  title: '양민준 | 백엔드·스마트시티/GIS 개발자',
  description:
    'Java/Spring 기반 공공 정보시스템과 GIS·데이터 연계 경험을 소개하는 양민준의 개발자 포트폴리오입니다.',
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen break-keep bg-white text-slate-900">
      <PortfolioHero profile={profile} links={links} highlights={highlights} />
      <main>
        <ExperienceSummary strengths={strengths} />

        <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-8 bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              id="projects-heading"
              title="Experience"
              description="기술 목록보다 어떤 제약을 발견했고 왜 그 해결책을 선택했는지에 집중한 대표 프로젝트입니다."
            />
            <CaseStudyTabs studies={caseStudies} />
          </div>
        </section>

        <ProjectArchive groups={archiveGroups} others={otherProjects} />

        <section id="career" aria-labelledby="career-heading" className="scroll-mt-8 bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              id="career-heading"
              title="Career"
              description="개발 업무에서 출발해 데이터 연계, GIS, 현장 구축과 운영 안정화까지 역할을 확장했습니다."
            />
            <ProjectGantt spans={projectSpans} from="2022-06" until="2026-10" />
            <CareerTimeline items={careerTimeline} />
          </div>
        </section>

        <Credentials
          skillGroups={skillGroups}
          education={education}
          credentialGroups={credentialGroups}
          sideProjects={sideProjects}
          activities={activities}
        />
      </main>

      <PortfolioFooter email={links.email} github={links.github} blog={links.blog} />
    </div>
  );
}
