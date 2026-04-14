import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { requireGrandmaAdminRoute } from '@/lib/grandma/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const unauthorized = await requireGrandmaAdminRoute();
    if (unauthorized) return unauthorized;

    const { id } = await context.params;
    const body = (await request.json()) as { caption?: string | null; taken_year?: number | null };
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('grandma_photos')
      .update({
        caption: body.caption?.trim() || null,
        taken_year: typeof body.taken_year === 'number' ? body.taken_year : null,
      })
      .eq('id', id)
      .select('id, storage_path, caption, taken_year, sort_order, created_at')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? '사진 정보 수정에 실패했습니다.' }, { status: 500 });
    }

    revalidatePath('/grandma/gallery');
    revalidatePath('/grandma/admin');

    return NextResponse.json({
      photo: {
        ...data,
        publicUrl: supabase.storage.from('grandma-photos').getPublicUrl(data.storage_path).data.publicUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '사진 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
