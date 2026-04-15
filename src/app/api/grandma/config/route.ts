import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getGrandmaStoragePathFromUrl, GRANDMA_VIDEO_BUCKET } from '@/lib/grandma/shared';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      event_date?: string;
      event_time?: string;
      location?: string;
      location_detail?: string | null;
      host?: string;
      celebration_video_title?: string | null;
      celebration_video_url?: string | null;
      previous_celebration_video_url?: string | null;
    };

    if (!body.event_date || !body.event_time || !body.location?.trim() || !body.host?.trim()) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const previousStoragePath = getGrandmaStoragePathFromUrl(body.previous_celebration_video_url ?? null);
    const nextStoragePath = getGrandmaStoragePathFromUrl(body.celebration_video_url ?? null);
    const { data, error } = await supabase
      .from('grandma_config')
      .upsert({
        id: 1,
        event_date: body.event_date,
        event_time: body.event_time,
        location: body.location.trim(),
        location_detail: body.location_detail?.trim() || null,
        host: body.host.trim(),
        celebration_video_title: body.celebration_video_title?.trim() || null,
        celebration_video_url: body.celebration_video_url?.trim() || null,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? '잔치 정보 저장에 실패했습니다.' }, { status: 500 });
    }

    if (previousStoragePath && previousStoragePath !== nextStoragePath) {
      await supabase.storage.from(GRANDMA_VIDEO_BUCKET).remove([previousStoragePath]);
    }

    revalidatePath('/grandma');
    revalidatePath('/grandma/admin');
    revalidatePath('/grandma/video');

    return NextResponse.json({ config: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '잔치 정보 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
