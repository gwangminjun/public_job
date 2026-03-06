import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type UpdateBody = {
  displayName?: string;
  language?: 'ko' | 'en';
  theme?: 'system' | 'light' | 'dark';
  timezone?: string;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as UpdateBody;
    const language = body.language === 'en' ? 'en' : 'ko';
    const theme = body.theme && ['system', 'light', 'dark'].includes(body.theme) ? body.theme : 'system';
    const timezone = (body.timezone || 'Asia/Seoul').trim() || 'Asia/Seoul';
    const displayName = (body.displayName || '').trim();

    const admin = createSupabaseAdminClient();

    const { error: profileError } = await admin
      .from('user_profiles')
      .upsert(
        {
          id: user.id,
          email: user.email ?? null,
          display_name: displayName,
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      return NextResponse.json(
        { ok: false, message: profileError.message, code: profileError.code },
        { status: 500 }
      );
    }

    const { error: prefError } = await admin
      .from('user_preferences')
      .upsert(
        {
          user_id: user.id,
          language,
          theme,
          timezone,
        },
        { onConflict: 'user_id' }
      );

    if (prefError) {
      return NextResponse.json(
        { ok: false, message: prefError.message, code: prefError.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: String(error) },
      { status: 500 }
    );
  }
}
