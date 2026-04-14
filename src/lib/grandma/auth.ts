import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getGrandmaAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function requireGrandmaAdminPage() {
  const user = await getGrandmaAdminUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/grandma/admin');
  }

  return user;
}

export async function requireGrandmaAdminRoute() {
  const user = await getGrandmaAdminUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요한 관리자 기능입니다.' }, { status: 401 });
  }

  return null;
}
