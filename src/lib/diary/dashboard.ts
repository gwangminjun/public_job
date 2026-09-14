import type { DiaryAuthor } from './types';

export interface DiaryStatisticRow {
  author: DiaryAuthor;
  entryDate: string;
  mood: string | null;
}

export interface AuthorDiaryStatistics {
  entries: number;
  days: number;
  favoriteMood: string | null;
}

export function calculateAuthorStatistics(rows: DiaryStatisticRow[]): Record<DiaryAuthor, AuthorDiaryStatistics> {
  const result: Record<DiaryAuthor, AuthorDiaryStatistics> = {
    A: { entries: 0, days: 0, favoriteMood: null },
    B: { entries: 0, days: 0, favoriteMood: null },
  };
  const days = new Map<DiaryAuthor, Set<string>>([['A', new Set()], ['B', new Set()]]);
  const moods = new Map<DiaryAuthor, Map<string, number>>([['A', new Map()], ['B', new Map()]]);

  for (const row of rows) {
    result[row.author].entries++;
    days.get(row.author)!.add(row.entryDate);
    if (row.mood) moods.get(row.author)!.set(row.mood, (moods.get(row.author)!.get(row.mood) ?? 0) + 1);
  }
  for (const author of ['A', 'B'] as const) {
    result[author].days = days.get(author)!.size;
    result[author].favoriteMood = [...moods.get(author)!].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))[0]?.[0] ?? null;
  }
  return result;
}
