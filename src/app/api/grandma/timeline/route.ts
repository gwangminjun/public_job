import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireGrandmaAdminRoute } from '@/lib/grandma/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const unauthorized = await requireGrandmaAdminRoute();
    if (unauthorized) return unauthorized;

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
      .insert({
        year: body.year,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        emoji: body.emoji?.trim() || null,
        highlight: Boolean(body.highlight),
        sort_order: body.sort_order,
      })
      .select('id, year, title, description, emoji, highlight, sort_order')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? '타임라인 추가에 실패했습니다.' }, { status: 500 });
    }

    revalidatePath('/grandma/timeline');
    revalidatePath('/grandma/admin');

    return NextResponse.json({ event: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '타임라인 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
