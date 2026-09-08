'use client';

import { useMemo } from 'react';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { EXAM_DATE, STUDY_PLAN } from '@/lib/study/plan';
import { useStudyStore } from '@/store/studyStore';
import { useMounted } from '@/hooks/useMounted';
import { useStudyChecklist } from '@/hooks/useStudyChecklist';

function taskId(dayIndex: number, taskIndex: number) {
  return `${dayIndex}-${taskIndex}`;
}

export function StudyChecklist() {
  const mounted = useMounted();
  useStudyChecklist();
  const checked = useStudyStore((s) => s.checked);
  const memos = useStudyStore((s) => s.memos);
  const toggleTask = useStudyStore((s) => s.toggleTask);
  const setChecked = useStudyStore((s) => s.setChecked);
  const setMemo = useStudyStore((s) => s.setMemo);
  const resetAll = useStudyStore((s) => s.resetAll);

  const todayISO = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const dday = useMemo(() => {
    const diff = differenceInCalendarDays(parseISO(EXAM_DATE), parseISO(todayISO));
    if (diff > 0) return `D-${diff}`;
    if (diff === 0) return 'D-DAY';
    return `D+${Math.abs(diff)}`;
  }, [todayISO]);

  const allTaskIds = useMemo(
    () => STUDY_PLAN.flatMap((day, di) => day.tasks.map((_, ti) => taskId(di, ti))),
    []
  );
  const doneCount = allTaskIds.filter((id) => checked[id]).length;
  const totalCount = allTaskIds.length;
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const todayDayIndex = STUDY_PLAN.findIndex((d) => d.date === todayISO);
  const todayTaskIds =
    todayDayIndex === -1 ? [] : STUDY_PLAN[todayDayIndex].tasks.map((_, ti) => taskId(todayDayIndex, ti));

  const handleResetAll = () => {
    if (confirm('체크 상태와 메모를 모두 초기화할까요?')) resetAll();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-1">
        정보보안기사 필기 D-DAY 체크리스트 🔐
      </h1>
      <p className="text-slate-400 text-sm mb-6">
        시험일: <b className="text-slate-200">2026년 9월 23일</b> · 평일 3시간 / 주말 5시간 ·
        목표: 전 과목 과락 방지 + 평균 70점권
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/90 p-3.5">
          <span className="text-xs text-slate-400">전체 체크</span>
          <b className="block text-2xl mt-0.5">{mounted ? doneCount : 0}</b>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/90 p-3.5">
          <span className="text-xs text-slate-400">전체 항목</span>
          <b className="block text-2xl mt-0.5">{totalCount}</b>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/90 p-3.5">
          <span className="text-xs text-slate-400">진행률</span>
          <b className="block text-2xl mt-0.5">{mounted ? percent : 0}%</b>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/90 p-3.5">
          <span className="text-xs text-slate-400">시험까지</span>
          <b className="block text-2xl mt-0.5">{dday}</b>
        </div>
      </div>

      <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-700 mb-6">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-emerald-500 transition-all duration-300"
          style={{ width: `${mounted ? percent : 0}%` }}
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setChecked(todayTaskIds, true)}
          className="rounded-xl border border-slate-700 bg-slate-800 hover:border-sky-400 px-3 py-2 text-sm font-semibold transition-colors"
        >
          오늘 항목 전부 체크
        </button>
        <button
          onClick={() => setChecked(todayTaskIds, false)}
          className="rounded-xl border border-slate-700 bg-slate-800 hover:border-sky-400 px-3 py-2 text-sm font-semibold transition-colors"
        >
          오늘 항목 체크 해제
        </button>
        <button
          onClick={handleResetAll}
          className="rounded-xl border border-slate-700 bg-slate-800 hover:border-sky-400 px-3 py-2 text-sm font-semibold transition-colors"
        >
          전체 초기화
        </button>
      </div>

      {!mounted ? null : (
        <div className="space-y-3.5">
          {STUDY_PLAN.map((day, di) => {
            const ids = day.tasks.map((_, ti) => taskId(di, ti));
            const isToday = day.date === todayISO;
            const isDone = ids.every((id) => checked[id]);
            const d = parseISO(day.date);
            const dateLabel = format(d, 'M/d (EEE)', { locale: ko });

            return (
              <section
                key={day.date}
                className={[
                  'rounded-2xl border overflow-hidden bg-slate-900/95',
                  day.exam
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 to-sky-400/5'
                    : 'border-slate-700',
                  isToday ? 'ring-2 ring-sky-400' : '',
                  isDone ? 'opacity-70' : '',
                ].join(' ')}
              >
                <div className="flex justify-between items-start gap-3.5 px-4.5 py-4 bg-slate-800/80">
                  <div>
                    <div className="text-xs font-extrabold text-sky-400">{dateLabel}</div>
                    <h2 className="text-lg font-bold mt-0.5">{day.title}</h2>
                  </div>
                  <span className="whitespace-nowrap border border-slate-700 rounded-full px-2.5 py-1 text-xs text-slate-300">
                    {day.hours}
                  </span>
                </div>
                <div className="px-4.5 py-4 space-y-3">
                  <div className="font-extrabold text-sm">{day.focus}</div>
                  <div className="grid gap-1.5">
                    {day.tasks.map((task, ti) => {
                      const id = taskId(di, ti);
                      return (
                        <label
                          key={id}
                          className="flex items-start gap-2.5 px-2.5 py-2 bg-slate-950/60 rounded-lg border border-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={!!checked[id]}
                            onChange={() => toggleTask(id)}
                            className="mt-1 scale-110 accent-emerald-500"
                          />
                          <span className="text-sm">{task}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="px-2.5 py-2 border-l-4 border-amber-500 bg-amber-950/30 text-amber-200 rounded-lg text-sm">
                    💡 {day.tip}
                  </div>
                  <textarea
                    value={memos[day.date] || ''}
                    onChange={(e) => setMemo(day.date, e.target.value)}
                    placeholder="오늘 공부 메모 / 헷갈린 개념 / 점수 기록"
                    className="w-full min-h-[70px] resize-y rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p className="text-slate-500 text-xs mt-6">
        체크박스와 메모는 서버에 자동 저장되어 어떤 기기에서 열어도 이어집니다.
      </p>
    </div>
  );
}
