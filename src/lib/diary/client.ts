const SECRET_STORAGE_KEY = 'diary-secret';

export async function diaryJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await diaryFetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? '요청을 처리하지 못했습니다. 다시 시도해주세요.');
  return body as T;
}

export function getDiarySecret(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(SECRET_STORAGE_KEY) ?? '';
}

export function setDiarySecret(secret: string): void {
  window.localStorage.setItem(SECRET_STORAGE_KEY, secret);
}

export function clearDiarySecret(): void {
  window.localStorage.removeItem(SECRET_STORAGE_KEY);
}

export function diaryFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      'x-diary-secret': getDiarySecret(),
    },
  });
}
