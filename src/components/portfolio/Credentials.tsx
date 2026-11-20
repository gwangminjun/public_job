import Link from 'next/link';
import type {
  CredentialGroup,
  EducationItem,
  SideProject,
  SkillGroup,
} from '@/app/portfolio/portfolio-data';
import { CheckItem } from './CheckItem';
import { SectionHeading } from './SectionHeading';

type CredentialsProps = {
  skillGroups: SkillGroup[];
  education: EducationItem[];
  credentialGroups: CredentialGroup[];
  sideProjects: SideProject[];
  activities: string[];
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2';

const cardLink = `group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-violet-600 motion-reduce:transition-none ${focusRing}`;

export function Credentials({
  skillGroups,
  education,
  credentialGroups,
  sideProjects,
  activities,
}: CredentialsProps) {
  return (
    <>
      <section id="skills" aria-labelledby="skills-heading" className="scroll-mt-8 bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <SectionHeading id="skills-heading" title="Skills" description="업무에서 사용한 기술입니다." />

          <dl className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((group) => (
              <div key={group.label} className="min-w-0">
                <dt className="font-bold text-slate-950">{group.label}</dt>
                <dd className="mt-3">
                  <ul className="space-y-1.5 text-slate-600">
                    {group.items.map((item) => (
                      <li key={item} className="break-words">
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="education-heading" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <SectionHeading id="education-heading" title="Education" description="학력과 자격입니다." />

          <div className="mt-12 grid gap-12 lg:grid-cols-2">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-950">학력</h3>
              <ul className="mt-5 space-y-6">
                {education.map((item) => (
                  <li key={item.school}>
                    <p className="text-sm font-medium text-slate-500">{item.period}</p>
                    <p className="mt-1 break-words font-bold text-slate-900">{item.school}</p>
                    <p className="mt-1 break-words text-slate-600">
                      {item.program} · <span className="font-semibold text-violet-700">{item.status}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-950">자격</h3>
              <div className="mt-5 space-y-6">
                {credentialGroups.map((group) => (
                  <div key={group.label}>
                    <h4 className="text-sm font-bold text-slate-500">{group.label}</h4>
                    <ul className="mt-2 space-y-1.5 text-slate-700">
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

      <section aria-labelledby="side-projects-heading" className="bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            id="side-projects-heading"
            title="Side Projects"
            description="개인 프로젝트와 활동입니다."
          />

          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {sideProjects.map((project) => {
              const body = (
                <>
                  <h3 className="text-lg font-bold text-slate-950 group-hover:text-violet-600">{project.title}</h3>
                  <p className="mt-3 flex-1 leading-7 text-slate-600">{project.summary}</p>
                  <span className="mt-5 text-sm font-bold text-violet-600">
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

          <ul className="mt-8 space-y-2 text-slate-700">
            {activities.map((activity) => (
              <CheckItem key={activity}>{activity}</CheckItem>
            ))}
          </ul>

          <Link
            href="/"
            className={`mt-8 inline-block rounded-md text-sm font-bold text-violet-600 hover:underline ${focusRing}`}
          >
            전체 프로젝트 보기 →
          </Link>
        </div>
      </section>
    </>
  );
}
