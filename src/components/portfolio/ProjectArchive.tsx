import type { ArchiveGroup } from '@/app/portfolio/portfolio-data';

type ProjectArchiveProps = {
  groups: ArchiveGroup[];
  others: string[];
};

export function ProjectArchive({ groups, others }: ProjectArchiveProps) {
  return (
    <section id="all-projects" aria-labelledby="all-projects-heading" className="scroll-mt-8 bg-white pb-20 lg:pb-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">All projects</p>
        <h2 id="all-projects-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          전체 프로젝트
        </h2>
        <p className="mt-5 max-w-3xl leading-7 text-slate-600">
          대표 사례 외에 신규 구축과 운영·유지보수로 참여한 프로젝트입니다.
        </p>

        {groups.map((group) => (
          <div key={group.label} className="mt-12">
            <h3 className="text-xl font-black text-slate-950">
              {group.label} <span className="text-base font-bold text-slate-500">· {group.projects.length}건</span>
            </h3>
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {group.projects.map((project) => (
                <li key={project.title} className="min-w-0">
                  <article className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <h4 className="break-words text-lg font-black text-slate-950">{project.title}</h4>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{project.period}</p>
                    <ul aria-label="사용 기술" className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.map((technology) => (
                        <li
                          key={technology}
                          className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800"
                        >
                          {technology}
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 marker:text-blue-400">
                      {project.points.map((point) => (
                        <li key={point} className="break-words">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-12">
          <h3 className="text-xl font-black text-slate-950">기타</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700 marker:text-blue-400">
            {others.map((item) => (
              <li key={item} className="break-words">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
