import { NextResponse } from 'next/server';
import { getDiaryAuthorName, requireDiaryAuthor } from '@/lib/diary/auth';
import { calculateAuthorStatistics } from '@/lib/diary/dashboard';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { validMonth } from '@/lib/diary/validation';

export async function GET(request: Request) {
  if (!requireDiaryAuthor(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const month = new URL(request.url).searchParams.get('month') ?? '';
  if (!validMonth(month)) return NextResponse.json({ error: '월을 확인해주세요.' }, { status: 400 });

  const next = new Date(`${month}-01T00:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const data: { author: string; entry_date: string; mood: string | null }[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data: page, error } = await createSupabaseAdminClient()
      .from('diary_entries')
      .select('author, entry_date, mood')
      .gte('entry_date', `${month}-01`)
      .lt('entry_date', next.toISOString().slice(0, 10))
      .range(offset, offset + pageSize - 1);
    if (error) return NextResponse.json({ error: '사용자별 통계를 불러오지 못했습니다.' }, { status: 500 });
    data.push(...page);
    if (page.length < pageSize) break;
  }

  const statistics = calculateAuthorStatistics(data.map((row) => ({ author: row.author as 'A' | 'B', entryDate: row.entry_date, mood: row.mood })));
  return NextResponse.json({
    month,
    authors: (['A', 'B'] as const).map((author) => ({ author, authorName: getDiaryAuthorName(author), ...statistics[author] })),
  });
}
