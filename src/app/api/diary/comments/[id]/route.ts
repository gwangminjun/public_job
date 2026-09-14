import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireDiaryAuthor } from '@/lib/diary/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  const author = requireDiaryAuthor(request);
  if (!author) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('diary_comments').delete().eq('id', id).eq('author', author).select('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data?.length) return NextResponse.json({ error: '본인의 댓글만 삭제할 수 있습니다.' }, { status: 403 });

  return NextResponse.json({ success: true });
}
