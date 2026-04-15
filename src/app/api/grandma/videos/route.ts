import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { GRANDMA_VIDEO_BUCKET } from '@/lib/grandma/shared';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '영상 파일을 선택해주세요.' }, { status: 400 });
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: '영상 파일만 업로드할 수 있습니다.' }, { status: 400 });
    }

    if (file.size > 300 * 1024 * 1024) {
      return NextResponse.json({ error: '영상 파일은 300MB 이하만 업로드할 수 있습니다.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const ext = file.name.split('.').pop() ?? 'mp4';
    const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage.from(GRANDMA_VIDEO_BUCKET).upload(path, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'video/mp4',
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(GRANDMA_VIDEO_BUCKET).getPublicUrl(path).data.publicUrl;

    revalidatePath('/grandma');
    revalidatePath('/grandma/admin');
    revalidatePath('/grandma/video');

    return NextResponse.json({ videoUrl: publicUrl, path, fileName: file.name });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '영상 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { path?: string };

    if (!body.path) {
      return NextResponse.json({ error: '삭제할 영상 경로가 없습니다.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(GRANDMA_VIDEO_BUCKET).remove([body.path]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '영상 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
