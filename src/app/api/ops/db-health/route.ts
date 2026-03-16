import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.OPS_HEALTHCHECK_SECRET?.trim();

  if (expectedSecret) {
    const providedSecret = request.headers.get('x-ops-secret')?.trim();
    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from('user_profiles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: String(error) },
      { status: 500 }
    );
  }
}
