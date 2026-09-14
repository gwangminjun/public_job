import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireDiaryAuthor } from '@/lib/diary/auth';
import { mapDiaryCommentRow, mapDiaryEntryRow } from '@/lib/diary/server';
import { readEntryInput, uploadPhotos } from '@/lib/diary/uploads';
import { validatePhotos } from '@/lib/diary/validation';

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
  const supabase = createSupabaseAdminClient();
  let input;
  try { input = await readEntryInput(request); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : '입력 형식이 올바르지 않습니다.' }, { status: 400 }); }
  const { body, files } = input;
  if (typeof body.updatedAt !== 'string' || !Number.isFinite(Date.parse(body.updatedAt))) return NextResponse.json({ error: '수정 버전이 필요합니다.' }, { status: 400 });
  const { data: original, error: readError } = await supabase.from('diary_entries').select('author, photo_paths, updated_at').eq('id', id).maybeSingle();
  if (readError) return NextResponse.json({ error: '일기를 불러오지 못했습니다.' }, { status: 500 });
  if (!original) return NextResponse.json({ error: '일기를 찾을 수 없습니다.' }, { status: 404 });
  if (original.author !== author) return NextResponse.json({ error: '본인의 일기만 수정할 수 있습니다.' }, { status: 403 });
  if (original.updated_at !== body.updatedAt) return NextResponse.json({ error: '다른 화면에서 수정한 일기입니다. 입력을 복사한 뒤 새로고침해주세요.' }, { status: 409 });
  const retained = body.retainedPhotos ?? original.photo_paths;
  if (!Array.isArray(retained) || retained.some((p) => typeof p !== 'string' || !original.photo_paths.includes(p)) || new Set(retained).size !== retained.length) return NextResponse.json({ error: '사진 선택이 올바르지 않습니다.' }, { status: 400 });
  const photoError = validatePhotos(files, retained.length);
  if (photoError) return NextResponse.json({ error: photoError }, { status: 400 });
  let uploaded: string[];
  try { uploaded = await uploadPhotos(supabase, files, retained.length); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : '사진 업로드에 실패했습니다.' }, { status: 500 }); }
  const { data, error } = await supabase
    .from('diary_entries')
    .update({
      content: body.content.trim(),
      mood: body.mood?.trim() || null,
      entry_date: body.entryDate,
      updated_at: new Date().toISOString(),
      photo_paths: [...retained, ...uploaded],
    })
    .eq('id', id)
    .eq('author', author)
    .eq('updated_at', body.updatedAt)
    .select('id, author, entry_date, mood, content, photo_paths, created_at, updated_at')
    .maybeSingle();

  if (error || !data) {
    if (uploaded.length) await supabase.storage.from('diary-photos').remove(uploaded);
    return NextResponse.json({ error: error ? '일기 수정에 실패했습니다.' : '일기가 변경되었습니다. 입력을 복사한 뒤 새로고침해주세요.' }, { status: error ? 500 : 409 });
  }
  const removed = (original.photo_paths as string[]).filter((p) => !retained.includes(p));
  if (removed.length) await supabase.storage.from('diary-photos').remove(removed);
  return NextResponse.json({ entry: { id: data.id } });
}

export async function DELETE(request: Request, context: RouteContext) {
  const author = requireDiaryAuthor(request);
  if (!author) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  const { data: entryRow, error: readError } = await supabase.from('diary_entries').select('author, photo_paths, updated_at').eq('id', id).maybeSingle();
  if (readError) return NextResponse.json({ error: '일기를 불러오지 못했습니다.' }, { status: 500 });
  if (!entryRow) return NextResponse.json({ error: '일기를 찾을 수 없습니다.' }, { status: 404 });
  if (entryRow.author !== author) return NextResponse.json({ error: '본인의 일기만 삭제할 수 있습니다.' }, { status: 403 });
  const { data: deleted, error } = await supabase.from('diary_entries').delete().eq('id', id).eq('author', author).eq('updated_at', entryRow.updated_at).select('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!deleted?.length) return NextResponse.json({ error: '일기가 변경되었습니다. 새로고침 후 다시 시도해주세요.' }, { status: 409 });

  if (entryRow?.photo_paths?.length) {
    await supabase.storage.from('diary-photos').remove(entryRow.photo_paths);
  }

  return NextResponse.json({ success: true });
}
