import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function hashPin(pin: string) {
  return createHash('sha256').update(pin).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      message?: string;
      emoji?: string;
      deletePin?: string;
    };

    if (!body.name?.trim() || !body.message?.trim() || !body.emoji?.trim()) {
      return NextResponse.json({ error: '이름, 메시지, 이모지를 모두 입력해주세요.' }, { status: 400 });
    }

    if (!body.deletePin || !/^\d{4}$/.test(body.deletePin)) {
      return NextResponse.json({ error: '삭제 비밀번호는 4자리 숫자로 입력해주세요.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('grandma_guestbook')
      .insert({
        name: body.name.trim(),
        message: body.message.trim(),
        emoji: body.emoji.trim(),
        delete_pin_hash: hashPin(body.deletePin),
      })
      .select('id, name, message, emoji, created_at')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? '메시지 저장에 실패했습니다.' }, { status: 500 });
    }

    revalidatePath('/grandma/guestbook');

    return NextResponse.json({ entry: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '방명록 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
