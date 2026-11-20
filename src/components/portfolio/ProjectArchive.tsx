import type { ArchiveGroup } from '@/app/portfolio/portfolio-data';
import { CheckItem } from './CheckItem';
import { SectionHeading } from './SectionHeading';

type ProjectArchiveProps = {
  groups: ArchiveGroup[];
  others: string[];
};

export function ProjectArchive({ groups, others }: ProjectArchiveProps) {
  return (
    <section id="all-projects" aria-labelledby="all-projects-heading" className="scroll-mt-8 bg-slate-50 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          id="all-projects-heading"
          title="Projects"
          description="대표 사례 외에 신규 구축과 운영·유지보수로 참여한 프로젝트입니다."
        />

        {groups.map((group) => (
          <div key={group.label} className="mt-14">
            <h3 className="text-lg font-bold text-slate-950">
              {group.label} <span className="font-medium text-slate-500">· {group.projects.length}건</span>
            </h3>
            <ul className="mt-6 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {group.projects.map((project) => (
                <li key={project.title} className="min-w-0">
                  <article>
                    <h4 className="break-words text-lg font-bold text-slate-950">{project.title}</h4>
                    <p className="mt-1 text-sm font-medium text-slate-500">{project.period}</p>
                    <p className="mt-1 break-words text-sm text-slate-500">
                      <span className="sr-only">사용 기술: </span>
                      {project.technologies.join(' · ')}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                      {project.points.map((point) => (
                        <CheckItem key={point}>{point}</CheckItem>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-14">
          <h3 className="text-lg font-bold text-slate-950">기타</h3>
          <ul className="mt-4 space-y-2 text-slate-600">
            {others.map((item) => (
              <CheckItem key={item}>{item}</CheckItem>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
