import type { Metadata } from 'next';
import { MbtiQuiz } from '@/components/mbti/MbtiQuiz';

export const metadata: Metadata = {
  title: '재미로 보는 MBTI',
  description: '',
  openGraph: {
    title: '재미로 보는 MBTI',
    description: '',
    type: 'website',
    images: [],
  },
  twitter: {
    card: 'summary',
    title: '재미로 보는 MBTI',
    description: '',
    images: [],
  },
};

export default function MbtiPage() {
  return <MbtiQuiz />;
}
