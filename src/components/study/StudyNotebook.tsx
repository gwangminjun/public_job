'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStudySubject, SUBJECTS, type StudyTopic } from '@/lib/study/topics';
import { useStudyRecallStore } from '@/store/studyRecallStore';
import './study-notebook.css';

const SourceReference = dynamic(() => import('./SourceReference'), { loading: () => <p className="mt-4 text-sm text-slate-400">참고 자료 준비 중…</p> });
export interface RenderedStudyTopic extends StudyTopic { summary: ReactNode; searchText: string }
type Mode = 'review' | 'recall';
const buttonClass = 'rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-sky-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300';

function topicHref(mode: Mode, subject: string, topic?: string) {
  return `/study/${mode}?subject=${subject}${topic ? `&topic=${topic}` : ''}`;
}

export function StudyNotebook({ mode, topics }: { mode: Mode; topics: RenderedStudyTopic[] }) {
  const params = useSearchParams();
  const subject = getStudySubject(params.get('subject'));
  const subjectTopics = topics.filter(topic => topic.subject === subject);
  const selected = subjectTopics.find(topic => topic.id === params.get('topic')) ?? subjectTopics[0];
  const [query, setQuery] = useState('');
  const [onlyAgain, setOnlyAgain] = useState(false);
  const filtered = subjectTopics.filter(topic => `${topic.title} ${topic.searchText}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const subjectTitle = SUBJECTS.find(item => item.id === subject)!.title;

  return (
    <div data-study-screen className="study-notebook mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-sky-300">STUDY NOTES / {mode === 'review' ? 'QUICK REVIEW' : 'ACTIVE RECALL'}</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{mode === 'review' ? '시험 직전 복습' : '백지 공부'}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{mode === 'review' ? '흩어진 내용을 한 권으로. 핵심 개념과 헷갈리는 차이를 마지막으로 정리하세요.' : '먼저 떠올리고, 적고, 비교하세요. 기억나지 않은 부분이 다음 복습의 출발점입니다.'}</p>
        </div>
        <nav aria-label="학습 방식" className="flex gap-2 print:hidden">
          <Link href={topicHref('review', subject, selected.id)} aria-current={mode === 'review' ? 'page' : undefined} className={`${buttonClass} ${mode === 'review' ? 'border-sky-400 bg-sky-950 text-sky-200' : 'text-slate-300'}`}>시험 직전 복습</Link>
          <Link href={topicHref('recall', subject, selected.id)} aria-current={mode === 'recall' ? 'page' : undefined} className={`${buttonClass} ${mode === 'recall' ? 'border-sky-400 bg-sky-950 text-sky-200' : 'text-slate-300'}`}>백지 공부</Link>
        </nav>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-slate-800 pb-5 print:hidden">
        <nav aria-label="과목 선택" className="flex gap-2">
          {SUBJECTS.map(item => <Link key={item.id} href={topicHref(mode, item.id)} onClick={() => setQuery('')} aria-current={subject === item.id ? 'true' : undefined} className={`${buttonClass} ${subject === item.id ? 'border-slate-100 bg-slate-100 text-slate-950' : 'text-slate-400'}`}>{item.title}</Link>)}
        </nav>
        <span className="ml-2 text-xs text-slate-400">{subjectTopics.length}개 주제 · 원문 기반 단권화</span>
      </div>

      {mode === 'review' ? <>
        <div className="mb-7 flex flex-wrap items-end gap-3 print:hidden">
          <div className="min-w-0 flex-1">
            <label htmlFor="study-search" className="mb-2 block text-xs text-slate-400">{subjectTitle} 안에서 개념 찾기</label>
            <input id="study-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="예: 시간 복잡도, 마진, DQN" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-sky-400" />
          </div>
          <button onClick={() => window.print()} className={buttonClass}>인쇄 / PDF</button>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:sticky lg:top-36 print:hidden">
            <p className="mb-3 text-xs font-semibold text-slate-400">목차 · {filtered.length}개 주제</p>
            <nav aria-label="복습 목차" className="grid gap-1">
              {filtered.map((topic, index) => <a key={topic.id} href={`#${topic.id}`} className="rounded-lg px-2 py-2 text-sm leading-5 text-slate-300 hover:bg-slate-800 hover:text-sky-200"><span className="mr-2 text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>{topic.title}</a>)}
            </nav>
          </aside>
          <div className="min-w-0 space-y-6">
            {filtered.length === 0 && <div data-empty-results className="rounded-2xl border border-slate-800 p-8 text-center"><p className="mb-4 text-slate-400">일치하는 주제가 없습니다.</p><button onClick={() => setQuery('')} className={buttonClass}>검색 초기화</button></div>}
            {query && filtered.length > 0 && <button onClick={() => setQuery('')} className={`${buttonClass} print:hidden`}>검색 초기화</button>}
            {filtered.map(topic => <article key={topic.id} id={topic.id} data-topic-id={topic.id} className="study-topic scroll-mt-36 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{topic.title}</h2><Link href={topicHref('recall', subject, topic.id)} className="text-xs font-semibold text-sky-300 hover:underline print:hidden">이 주제로 백지 공부 →</Link></div>
              {topic.summary}
              <div className="print:hidden"><SourceReference topicId={topic.id} /></div>
            </article>)}
          </div>
        </div>
      </> : <RecallWorkspace key={selected.id} topic={selected} topics={subjectTopics} onlyAgain={onlyAgain} setOnlyAgain={setOnlyAgain} />}
      <p className="mt-10 text-xs leading-5 text-slate-400">단권화 기준: 제공된 알고리즘·머신러닝 학습 문서. 세부 예제와 강의 표현은 각 주제의 원문 참고에서 확인하세요.</p>
    </div>
  );
}

