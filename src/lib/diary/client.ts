const SECRET_STORAGE_KEY = 'diary-secret';

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
