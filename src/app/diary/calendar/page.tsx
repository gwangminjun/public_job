import { DiaryCalendar } from '@/components/diary/DiaryCalendar';

export default function DiaryCalendarPage() {
  return (
    <>
      <div className="diary-page-heading">
        <p className="diary-eyebrow">날짜로 돌아보기</p>
        <h1>우리의 하루 달력</h1>
        <p>날짜를 골라 기록을 읽거나 새로운 이야기를 남겨보세요.</p>
      </div>
      <DiaryCalendar />
    </>
  );
}
