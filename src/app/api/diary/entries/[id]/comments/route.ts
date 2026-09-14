import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireDiaryAuthor } from '@/lib/diary/auth';
import { mapDiaryCommentRow } from '@/lib/diary/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const author = requireDiaryAuthor(request);
  if (!author) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  if (typeof body?.content !== 'string' || !body.content.trim() || body.content.length > 2000) {
    return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('diary_comments')
    .insert({ entry_id: id, author, content: body.content.trim() })
    .select('id, entry_id, author, content, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? '댓글 작성에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ comment: mapDiaryCommentRow(data) });
}
