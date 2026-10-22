'use client';

import { useEffect, useRef, useState } from 'react';
import { ShareButton } from '@/components/ui/ShareButton';
import { QUESTIONS, START_QUESTION_ID, type QuestionId } from '@/lib/mbti';

type Answer = { questionId: QuestionId; optionIndex: number };

const NOTICE = '이미지 속 흐름도를 바탕으로 만든 재미용 테스트입니다. 정식 MBTI 검사가 아닙니다.';
const focusStyle = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-gray-900';
const primaryStyle = `inline-flex min-h-12 items-center justify-center rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-700 ${focusStyle}`;
const secondaryStyle = `inline-flex min-h-12 items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800 ${focusStyle}`;

export function MbtiQuiz() {
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState<Answer[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  const lastAnswer = history.at(-1);
  const next = lastAnswer
    ? QUESTIONS[lastAnswer.questionId].options[lastAnswer.optionIndex].next
    : { kind: 'question' as const, id: START_QUESTION_ID };
  const questionId = next.kind === 'question' ? next.id : null;
  const question = questionId ? QUESTIONS[questionId] : null;
  const result = next.kind === 'result' ? next.type : null;

  useEffect(() => {
    if (interacted.current) headingRef.current?.focus();
  }, [started, history]);

  function reset() {
    setHistory([]);
    setStarted(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold tracking-wide text-violet-600 dark:text-violet-400">MBTI PLAY</span>
          <ShareButton
            title="재미로 보는 MBTI"
            text="질문을 클릭하며 나의 MBTI를 알아보세요!"
            url="/mbti"
            ariaLabel="MBTI 공유하기"
            className={`min-h-11 ${focusStyle}`}
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        {!started ? (
          <section aria-labelledby="mbti-title" className="rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10 dark:border-gray-800 dark:bg-gray-800/50">
            <span aria-hidden="true" className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-4xl dark:bg-violet-950">🧠</span>
            <p className="mb-3 text-sm font-semibold text-violet-600 dark:text-violet-400">생각은 짧게, 선택은 솔직하게</p>
            <h1 id="mbti-title" ref={headingRef} tabIndex={-1} className="rounded-lg text-3xl font-bold leading-tight tracking-tight outline-none sm:text-4xl">
              재미로 보는 MBTI
            </h1>
            <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-gray-600 dark:text-gray-300">
              질문 하나, 선택 하나.<br />
              내 마음이 가는 답을 따라가면<br className="sm:hidden" /> 나의 유형이 나타나요.
            </p>
            <div className="my-8 flex flex-wrap justify-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-300">
              {['간단한 질문', '16가지 결과', '가입 없이 바로'].map(label => (
                <span key={label} className="rounded-full bg-violet-50 px-3 py-2 dark:bg-violet-950/60">{label}</span>
              ))}
            </div>
            <button
              type="button"
              className={`${primaryStyle} w-full sm:w-auto sm:min-w-56`}
              onClick={() => { interacted.current = true; setStarted(true); }}
            >
              시작하기 <span aria-hidden="true" className="ml-3">→</span>
            </button>
            <p className="mx-auto mt-8 max-w-sm text-xs leading-relaxed text-gray-500 dark:text-gray-400">{NOTICE}</p>
          </section>
        ) : result ? (
          <section aria-labelledby="mbti-title" className="space-y-6">
            <div className="rounded-3xl border border-violet-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10 dark:border-violet-900 dark:bg-gray-800/50">
              <span aria-hidden="true" className="text-4xl">✨</span>
              <p className="mt-5 text-sm font-medium text-gray-600 dark:text-gray-300">내 선택이 도착한 곳은</p>
              <h1 id="mbti-title" ref={headingRef} tabIndex={-1} className="mt-3 rounded-lg text-6xl font-black tracking-wider text-violet-600 outline-none sm:text-7xl dark:text-violet-400">{result}</h1>
              <p className="mt-5 text-sm text-gray-600 dark:text-gray-300">{history.length}번의 선택으로 만난 나의 MBTI</p>
              <p className="mx-auto mt-5 max-w-sm text-xs leading-relaxed text-gray-500 dark:text-gray-400">{NOTICE}</p>
              <button type="button" onClick={reset} className={`${primaryStyle} mt-8 w-full sm:w-auto sm:min-w-56`}>다시 하기</button>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold">내가 고른 답변</h2>
              <ol className="mt-5 space-y-5">
                {history.map((answer, index) => (
                  <li key={answer.questionId} className="flex gap-3">
                    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">{index + 1}</span>
                    <div className="min-w-0 break-words">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{QUESTIONS[answer.questionId].text}</p>
                      <p className="mt-1 text-sm font-medium leading-relaxed">{QUESTIONS[answer.questionId].options[answer.optionIndex].label}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => setHistory(history.slice(0, -1))} className={secondaryStyle}>이전 질문</button>
            </div>
          </section>
        ) : question && questionId ? (
          <section key={questionId} aria-labelledby="mbti-title" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10 dark:border-gray-800 dark:bg-gray-800/50">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">질문 {history.length + 1}</p>
              <span className="text-xs text-gray-500 dark:text-gray-400">마음이 가는 답 하나</span>
            </div>
            <h1 id="mbti-title" ref={headingRef} tabIndex={-1} className="mb-8 mt-6 rounded-lg break-words text-2xl font-bold leading-snug tracking-tight outline-none sm:text-3xl">{question.text}</h1>
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={event => {
                    // A double click must not answer the next question at the same position.
                    if (event.detail > 1) return;
                    setHistory([...history, { questionId, optionIndex }]);
                  }}
                  className={`group flex min-h-16 w-full items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4 text-left transition-colors hover:border-violet-400 hover:bg-violet-50 sm:px-5 dark:border-gray-700 dark:hover:border-violet-500 dark:hover:bg-violet-950/50 ${focusStyle}`}
                >
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500 group-hover:bg-violet-100 group-hover:text-violet-700 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-violet-900 dark:group-hover:text-violet-200">{optionIndex + 1}</span>
                  <span className="min-w-0 flex-1 break-keep text-base font-medium leading-relaxed">{option.label}</span>
                  <span aria-hidden="true" className="text-gray-400 group-hover:text-violet-500">→</span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
              <button type="button" disabled={history.length === 0} onClick={() => setHistory(history.slice(0, -1))} className={secondaryStyle}>이전 질문</button>
              <button type="button" onClick={reset} className={secondaryStyle}>처음부터</button>
            </div>
          </section>
        ) : null}

        <p className="mt-8 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">정답은 없어요. 지금의 나에게 가까운 답을 골라주세요.</p>
      </main>
    </div>
  );
}
