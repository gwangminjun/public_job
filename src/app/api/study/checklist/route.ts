import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const STATE_ID = 'security-engineer-20260923';

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('study_checklist_state')
    .select('checked, memos')
    .eq('id', STATE_ID)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ checked: data.checked ?? {}, memos: data.memos ?? {} });
}

export async function PUT(request: NextRequest) {
  const expectedSecret = process.env.NEXT_PUBLIC_STUDY_EDIT_SECRET?.trim();
  if (!expectedSecret) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_STUDY_EDIT_SECRET is not configured' }, { status: 500 });
  }

  const providedSecret = request.headers.get('x-study-secret')?.trim();
  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { checked?: Record<string, boolean>; memos?: Record<string, string> };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('study_checklist_state')
    .update({
      checked: body.checked ?? {},
      memos: body.memos ?? {},
      updated_at: new Date().toISOString(),
    })
    .eq('id', STATE_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
