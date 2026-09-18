import { getOriginalNotes } from '@/lib/study/materials.server';
import { STUDY_TOPICS } from '@/lib/study/topics';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return STUDY_TOPICS.map(topic => ({ id: topic.id }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notes = await getOriginalNotes(id);
  if (!notes) return Response.json({ error: '학습 자료를 찾을 수 없습니다.' }, { status: 404 });
  return Response.json({ notes });
}
