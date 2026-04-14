import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { ids?: string[] };

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({ error: '정렬할 사진 목록이 비어 있습니다.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    for (const [index, id] of body.ids.entries()) {
      const { error } = await supabase
        .from('grandma_photos')
        .update({ sort_order: (index + 1) * 10 })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    revalidatePath('/grandma/gallery');
    revalidatePath('/grandma/admin');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '사진 순서 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
