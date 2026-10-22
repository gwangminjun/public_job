import type { Metadata } from 'next';
import { MbtiQuiz } from '@/components/mbti/MbtiQuiz';

export const metadata: Metadata = {
  title: '재미로 보는 MBTI',
  description: '질문을 클릭하며 알아보는 흐름도 기반 MBTI 테스트',
};

export default function MbtiPage() {
  return <MbtiQuiz />;
}
