import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  buildGrandmaAdminSession,
  GRANDMA_ADMIN_COOKIE,
  isGrandmaAdminConfigured,
} from '@/lib/grandma/auth';

const COOKIE_MAX_AGE = 60 * 60 * 12;

export async function POST(request: Request) {
  try {
    if (!isGrandmaAdminConfigured()) {
      return NextResponse.json({ error: '서버에 관리자 비밀번호가 설정되지 않았습니다.' }, { status: 500 });
    }

    const body = (await request.json()) as { password?: string };
    const configuredPassword = process.env.GRANDMA_ADMIN_PASSWORD?.trim() ?? '';

    if (!body.password || body.password !== configuredPassword) {
      return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(GRANDMA_ADMIN_COOKIE, buildGrandmaAdminSession(configuredPassword), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '관리자 인증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(GRANDMA_ADMIN_COOKIE);
  return NextResponse.json({ success: true });
}
