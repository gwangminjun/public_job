export type DiaryAuthor = 'A' | 'B';

export interface DiaryComment {
  id: string;
  entryId: string;
  author: DiaryAuthor;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  author: DiaryAuthor;
  authorName: string;
  entryDate: string;
  mood: string | null;
  content: string;
  photoUrls: string[];
  photoPaths?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiaryEntryWithComments extends DiaryEntry {
  comments: DiaryComment[];
}

export const DIARY_MOODS = ['😊', '🥰', '😢', '😡', '😴', '🥳', '😰', '🤔'] as const;

export interface DiaryCalendarData {
  days: { date: string; count: number; entries: { id: string; author: DiaryAuthor; authorName: string; mood: string | null; excerpt: string }[] }[];
  summary: { entries: number; days: number; moods: Record<string, number> };
}
export interface DiaryIdentity { author: DiaryAuthor; authorName: string; authors: { id: string; name: string }[] }
export interface DiaryDraft { author: DiaryAuthor; entry_date: string; content: string; mood: string | null; version: string; updated_at: string }
export interface DiaryDashboard {
  month: string;
  authors: { author: DiaryAuthor; authorName: string; entries: number; days: number; favoriteMood: string | null }[];
}
