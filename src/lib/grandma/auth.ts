import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const GRANDMA_ADMIN_COOKIE = 'grandma_admin_session';

function hashPassword(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function getConfiguredPassword() {
  return process.env.GRANDMA_ADMIN_PASSWORD?.trim() ?? '';
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isGrandmaAdminConfigured() {
  return getConfiguredPassword().length > 0;
}

export async function isGrandmaAdminAuthorized() {
  const configuredPassword = getConfiguredPassword();
  if (!configuredPassword) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(GRANDMA_ADMIN_COOKIE)?.value;
  if (!sessionToken) {
    return false;
  }

  return safeCompare(sessionToken, hashPassword(configuredPassword));
}

export async function requireGrandmaAdminPassword() {
  const authorized = await isGrandmaAdminAuthorized();
  if (authorized) {
    return null;
  }

  return NextResponse.json({ error: '관리 비밀번호가 필요합니다.' }, { status: 401 });
}

export function buildGrandmaAdminSession(password: string) {
  return hashPassword(password);
}
