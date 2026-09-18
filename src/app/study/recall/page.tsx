import type { Metadata } from 'next';
import { StudyNotebookPage } from '@/components/study/StudyNotebookPage';

export const metadata: Metadata = {
  title: '백지 공부 | 알고리즘·머신러닝',
  description: '주제별 질문에 기억나는 내용을 적고 단권화 답안과 비교하는 백지 공부 노트',
};

export default function RecallPage() {
  return <StudyNotebookPage mode="recall" />;
}
