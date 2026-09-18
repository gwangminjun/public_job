import { Suspense } from 'react';
import { getStudyMaterials } from '@/lib/study/materials.server';
import { StudyMarkdown } from './StudyMarkdown';
import { StudyNotebook } from './StudyNotebook';

export async function StudyNotebookPage({ mode }: { mode: 'review' | 'recall' }) {
  const materials = await getStudyMaterials();
  const topics = materials.map(({ markdown, ...topic }) => ({
    ...topic,
    searchText: markdown,
    summary: <StudyMarkdown>{markdown}</StudyMarkdown>,
  }));
  return <Suspense fallback={<p className="p-8 text-slate-400">학습 노트 준비 중…</p>}><StudyNotebook mode={mode} topics={topics} /></Suspense>;
}
