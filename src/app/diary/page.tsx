import { DiaryTimeline } from '@/components/diary/DiaryTimeline';

export default function DiaryPage() {
  return (
    <>
      <div className="diary-page-heading">
        <p className="diary-eyebrow">우리의 기록</p>
        <h1>차곡차곡 쌓이는 하루</h1>
        <p>평범했던 순간도, 함께 기억하고 싶은 마음도.</p>
      </div>
      <DiaryTimeline />
    </>
  );
}
