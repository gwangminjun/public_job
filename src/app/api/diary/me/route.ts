import { NextResponse } from 'next/server';
import { getDiaryAuthorName, requireDiaryAuthor } from '@/lib/diary/auth';

export async function GET(request: Request) {
  const author = requireDiaryAuthor(request);
  if (!author) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ author, authorName: getDiaryAuthorName(author), authors: ['A', 'B'].map((id) => ({ id, name: getDiaryAuthorName(id as 'A' | 'B') })) });
}
