import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import { STUDY_TOPICS, SUBJECTS } from './topics';

const studyRoot = path.join(process.cwd(), 'docs', 'study');

export const getStudyMaterials = cache(async () => {
  const books = await Promise.all(SUBJECTS.map(async subject => ({
    id: subject.id,
    markdown: await readFile(path.join(studyRoot, '단권화', `${subject.folder}.md`), 'utf8'),
  })));

  return STUDY_TOPICS.map(topic => {
    const book = books.find(item => item.id === topic.subject)!;
    const sections = book.markdown.replace(/\r\n/g, '\n').split(/^## /m).slice(1);
    const section = sections.find(item => item.slice(0, item.indexOf('\n')).trim() === topic.title);
    if (!section) throw new Error(`Missing study summary: ${topic.id}`);
    const markdown = section.slice(section.indexOf('\n') + 1).trim();
    if (!markdown) throw new Error(`Empty study summary: ${topic.id}`);
    return { ...topic, markdown };
  });
});

export async function getOriginalNotes(id: string) {
  const topic = STUDY_TOPICS.find(item => item.id === id);
  if (!topic) return null;
  const subject = SUBJECTS.find(item => item.id === topic.subject)!;
  // Only catalog entries become paths; URL input never becomes a filesystem path.
  return Promise.all(topic.sources.map(async file => ({
    title: file.replace(/\.md$/, '').replaceAll('_', ' '),
    markdown: await readFile(path.join(studyRoot, subject.folder, file), 'utf8'),
  })));
}
