import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function hashPin(pin: string) {
  return createHash('sha256').update(pin).digest('hex');
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { deletePin?: string };

    if (!body.deletePin || !/^\d{4}$/.test(body.deletePin)) {
      return NextResponse.json({ error: '삭제 비밀번호를 다시 확인해주세요.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: entry, error: fetchError } = await supabase
      .from('grandma_guestbook')
      .select('delete_pin_hash')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !entry) {
      return NextResponse.json({ error: '삭제할 메시지를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (!entry.delete_pin_hash || entry.delete_pin_hash !== hashPin(body.deletePin)) {
      return NextResponse.json({ error: '삭제 비밀번호가 일치하지 않습니다.' }, { status: 403 });
    }

    const { error } = await supabase.from('grandma_guestbook').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/grandma/guestbook');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '방명록 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