function RecallWorkspace({ topic, topics, onlyAgain, setOnlyAgain }: { topic: RenderedStudyTopic; topics: RenderedStudyTopic[]; onlyAgain: boolean; setOnlyAgain: (value: boolean) => void }) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const { entries, hydrated, storageError, hydrate, setAnswer, setRating } = useStudyRecallStore();
  useEffect(() => hydrate(), [hydrate]);
  const entry = hydrated ? entries[topic.id] : undefined;
  const index = topics.findIndex(item => item.id === topic.id);
  const done = hydrated ? topics.filter(item => entries[item.id]?.rating === 'done').length : 0;
  const visibleTopics = onlyAgain ? topics.filter(item => entries[item.id]?.rating === 'again') : topics;
  const navigationIndex = visibleTopics.findIndex(item => item.id === topic.id);
  const previous = navigationIndex > 0 ? visibleTopics[navigationIndex - 1] : undefined;
  const next = visibleTopics[navigationIndex + 1];

  return <div className="grid items-start gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-sm font-semibold">복습 현황 <span className="float-right text-sky-300">{done} / {topics.length}</span></p>
      <progress className="my-3 h-1.5 w-full accent-sky-400" value={done} max={topics.length} aria-label="설명 가능한 주제 수" />
      <label className="mb-4 flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={onlyAgain} onChange={event => setOnlyAgain(event.target.checked)} className="accent-sky-400" />다시 공부할 주제만</label>
      <div className="lg:hidden">
        <label htmlFor="recall-topic" className="mb-2 block text-xs text-slate-400">공부할 주제</label>
        <select id="recall-topic" value={visibleTopics.some(item => item.id === topic.id) ? topic.id : ''} onChange={event => router.push(topicHref('recall', topic.subject, event.target.value))} className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-2 py-3 text-sm">
          {!visibleTopics.some(item => item.id === topic.id) && <option value="" disabled>주제를 선택하세요</option>}
          {visibleTopics.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </div>
      <nav aria-label="백지 공부 주제" className="hidden max-h-[60vh] gap-1 overflow-y-auto lg:grid">
        {visibleTopics.map(item => <Link key={item.id} href={topicHref('recall', item.subject, item.id)} aria-current={item.id === topic.id ? 'true' : undefined} className={`rounded-lg px-2 py-2.5 text-sm ${item.id === topic.id ? 'bg-sky-950 text-sky-200' : 'text-slate-400 hover:bg-slate-800'}`}>
          {item.title}<span className="mt-1 block text-[11px] text-slate-400">{hydrated && entries[item.id]?.rating === 'done' ? '✓ 설명 가능' : hydrated && entries[item.id]?.rating === 'again' ? '↻ 다시 공부' : '아직 확인 전'}</span>
        </Link>)}
      </nav>
      {visibleTopics.length === 0 && <p className="py-3 text-xs leading-5 text-slate-400">다시 공부로 표시한 주제가 없습니다.</p>}
    </aside>
    <section data-topic-id={topic.id} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-7">
      <p className="mb-2 text-xs font-semibold text-sky-300">{String(index + 1).padStart(2, '0')} / {topics.length} · 기억 꺼내기</p>
      <h2 className="text-2xl font-bold">{topic.title}</h2>
      <p className="my-5 rounded-xl border border-sky-900/70 bg-sky-950/40 p-4 text-sm leading-7 text-sky-100">{topic.question}</p>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><label htmlFor="recall-answer" className="text-sm font-semibold">내가 기억한 내용</label><span role="status" className={`text-xs ${storageError ? 'text-amber-300' : 'text-slate-400'}`}>{!hydrated ? '저장한 답안 불러오는 중…' : storageError ? '저장 불가 · 내용을 별도로 복사해 주세요' : '이 브라우저에 자동 저장'}</span></div>
      <textarea id="recall-answer" disabled={!hydrated} value={entry?.answer ?? ''} onChange={event => setAnswer(topic.id, event.target.value)} placeholder="핵심 개념, 공식, 비교 항목을 보지 않고 적어보세요. 종이에 적은 뒤 여기서는 답안만 확인해도 됩니다." className="min-h-72 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-7 outline-none placeholder:text-slate-400 focus:border-sky-400 disabled:opacity-50" />
      <p className="mt-2 text-xs leading-5 text-slate-400">같은 기기·브라우저에서 이어집니다. 종이에 백지를 채웠다면 바로 답안을 확인하세요.</p>
      <button onClick={() => setRevealed(value => !value)} aria-expanded={revealed} aria-controls="reference-answer" className="mt-5 w-full rounded-xl bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-sky-200">{revealed ? '답안 숨기기' : '답안 확인'}</button>
      {revealed && <div id="reference-answer" data-reference-answer className="mt-7 border-t border-slate-700 pt-6">
        <h3 className="mb-4 text-lg font-bold">빠진 개념 확인하기</h3>
        {topic.summary}
        <SourceReference topicId={topic.id} />
        <fieldset className="mt-6"><legend className="mb-3 text-sm text-slate-300">답안과 비교한 뒤 직접 표시하세요</legend><div className="flex flex-wrap gap-2">
          <button disabled={!hydrated} aria-pressed={entry?.rating === 'again'} onClick={() => setRating(topic.id, 'again')} className={`${buttonClass} ${entry?.rating === 'again' ? 'border-amber-400 text-amber-200' : ''}`}>다시 공부</button>
          <button disabled={!hydrated} aria-pressed={entry?.rating === 'done'} onClick={() => setRating(topic.id, 'done')} className={`${buttonClass} ${entry?.rating === 'done' ? 'border-emerald-400 text-emerald-200' : ''}`}>설명 가능</button>
        </div></fieldset>
      </div>}
      <nav aria-label="주제 이동" className="mt-7 flex justify-between gap-3 border-t border-slate-800 pt-5">
        {previous ? <Link className={buttonClass} href={topicHref('recall', topic.subject, previous.id)}>이전 주제</Link> : <span />}
        {next ? <Link className={buttonClass} href={topicHref('recall', topic.subject, next.id)}>다음 주제</Link> : <Link className={buttonClass} href={topicHref('review', topic.subject)}>전체 복습으로</Link>}
      </nav>
    </section>
  </div>;
}
