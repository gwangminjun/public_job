import type { Metadata } from 'next';
import { StudyNotebookPage } from '@/components/study/StudyNotebookPage';

export const metadata: Metadata = {
  title: '시험 직전 복습 | 알고리즘·머신러닝',
  description: '알고리즘과 머신러닝의 핵심 개념, 비교표, 주의점을 정리한 시험 대비 단권화 노트',
};

export default function ReviewPage() {
  return <StudyNotebookPage mode="review" />;
}
