import type { TimelineItem } from '@/app/portfolio/portfolio-data';

type CareerTimelineProps = {
  items: TimelineItem[];
};

export function CareerTimeline({ items }: CareerTimelineProps) {
  return (
    <ol className="mt-14 space-y-8">
      {items.map((item) => (
        <li key={item.year} className="grid gap-3 sm:grid-cols-[7rem_1fr] sm:gap-4">
          <div className="flex items-center gap-3 sm:block">
            <span className="text-2xl font-black tracking-tight text-violet-600">{item.year}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-violet-200 sm:mt-3 sm:block sm:h-10 sm:w-px" />
          </div>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-bold text-slate-950">{item.title}</h3>
            <p className="mt-2 break-words leading-7 text-slate-600">{item.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
