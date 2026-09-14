import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireDiaryAuthor } from '@/lib/diary/auth';
import { mapDiaryEntryRow } from '@/lib/diary/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const author = requireDiaryAuthor(request);
  if (!author) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('diary_entries')
    .select('id, author, entry_date, mood, content, photo_paths, created_at, updated_at')
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = await Promise.all(data.map((row) => mapDiaryEntryRow(supabase, row)));

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const author = requireDiaryAuthor(request);
  if (!author) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const content = (formData.get('content') as string | null)?.trim();
    const entryDate = formData.get('entryDate') as string | null;
    const mood = (formData.get('mood') as string | null)?.trim() || null;
    const photos = formData.getAll('photos').filter((f): f is File => f instanceof File);

    if (!content || !entryDate) {
      return NextResponse.json({ error: '날짜와 내용을 입력해주세요.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const uploadedPaths: string[] = [];

    for (const photo of photos) {
      const ext = photo.name.split('.').pop() ?? 'jpg';
      const path = `entries/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer = Buffer.from(await photo.arrayBuffer());
      const { error: uploadError } = await supabase.storage.from('diary-photos').upload(path, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: photo.type || 'application/octet-stream',
      });

      if (uploadError) {
        await supabase.storage.from('diary-photos').remove(uploadedPaths);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      uploadedPaths.push(path);
    }

    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        author,
        entry_date: entryDate,
        mood,
        content,
        photo_paths: uploadedPaths,
      })
      .select('id, author, entry_date, mood, content, photo_paths, created_at, updated_at')
      .single();

    if (error || !data) {
      if (uploadedPaths.length) {
        await supabase.storage.from('diary-photos').remove(uploadedPaths);
      }
      return NextResponse.json({ error: error?.message ?? '일기 저장에 실패했습니다.' }, { status: 500 });
    }

    const entry = await mapDiaryEntryRow(supabase, data);

    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '일기 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
