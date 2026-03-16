import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sendSlackWebhookMessage } from '@/lib/server/slack';
import { maskSlackWebhook, validateSlackWebhookUrl } from '@/lib/server/slackWebhook';

type NotificationTargetBody = {
  destination?: string;
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
    .from('notification_targets')
    .select('id, channel, destination, verified, active, consented_at, opted_out_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map((item) => ({
    ...item,
    destination: maskSlackWebhook(item.destination),
  })));
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as NotificationTargetBody;
  const rawDestination = (body.destination || '').trim();
  if (!rawDestination) {
    return NextResponse.json({ ok: false, message: 'destination is required' }, { status: 400 });
  }

  const destination = validateSlackWebhookUrl(rawDestination);

  await sendSlackWebhookMessage(destination, `Public Job Portal Slack 알림 테스트: ${user.email ?? user.id}`);

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from('notification_targets')
    .select('id')
    .eq('user_id', user.id)
    .eq('channel', 'slack')
    .maybeSingle();

  const { data, error } = await supabase
    .from('notification_targets')
    .upsert(
      {
        id: existing?.id,
        user_id: user.id,
        channel: 'slack',
        destination,
        verified: true,
        active: true,
        consented_at: new Date().toISOString(),
        opted_out_at: null,
      },
      { onConflict: 'id' }
    )
    .select('id, channel, destination, verified, active, consented_at, opted_out_at, created_at')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...data,
    destination: maskSlackWebhook(data.destination),
  });
}
