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
  createdAt: string;
  updatedAt: string;
}

export interface DiaryEntryWithComments extends DiaryEntry {
  comments: DiaryComment[];
}

export const DIARY_MOODS = ['😊', '🥰', '😢', '😡', '😴', '🥳', '😰', '🤔'] as const;
