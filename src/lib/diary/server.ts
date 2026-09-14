import { SupabaseClient } from '@supabase/supabase-js';
import { getDiaryAuthorName } from './auth';
import { DiaryAuthor, DiaryComment, DiaryEntry } from './types';

const SIGNED_URL_EXPIRES_IN = 60 * 60;

interface DiaryEntryRow {
  id: string;
  author: DiaryAuthor;
  entry_date: string;
  mood: string | null;
  content: string;
  photo_paths: string[];
  created_at: string;
  updated_at: string;
}

interface DiaryCommentRow {
  id: string;
  entry_id: string;
  author: DiaryAuthor;
  content: string;
  created_at: string;
}

export async function mapDiaryEntryRow(supabase: SupabaseClient, row: DiaryEntryRow): Promise<DiaryEntry> {
  const photoUrls = row.photo_paths.length
    ? await Promise.all(
        row.photo_paths.map(async (path) => {
          const { data } = await supabase.storage.from('diary-photos').createSignedUrl(path, SIGNED_URL_EXPIRES_IN);
          return data?.signedUrl ?? '';
        })
      )
    : [];

  return {
    id: row.id,
    author: row.author,
    authorName: getDiaryAuthorName(row.author),
    entryDate: row.entry_date,
    mood: row.mood,
    content: row.content,
    photoUrls,
    photoPaths: row.photo_paths,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDiaryCommentRow(row: DiaryCommentRow): DiaryComment {
  return {
    id: row.id,
    entryId: row.entry_id,
    author: row.author,
    authorName: getDiaryAuthorName(row.author),
    content: row.content,
    createdAt: row.created_at,
  };
}
