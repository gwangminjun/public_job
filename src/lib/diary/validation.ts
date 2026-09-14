export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PHOTOS = 6;
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const MOODS = ['😊', '🥰', '😢', '😡', '😴', '🥳', '😰', '🤔'];

export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validMonth(value: string) { return /^\d{4}-\d{2}$/.test(value) && validDate(`${value}-01`); }
export function validateEntry(value: unknown, allowEmpty = false): string | null {
  if (!value || typeof value !== 'object') return '입력 형식이 올바르지 않습니다.';
  const body = value as Record<string, unknown>;
  if (!validDate(body.entryDate)) return '올바른 날짜를 선택해주세요.';
  if (typeof body.content !== 'string' || (!allowEmpty && !body.content.trim()) || body.content.length > 20000) return '본문은 1~20,000자로 입력해주세요.';
  if (body.mood != null && !MOODS.includes(body.mood as string)) return '기분을 다시 선택해주세요.';
  return null;
}
export function validatePhotos(files: { type: string; size: number }[], retained: number): string | null {
  if (files.length + retained > MAX_PHOTOS) return '사진은 최대 6장까지 첨부할 수 있어요.';
  if (files.some((f) => !PHOTO_TYPES.includes(f.type) || f.size <= 0 || f.size > MAX_PHOTO_SIZE)) return '사진은 장당 10MB 이하의 JPEG, PNG, WebP만 첨부해주세요.';
  return null;
}
export interface EntryCursor { date: string; created: string; id: string }
export function encodeCursor(value: EntryCursor) { return Buffer.from(JSON.stringify(value)).toString('base64url'); }
export function decodeCursor(value: string): EntryCursor {
  const parsed = JSON.parse(Buffer.from(value, 'base64url').toString()) as EntryCursor;
  if (!parsed || !validDate(parsed.date) || typeof parsed.created !== 'string' || !/^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/.test(parsed.created) || !Number.isFinite(Date.parse(parsed.created)) || typeof parsed.id !== 'string' || !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(parsed.id)) throw new Error('페이지 정보가 올바르지 않습니다.');
  return parsed;
}
