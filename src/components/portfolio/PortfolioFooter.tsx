import { SectionHeading } from './SectionHeading';

type PortfolioFooterProps = {
  email: string;
  github: string;
  blog: string;
};

const linkClass =
  'rounded-md font-bold text-violet-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2';

export function PortfolioFooter({ email, github, blog }: PortfolioFooterProps) {
  return (
    <footer id="contact" aria-labelledby="contact-heading" className="scroll-mt-8 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10">
        <SectionHeading
          id="contact-heading"
          title="Contact"
          description="공공 정보시스템, 데이터 연계, GIS 관련 포지션에 대한 연락을 기다립니다."
        />

        <ul className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
          <li>
            <a href={`mailto:${email}`} className={`break-all ${linkClass}`}>
              이메일 보내기: {email}
            </a>
          </li>
          <li>
            <a href={github} target="_blank" rel="noopener noreferrer" className={linkClass}>
              GitHub 프로필 ↗
            </a>
          </li>
          <li>
            <a href={blog} target="_blank" rel="noopener noreferrer" className={linkClass}>
              기술 블로그 ↗
            </a>
          </li>
        </ul>

        <p className="mt-16 border-t border-slate-200 pt-6 text-xs text-slate-500">© 양민준</p>
      </div>
    </footer>
  );
}
