type PortfolioFooterProps = {
  email: string;
  github: string;
  blog: string;
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

export function PortfolioFooter({ email, github, blog }: PortfolioFooterProps) {
  return (
    <footer id="contact" aria-labelledby="contact-heading" className="scroll-mt-8 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Contact</p>
        <h2 id="contact-heading" className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          함께 일할 개발자를 찾고 계신다면
        </h2>
        <p className="mt-5 max-w-2xl leading-7">
          공공 정보시스템, 데이터 연계, GIS 관련 포지션에 대한 연락을 기다립니다.
        </p>

        <ul className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
          <li>
            <a
              href={`mailto:${email}`}
              className={`break-all rounded-md font-bold text-cyan-300 hover:text-cyan-200 ${focusRing}`}
            >
              이메일 보내기: {email}
            </a>
          </li>
          <li>
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md font-bold text-white hover:text-cyan-200 ${focusRing}`}
            >
              GitHub 프로필 ↗
            </a>
          </li>
          <li>
            <a
              href={blog}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-md font-bold text-white hover:text-cyan-200 ${focusRing}`}
            >
              기술 블로그 ↗
            </a>
          </li>
        </ul>

        <p className="mt-16 border-t border-slate-800 pt-6 text-xs text-slate-400">© 양민준</p>
      </div>
    </footer>
  );
}
