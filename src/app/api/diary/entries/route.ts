import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireDiaryAuthor } from '@/lib/diary/auth';
import { mapDiaryEntryRow } from '@/lib/diary/server';
import { decodeCursor, encodeCursor, validMonth } from '@/lib/diary/validation';
import { DIARY_MOODS } from '@/lib/diary/types';
import { readEntryInput, uploadPhotos } from '@/lib/diary/uploads';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (!requireDiaryAuthor(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const month = params.get('month'), author = params.get('author'), mood = params.get('mood');
  const search = params.get('q')?.trim() ?? '';
  const limit = Number(params.get('limit') ?? 20);
  if ((month && !validMonth(month)) || (author && !['A', 'B'].includes(author)) || (mood && !(DIARY_MOODS as readonly string[]).includes(mood)) || search.length > 200 || !Number.isInteger(limit) || limit < 1 || limit > 50) return NextResponse.json({ error: '검색 조건을 확인해주세요.' }, { status: 400 });
  let cursor;
  try { cursor = params.get('cursor') ? decodeCursor(params.get('cursor')!) : null; }
  catch { return NextResponse.json({ error: '페이지 정보가 올바르지 않습니다.' }, { status: 400 }); }
  const db = createSupabaseAdminClient();
  let query = db.from('diary_entries').select('id, author, entry_date, mood, content, photo_paths, created_at, updated_at');
  if (month) {
    const next = new Date(`${month}-01T00:00:00Z`);
    next.setUTCMonth(next.getUTCMonth() + 1);
    query = query.gte('entry_date', `${month}-01`).lt('entry_date', next.toISOString().slice(0, 10));
  }
  if (author) query = query.eq('author', author);
  if (mood) query = query.eq('mood', mood);
  if (search) query = query.ilike('content', `%${search.replace(/[\\%_]/g, '\\$&')}%`);
  if (cursor) query = query.or(`entry_date.lt.${cursor.date},and(entry_date.eq.${cursor.date},created_at.lt.${cursor.created}),and(entry_date.eq.${cursor.date},created_at.eq.${cursor.created},id.lt.${cursor.id})`);
  const { data, error } = await query.order('entry_date', { ascending: false }).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(limit + 1);
  if (error) return NextResponse.json({ error: '일기 목록을 불러오지 못했습니다.' }, { status: 500 });
  const rows = data.slice(0, limit);
  const entries = await Promise.all(rows.map((row) => mapDiaryEntryRow(db, { ...row, content: row.content.slice(0, 300), photo_paths: row.photo_paths.slice(0, 3) })));
  const last = rows.at(-1);
  return NextResponse.json({ entries, nextCursor: data.length > limit && last ? encodeCursor({ date: last.entry_date, created: last.created_at, id: last.id }) : null });
}
export async function POST(request: Request) {
  const author = requireDiaryAuthor(request);
  if (!author) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let input;
  try { input = await readEntryInput(request); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : '입력 형식을 확인해주세요.' }, { status: 400 }); }
  const db = createSupabaseAdminClient();
  let paths: string[] = [];
  try {
    paths = await uploadPhotos(db, input.files, 0);
    const { body } = input;
    const { data, error } = await db.from('diary_entries').insert({ author, entry_date: body.entryDate, content: body.content.trim(), mood: body.mood ?? null, photo_paths: paths }).select('id').single();
    if (error || !data) throw new Error('일기를 저장하지 못했습니다.');
    return NextResponse.json({ entry: { id: data.id } }, { status: 201 });
  } catch (error) {
    if (paths.length) await db.storage.from('diary-photos').remove(paths);
    return NextResponse.json({ error: error instanceof Error ? error.message : '저장에 실패했습니다.' }, { status: 500 });
  }
}
