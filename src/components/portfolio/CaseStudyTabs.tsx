'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import type { CaseStudyData } from '@/app/portfolio/portfolio-data';
import { CheckItem } from './CheckItem';

type CaseStudyTabsProps = {
  studies: CaseStudyData[];
};

const stages = [
  { key: 'problem', label: '문제' },
  { key: 'decision', label: '판단' },
  { key: 'implementation', label: '구현' },
  { key: 'result', label: '결과' },
] as const;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2';

/**
 * WAI-ARIA APG tabs with automatic activation (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
 * The list is horizontal below `lg` and vertical above, so both arrow axes move the selection.
 * Inactive panels stay in the HTML behind `hidden` so every case study is readable without JavaScript.
 */
export function CaseStudyTabs({ studies }: CaseStudyTabsProps) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    setSelected(index);
    tabRefs.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = studies.length - 1;
    const next: Record<string, number> = {
      ArrowDown: selected === last ? 0 : selected + 1,
      ArrowRight: selected === last ? 0 : selected + 1,
      ArrowUp: selected === 0 ? last : selected - 1,
      ArrowLeft: selected === 0 ? last : selected - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    select(next[event.key]);
  };

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[16rem_1fr]">
      <div
        role="tablist"
        aria-label="대표 프로젝트"
        onKeyDown={onKeyDown}
        className="flex overflow-x-auto border-b-2 border-slate-200 lg:flex-col lg:self-start lg:overflow-visible lg:border-b-0 lg:border-l-2"
      >
        {studies.map((study, index) => {
          const active = index === selected;
          return (
            <button
              key={study.slug}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`case-tab-${study.slug}`}
              aria-selected={active}
              aria-controls={`case-panel-${study.slug}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(index)}
              className={`-mb-0.5 shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-left text-base transition-colors motion-reduce:transition-none lg:-mb-0 lg:-ml-0.5 lg:whitespace-normal lg:border-b-0 lg:border-l-2 lg:px-5 ${focusRing} ${
                active
                  ? 'border-violet-600 font-bold text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {study.title}
            </button>
          );
        })}
      </div>

      {studies.map((study, index) => (
        <div
          key={study.slug}
          role="tabpanel"
          id={`case-panel-${study.slug}`}
          aria-labelledby={`case-tab-${study.slug}`}
          tabIndex={0}
          hidden={index !== selected}
          className={`min-w-0 rounded-md ${focusRing}`}
        >
          <h3 className="break-words text-xl font-bold text-slate-950">
            {study.title} <span className="text-violet-600">@ {study.role}</span>
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-500">{study.period}</p>
          <p className="mt-2 break-words text-sm text-slate-500">
            <span className="sr-only">사용 기술: </span>
            {study.technologies.join(' · ')}
          </p>

          <ul className="mt-8 space-y-5 leading-7 text-slate-600">
            {stages.map((stage) => (
              <CheckItem key={stage.key}>
                <strong className="mr-2 font-bold text-slate-950">{stage.label}</strong>
                <span className={stage.key === 'result' ? 'font-semibold text-slate-900' : undefined}>
                  {study[stage.key]}
                </span>
              </CheckItem>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
