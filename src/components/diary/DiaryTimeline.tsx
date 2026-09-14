'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { diaryJson } from '@/lib/diary/client';
import { DIARY_MOODS, DiaryAuthor, DiaryDashboard, DiaryEntry, DiaryIdentity } from '@/lib/diary/types';

const authorFallbackNames: Record<DiaryAuthor, string> = { A: 'A', B: 'B' };

function DiaryAuthorColumn({ author, dashboard }: { author: DiaryAuthor; dashboard?: DiaryDashboard }) {
  const authorSummary = dashboard?.authors.find((item) => item.author === author);
  const authorName = authorSummary?.authorName ?? authorFallbackNames[author];
  const { data, isPending, error } = useQuery({
    queryKey: ['diary', 'entries', 'author-column', author],
    queryFn: () => diaryJson<{ entries: DiaryEntry[] }>(`/api/diary/entries?author=${author}&limit=6`),
  });
  const entries = data?.entries ?? [];

  return <section className="diary-card diary-author-column" aria-labelledby={`diary-author-${author}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="diary-eyebrow">{author === 'A' ? '왼쪽 이야기' : '오른쪽 이야기'}</p>
        <h3 id={`diary-author-${author}`} className="text-xl font-bold mt-1">{authorName}의 일기</h3>
      </div>
      <span className="diary-author text-sm shrink-0">{authorName}</span>
    </div>
    <dl className="diary-stat-grid" aria-label={`${authorName}의 이번 달 기록 통계`}>
      <div className="diary-stat"><dt>남긴 일기</dt><dd>{authorSummary?.entries ?? 0}<span>편</span></dd></div>
      <div className="diary-stat"><dt>기록한 날</dt><dd>{authorSummary?.days ?? 0}<span>일</span></dd></div>
      <div className="diary-stat"><dt>많았던 기분</dt><dd>{authorSummary?.favoriteMood ?? '—'}</dd></div>
    </dl>
    <div className="space-y-2">
      {isPending && <p role="status" className="diary-muted text-sm py-4">일기를 불러오는 중...</p>}
      {error && <p role="alert" className="diary-accent text-sm">최근 일기를 불러오지 못했어요.</p>}
      {!isPending && !error && !entries.length && <p className="diary-muted text-sm py-4">아직 남긴 일기가 없어요.</p>}
      {entries.map((entry) => <Link key={entry.id} href={`/diary/${entry.id}`} className="diary-author-entry">
        <time dateTime={entry.entryDate}>{format(parseISO(entry.entryDate), 'M월 d일 (EEE)', { locale: ko })}</time>
        <p className="line-clamp-2">{entry.mood && `${entry.mood} `}{entry.content}</p>
      </Link>)}
    </div>
    <Link href={`/diary?author=${author}`} className="diary-nav-link text-sm self-start -ml-3">{authorName}의 모든 일기 보기</Link>
  </section>;
}

export function DiaryTimeline() {
  const router = useRouter();
  const params = useSearchParams();
  const filters = new URLSearchParams();
  for (const key of ['q', 'month', 'author', 'mood']) if (params.get(key)) filters.set(key, params.get(key)!);
  const query = filters.toString();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const me = useQuery({ queryKey: ['diary', 'me'], queryFn: () => diaryJson<DiaryIdentity>('/api/diary/me') });
  const dashboard = useQuery({
    queryKey: ['diary', 'dashboard', currentMonth],
    queryFn: () => diaryJson<DiaryDashboard>(`/api/diary/dashboard?month=${currentMonth}`),
  });
  const { data, isPending, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ['diary', 'entries', query], initialPageParam: '',
    queryFn: ({ pageParam }) => diaryJson<{ entries: DiaryEntry[]; nextCursor: string | null }>(`/api/diary/entries?${query}&cursor=${encodeURIComponent(pageParam)}`),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const entries = data?.pages.flatMap((page) => page.entries) ?? [];
  const filterCount = ['month', 'author', 'mood'].filter((key) => filters.has(key)).length;

  return <div className="space-y-5">
    <section className="space-y-4" aria-labelledby="author-diaries">
      <div>
        <p className="diary-eyebrow">이번 달의 기록</p>
        <h2 id="author-diaries" className="text-2xl font-bold tracking-tight mt-1">각자의 하루</h2>
        <p className="diary-muted text-sm mt-1">서로의 최근 일기와 이번 달 기록을 한눈에 살펴보세요.</p>
      </div>
      {dashboard.error && <p role="alert" className="diary-comment diary-accent text-sm">이번 달 통계를 불러오지 못했어요.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DiaryAuthorColumn author="A" dashboard={dashboard.data} />
        <DiaryAuthorColumn author="B" dashboard={dashboard.data} />
      </div>
    </section>
    <section className="space-y-4" aria-labelledby="all-diaries">
      <div>
        <p className="diary-eyebrow">모아 보는 기록</p>
        <h2 id="all-diaries" className="text-2xl font-bold tracking-tight mt-1">모든 일기</h2>
      </div>
    <form key={query} className="diary-card space-y-4" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const next = new URLSearchParams();
      for (const key of ['q', 'month', 'author', 'mood']) { const value = String(form.get(key) ?? '').trim(); if (value) next.set(key, value); }
      router.push(next.size ? `/diary?${next}` : '/diary', { scroll: false });
    }}>
      <label className="diary-form-label" htmlFor="diary-search">기억하고 싶은 순간 찾기</label>
      <div className="flex gap-2"><input id="diary-search" type="search" name="q" defaultValue={filters.get('q') ?? ''} maxLength={200} placeholder="일기 본문 검색" className="diary-field flex-1" /><button className="diary-primary px-4 shrink-0 text-sm">검색</button></div>
      <details className="diary-filters" open={filterCount > 0}>
        <summary className="diary-muted cursor-pointer text-sm py-2">상세 필터 {filterCount > 0 && `· ${filterCount}개 적용`}</summary>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <label className="diary-form-label space-y-2"><span>작성 월</span><input type="month" name="month" defaultValue={filters.get('month') ?? ''} className="diary-field" /></label>
          <label className="diary-form-label space-y-2"><span>작성자</span><select name="author" defaultValue={filters.get('author') ?? ''} className="diary-field"><option value="">모두</option>{(me.data?.authors ?? [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }]).map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}</select></label>
          <label className="diary-form-label space-y-2"><span>기분</span><select name="mood" defaultValue={filters.get('mood') ?? ''} className="diary-field"><option value="">모두</option>{DIARY_MOODS.map((mood) => <option key={mood}>{mood}</option>)}</select></label>
        </div>
        <button className="diary-primary w-full sm:w-auto px-5 mt-4 text-sm">필터 적용</button>
      </details>
      {query && <Link href="/diary" className="diary-nav-link text-xs">검색·필터 초기화</Link>}
    </form>
    {isPending ? <p role="status" className="diary-muted text-center py-10">기록을 불러오는 중...</p> : null}
    {error && <div role="alert" className="diary-comment"><p className="diary-accent text-sm">{error.message}</p><button onClick={() => void (entries.length ? fetchNextPage() : refetch())} className="diary-nav-link text-sm">다시 시도</button></div>}
    {!isPending && !error && !entries.length && <div className="diary-card text-center py-12"><p className="text-3xl mb-3">📖</p><p className="diary-muted">{query ? '조건에 맞는 일기가 없어요. 검색어와 필터를 바꿔보세요.' : '아직 쓴 일기가 없어요. 첫 이야기를 남겨보세요.'}</p><Link href={query ? '/diary' : '/diary/write'} className="diary-primary inline-flex items-center px-5 mt-6">{query ? '모든 일기 보기' : '첫 일기 쓰기'}</Link></div>}
    {entries.map((entry) => <Link key={entry.id} href={`/diary/${entry.id}`} className="diary-card diary-entry block">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-4"><time dateTime={entry.entryDate} className="text-base sm:text-lg font-semibold diary-accent">{format(parseISO(entry.entryDate), 'yyyy년 M월 d일 (EEE)', { locale: ko })}</time><span className="diary-author text-sm break-all">{entry.authorName}</span></div>
      <p className="text-base leading-7 break-words line-clamp-3">{entry.mood && `${entry.mood} `}{entry.content}</p>
      {!!entry.photoUrls.length && <div className="flex gap-3 mt-5">{entry.photoUrls.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        url ? <img key={url} src={url} alt={`일기 사진 ${i + 1}`} loading="lazy" className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover" /> : <span key={i} className="diary-muted text-xs">사진을 불러오지 못했어요.</span>
      ))}</div>}
    </Link>)}
    {hasNextPage && <button disabled={isFetchingNextPage} onClick={() => void fetchNextPage()} className="diary-primary w-full text-sm">{isFetchingNextPage ? '불러오는 중...' : '이전 일기 더 보기'}</button>}
    </section>
  </div>;
}
