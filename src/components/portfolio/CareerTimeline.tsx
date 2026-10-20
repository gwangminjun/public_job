import type { TimelineItem } from '@/app/portfolio/portfolio-data';

type CareerTimelineProps = {
  items: TimelineItem[];
};

export function CareerTimeline({ items }: CareerTimelineProps) {
  return (
    <ol className="mt-12 space-y-8">
      {items.map((item) => (
        <li key={item.year} className="grid gap-4 sm:grid-cols-[7rem_1fr]">
          <div className="flex items-center gap-3 sm:block">
            <span className="text-2xl font-black tracking-tight text-blue-700">{item.year}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-blue-200 sm:mt-4 sm:block sm:h-12 sm:w-px" />
          </div>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="break-words text-xl font-black text-slate-950">{item.title}</h3>
            <p className="mt-3 break-words leading-7 text-slate-600">{item.summary}</p>
          </article>
        </li>
      ))}
    </ol>
  );
}
