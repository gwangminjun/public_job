import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type UpdateBody = {
  displayName?: string;
  language?: 'ko' | 'en';
  theme?: 'system' | 'light' | 'dark';
  timezone?: string;
};

function isSchemaCacheTableMissing(message?: string, code?: string): boolean {
  if (code === 'PGRST205') {
    return true;
  }

  const normalized = (message || '').toLowerCase();
  return (
    normalized.includes('could not find the table') ||
    normalized.includes('schema cache') ||
    normalized.includes('public.user_profiles') ||
    normalized.includes('public.user_preferences')
  );
}

const SCHEMA_GUIDE_MESSAGE =
  'Supabase 스키마가 아직 적용되지 않았거나 캐시가 갱신되지 않았습니다. SQL Editor에서 supabase/migrations/0001_init_public_job.sql 실행 후 "select pg_notify(\'pgrst\', \'reload schema\');"를 실행해 주세요.';

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

    // Verify user actually exists in auth.users (guards against stale sessions)
    const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(user.id);
    if (authUserError || !authUser?.user) {
      return NextResponse.json(
        { ok: false, message: '세션이 만료되었습니다. 다시 로그인해 주세요.' },
        { status: 401 }
      );
    }

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
      if (isSchemaCacheTableMissing(profileError.message, profileError.code)) {
        return NextResponse.json(
          { ok: false, message: SCHEMA_GUIDE_MESSAGE, code: profileError.code },
          { status: 500 }
        );
      }

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
      if (isSchemaCacheTableMissing(prefError.message, prefError.code)) {
        return NextResponse.json(
          { ok: false, message: SCHEMA_GUIDE_MESSAGE, code: prefError.code },
          { status: 500 }
        );
      }

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
