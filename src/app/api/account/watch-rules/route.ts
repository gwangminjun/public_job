import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type WatchRuleBody = {
  id?: string;
  institutionName?: string;
  checkInterval?: 'daily' | 'hourly';
  active?: boolean;
};

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('institution_watch_rules')
    .select('id, institution_name, check_interval, active, last_checked_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map((row) => ({
    id: row.id,
    institutionName: row.institution_name,
    checkInterval: row.check_interval,
    active: row.active,
    lastCheckedAt: row.last_checked_at,
    createdAt: row.created_at,
  })));
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as WatchRuleBody;
  const institutionName = (body.institutionName || '').trim();
  if (!institutionName) {
    return NextResponse.json({ ok: false, message: 'institutionName is required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('institution_watch_rules')
    .upsert({
      id: body.id,
      user_id: user.id,
      institution_name: institutionName,
      check_interval: body.checkInterval === 'hourly' ? 'hourly' : 'daily',
      active: body.active ?? true,
    })
    .select('id, institution_name, check_interval, active, last_checked_at, created_at')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    institutionName: data.institution_name,
    checkInterval: data.check_interval,
    active: data.active,
    lastCheckedAt: data.last_checked_at,
    createdAt: data.created_at,
  });
}
