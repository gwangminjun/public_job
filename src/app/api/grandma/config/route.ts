import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireGrandmaAdminPassword } from '@/lib/grandma/auth';
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
    };

    const unauthorized = await requireGrandmaAdminPassword();
    if (unauthorized) return unauthorized;

    if (!body.event_date || !body.event_time || !body.location?.trim() || !body.host?.trim()) {
      return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
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
