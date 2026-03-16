import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: String(error) }, { status: 500 });
  }
}
