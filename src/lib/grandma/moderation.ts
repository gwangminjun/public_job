import { createHash } from 'node:crypto';

const BLOCKED_WORDS = ['씨발', '시발', '병신', '미친놈', '미친년', '좆', '개새끼', '죽어'];

export function normalizeText(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

export function containsBlockedWords(value: string) {
  const normalized = normalizeText(value);
  return BLOCKED_WORDS.some((word) => normalized.includes(word));
}

export function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  return forwardedFor?.split(',')[0]?.trim() ?? realIp?.trim() ?? 'unknown';
}
