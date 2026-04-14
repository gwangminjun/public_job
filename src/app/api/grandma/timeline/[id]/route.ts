import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
    const body = (await request.json()) as {
      year?: number;
      title?: string;
      description?: string | null;
      emoji?: string | null;
      highlight?: boolean;
      sort_order?: number;
    };

    if (
      !body.year ||
      !body.title?.trim() ||
      typeof body.sort_order !== 'number' ||
      Number.isNaN(body.sort_order)
    ) {
      return NextResponse.json({ error: '필수 항목을 확인해주세요.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('grandma_timeline')
      .update({
        year: body.year,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        emoji: body.emoji?.trim() || null,
        highlight: Boolean(body.highlight),
        sort_order: body.sort_order,
      })
      .eq('id', id)
      .select('id, year, title, description, emoji, highlight, sort_order')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? '타임라인 수정에 실패했습니다.' }, { status: 500 });
    }

    revalidatePath('/grandma/timeline');
    revalidatePath('/grandma/admin');

    return NextResponse.json({ event: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '타임라인 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const unauthorized = await requireGrandmaAdminRoute();
    if (unauthorized) return unauthorized;

    const { id } = await context.params;
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('grandma_timeline').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/grandma/timeline');
    revalidatePath('/grandma/admin');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '타임라인 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
