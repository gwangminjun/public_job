import { NextResponse } from 'next/server';
import { requireDiaryAuthor } from '@/lib/diary/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { validateEntry } from '@/lib/diary/validation';

export async function GET(request: Request) {
  const author = requireDiaryAuthor(request);
  if (!author) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await createSupabaseAdminClient().from('diary_drafts').select('*').eq('author', author).maybeSingle();
  if (error) return NextResponse.json({ error: '임시 저장을 불러올 수 없습니다.' }, { status: 500 });
  return NextResponse.json({ draft: data });
}
export async function PUT(request: Request) {
  const author = requireDiaryAuthor(request);
  if (!author) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const invalid = validateEntry(body, true);
  if (invalid || !(body?.version === null || (typeof body?.version === 'string' && /^[\da-f-]{36}$/i.test(body.version)))) return NextResponse.json({ error: invalid ?? '잘못된 버전입니다.' }, { status: 400 });
  const db = createSupabaseAdminClient();
  const row = { author, entry_date: body.entryDate, content: body.content, mood: body.mood ?? null, version: crypto.randomUUID(), updated_at: new Date().toISOString() };
  const result = body.version === null
    ? await db.from('diary_drafts').insert(row).select().single()
    : await db.from('diary_drafts').update(row).eq('author', author).eq('version', body.version).select().maybeSingle();
  if (result.error && result.error.code !== '23505') return NextResponse.json({ error: '임시 저장에 실패했습니다.' }, { status: 500 });
  if (!result.data || result.error) return NextResponse.json({ error: '다른 탭에서 초안을 변경했습니다. 새로고침 후 다시 확인해주세요.' }, { status: 409 });
  return NextResponse.json({ draft: result.data });
}
export async function DELETE(request: Request) {
  const author = requireDiaryAuthor(request);
  if (!author) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const version = new URL(request.url).searchParams.get('version');
  if (!version || !/^[\da-f-]{36}$/i.test(version)) return NextResponse.json({ error: '잘못된 버전입니다.' }, { status: 400 });
  const { data, error } = await createSupabaseAdminClient().from('diary_drafts').delete().eq('author', author).eq('version', version).select('author');
  if (error) return NextResponse.json({ error: '초안을 삭제하지 못했습니다.' }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: '다른 탭에서 변경한 초안은 삭제하지 않았습니다.' }, { status: 409 });
  return NextResponse.json({ success: true });
}
