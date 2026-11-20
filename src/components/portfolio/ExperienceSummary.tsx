import type { Strength } from '@/app/portfolio/portfolio-data';
import { SectionHeading } from './SectionHeading';

type ExperienceSummaryProps = {
  strengths: Strength[];
};

export function ExperienceSummary({ strengths }: ExperienceSummaryProps) {
  return (
    <section id="strengths" aria-labelledby="strengths-heading" className="scroll-mt-8 bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          id="strengths-heading"
          title="Strengths"
          description="도·시·군 정보시스템의 요구사항 분석, 개발, 서버 설치, 사용자 교육, 유지보수와 장애 대응을 담당하며 반복해서 증명한 세 가지 역량입니다."
        />

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {strengths.map((strength, index) => (
            <article key={strength.title} className="min-w-0">
              <p className="text-sm font-black text-violet-600">0{index + 1}</p>
              <h3 className="mt-3 break-words text-xl font-bold text-slate-950">{strength.title}</h3>
              <p className="mt-3 break-words leading-7 text-slate-600">{strength.summary}</p>
              <p className="mt-4 break-words text-sm font-medium leading-6 text-slate-500">{strength.evidence}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
