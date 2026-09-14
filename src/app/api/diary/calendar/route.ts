import { NextResponse } from 'next/server';
import { endOfMonth, endOfWeek, format, parseISO, startOfWeek } from 'date-fns';
import { getDiaryAuthorName, requireDiaryAuthor } from '@/lib/diary/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { validMonth } from '@/lib/diary/validation';
import type { DiaryAuthor, DiaryCalendarData } from '@/lib/diary/types';

export async function GET(request: Request) {
  if (!requireDiaryAuthor(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const month = new URL(request.url).searchParams.get('month') ?? '';
  if (!validMonth(month)) return NextResponse.json({ error: '월을 확인해주세요.' }, { status: 400 });
  const date = parseISO(`${month}-01`);
  const start = format(startOfWeek(date), 'yyyy-MM-dd');
  const end = format(endOfWeek(endOfMonth(date)), 'yyyy-MM-dd');
  const db = createSupabaseAdminClient();
  const result: DiaryCalendarData = { days: [], summary: { entries: 0, days: 0, moods: {} } };
  const grouped = new Map<string, DiaryCalendarData['days'][number]>();
  const monthDays = new Set<string>();
  // Supabase caps individual responses; read each page to keep monthly totals exact.
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from('diary_entries').select('id, author, entry_date, mood, content').gte('entry_date', start).lte('entry_date', end).order('entry_date').order('id').range(offset, offset + 499);
    if (error) return NextResponse.json({ error: '달력을 불러오지 못했습니다.' }, { status: 500 });
    for (const row of data) {
      const day: DiaryCalendarData['days'][number] = grouped.get(row.entry_date) ?? { date: row.entry_date, count: 0, entries: [] };
      day.count++;
      day.entries.push({ id: row.id, author: row.author, authorName: getDiaryAuthorName(row.author as DiaryAuthor), mood: row.mood, excerpt: row.content.slice(0, 140) });
      grouped.set(row.entry_date, day);
      if (row.entry_date.startsWith(month)) {
        result.summary.entries++;
        monthDays.add(row.entry_date);
        if (row.mood) result.summary.moods[row.mood] = (result.summary.moods[row.mood] ?? 0) + 1;
      }
    }
    if (data.length < 500) break;
  }
  result.days = [...grouped.values()];
  result.summary.days = monthDays.size;
  return NextResponse.json(result);
}
