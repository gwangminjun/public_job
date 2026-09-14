import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireDiaryAuthor } from '@/lib/diary/auth';
import { mapDiaryCommentRow, mapDiaryEntryRow } from '@/lib/diary/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const author = requireDiaryAuthor(request);
  if (!author) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  const { data: entryRow, error: entryError } = await supabase
    .from('diary_entries')
    .select('id, author, entry_date, mood, content, photo_paths, created_at, updated_at')
    .eq('id', id)
    .single();

  if (entryError || !entryRow) {
    return NextResponse.json({ error: entryError?.message ?? '일기를 찾을 수 없습니다.' }, { status: 404 });
  }

  const { data: commentRows, error: commentError } = await supabase
    .from('diary_comments')
    .select('id, entry_id, author, content, created_at')
    .eq('entry_id', id)
    .order('created_at', { ascending: true });

  if (commentError) {
    return NextResponse.json({ error: commentError.message }, { status: 500 });
  }

  const entry = await mapDiaryEntryRow(supabase, entryRow);
  const comments = commentRows.map(mapDiaryCommentRow);

  return NextResponse.json({ ...entry, comments });
}

export async function PUT(request: Request, context: RouteContext) {
  const author = requireDiaryAuthor(request);
  if (!author) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { content?: string; mood?: string | null; entryDate?: string };

  if (!body.content?.trim() || !body.entryDate) {
    return NextResponse.json({ error: '날짜와 내용을 입력해주세요.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('diary_entries')
    .update({
      content: body.content.trim(),
      mood: body.mood?.trim() || null,
      entry_date: body.entryDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, author, entry_date, mood, content, photo_paths, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? '일기 수정에 실패했습니다.' }, { status: 500 });
  }

  const entry = await mapDiaryEntryRow(supabase, data);

  return NextResponse.json({ entry });
}

export async function DELETE(request: Request, context: RouteContext) {
  const author = requireDiaryAuthor(request);
  if (!author) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  const { data: entryRow } = await supabase.from('diary_entries').select('photo_paths').eq('id', id).single();

  const { error } = await supabase.from('diary_entries').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (entryRow?.photo_paths?.length) {
    await supabase.storage.from('diary-photos').remove(entryRow.photo_paths);
  }

  return NextResponse.json({ success: true });
}
