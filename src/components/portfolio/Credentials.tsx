import Link from 'next/link';
import type {
  CredentialGroup,
  EducationItem,
  SideProject,
  SkillGroup,
} from '@/app/portfolio/portfolio-data';

type CredentialsProps = {
  skillGroups: SkillGroup[];
  education: EducationItem[];
  credentialGroups: CredentialGroup[];
  sideProjects: SideProject[];
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';

const cardLink = `group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md motion-reduce:transition-none ${focusRing}`;

export function Credentials({
  skillGroups,
  education,
  credentialGroups,
  sideProjects,
}: CredentialsProps) {
  return (
    <>
      <section aria-labelledby="skills-heading" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Skills & Credentials</p>
          <h2 id="skills-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            업무에서 사용한 기술
          </h2>

          <dl className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div key={group.label} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <dt className="text-sm font-black text-blue-700">{group.label}</dt>
                <dd className="mt-4">
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="break-words rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-black text-slate-950">학력</h3>
              <ul className="mt-6 space-y-4">
                {education.map((item) => (
                  <li key={item.school} className="rounded-2xl border border-slate-200 p-6">
                    <p className="text-sm font-semibold text-slate-500">{item.period}</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{item.school}</p>
                    <p className="mt-1 break-words text-slate-600">
                      {item.program} · <span className="font-semibold text-teal-800">{item.status}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-950">자격</h3>
              <div className="mt-6 space-y-4">
                {credentialGroups.map((group) => (
                  <div key={group.label} className="rounded-2xl border border-slate-200 p-6">
                    <h4 className="text-sm font-black text-blue-700">{group.label}</h4>
                    <ul className="mt-3 space-y-2 text-slate-700">
                      {group.items.map((item) => (
                        <li key={item} className="break-words">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="side-projects-heading" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Side projects</p>
          <h2 id="side-projects-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            개인 프로젝트와 활동
          </h2>

          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {sideProjects.map((project) => {
              const body = (
                <>
                  <h3 className="text-lg font-black text-slate-950 group-hover:text-blue-700">{project.title}</h3>
                  <p className="mt-3 flex-1 leading-7 text-slate-600">{project.summary}</p>
                  <span className="mt-5 text-sm font-bold text-blue-700">
                    {project.external ? '새 탭에서 보기 ↗' : '바로가기 →'}
                  </span>
                </>
              );

              return (
                <li key={project.href}>
                  {project.external ? (
                    <a href={project.href} target="_blank" rel="noopener noreferrer" className={cardLink}>
                      {body}
                    </a>
                  ) : (
                    <Link href={project.href} className={cardLink}>
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <Link
            href="/"
            className={`mt-8 inline-block rounded-md text-sm font-bold text-blue-700 hover:underline ${focusRing}`}
          >
            전체 프로젝트 보기 →
          </Link>
        </div>
      </section>
    </>
  );
}
