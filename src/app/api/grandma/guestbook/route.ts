import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { containsBlockedWords, getRequestIp, hashValue } from '@/lib/grandma/moderation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      message?: string;
      emoji?: string;
      deletePin?: string;
    };

    const trimmedName = body.name?.trim() ?? '';
    const trimmedMessage = body.message?.trim() ?? '';

    if (!trimmedName || !trimmedMessage || !body.emoji?.trim()) {
      return NextResponse.json({ error: '이름, 메시지, 이모지를 모두 입력해주세요.' }, { status: 400 });
    }

    if (!body.deletePin || !/^\d{4}$/.test(body.deletePin)) {
      return NextResponse.json({ error: '삭제 비밀번호는 4자리 숫자로 입력해주세요.' }, { status: 400 });
    }

    if (containsBlockedWords(trimmedName) || containsBlockedWords(trimmedMessage)) {
      return NextResponse.json({ error: '예의를 지키는 축하 메시지만 남길 수 있어요.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const ipHash = hashValue(getRequestIp(request));
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const [{ data: recentEntries }, { data: duplicateEntries }] = await Promise.all([
      supabase
        .from('grandma_guestbook')
        .select('id', { count: 'exact' })
        .eq('ip_hash', ipHash)
        .gte('created_at', fiveMinutesAgo),
      supabase
        .from('grandma_guestbook')
        .select('id')
        .eq('name', trimmedName)
        .eq('message', trimmedMessage)
        .gte('created_at', thirtyMinutesAgo)
        .limit(1),
    ]);

    if ((recentEntries?.length ?? 0) >= 3) {
      return NextResponse.json({ error: '잠시 후 다시 남겨주세요. 너무 빠르게 여러 번 작성하고 있어요.' }, { status: 429 });
    }

    if ((duplicateEntries?.length ?? 0) > 0) {
      return NextResponse.json({ error: '같은 메시지가 이미 등록되어 있어요. 조금 다르게 남겨주세요.' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('grandma_guestbook')
      .insert({
        name: trimmedName,
        message: trimmedMessage,
        emoji: body.emoji.trim(),
        delete_pin_hash: hashValue(body.deletePin),
        ip_hash: ipHash,
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
