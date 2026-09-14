import { DiaryAuthor } from './types';

export function resolveDiaryAuthor(secret: string | null): DiaryAuthor | null {
  if (!secret) return null;
  if (secret === process.env.DIARY_SECRET_A?.trim()) return 'A';
  if (secret === process.env.DIARY_SECRET_B?.trim()) return 'B';
  return null;
}

export function requireDiaryAuthor(request: Request): DiaryAuthor | null {
  const secret = request.headers.get('x-diary-secret')?.trim() ?? null;
  return resolveDiaryAuthor(secret);
}

export function getDiaryAuthorName(author: DiaryAuthor): string {
  const name = author === 'A' ? process.env.DIARY_AUTHOR_A_NAME : process.env.DIARY_AUTHOR_B_NAME;
  return name?.trim() || author;
}
