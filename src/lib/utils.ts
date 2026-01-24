import { differenceInDays, parse, format, isAfter, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// YYYYMMDD 형식을 Date 객체로 변환
export function parseDate(dateStr: string): Date {
  return parse(dateStr, 'yyyyMMdd', new Date());
}

// Date를 표시용 문자열로 변환
export function formatDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return format(date, 'yyyy.MM.dd', { locale: ko });
}

// D-day 계산
export function getDday(endDateStr: string): number {
  const endDate = parseDate(endDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(endDate, today);
}

// D-day 표시 문자열
export function getDdayText(endDateStr: string): string {
  const dday = getDday(endDateStr);
  if (dday < 0) return '마감';
  if (dday === 0) return 'D-DAY';
  return `D-${dday}`;
}

// 마감 임박 여부 (3일 이내)
export function isEndingSoon(endDateStr: string): boolean {
  const dday = getDday(endDateStr);
  return dday >= 0 && dday <= 3;
}

// 신규 등록 여부 (7일 이내)
export function isNewJob(startDateStr: string): boolean {
  const startDate = parseDate(startDateStr);
  const weekAgo = subDays(new Date(), 7);
  return isAfter(startDate, weekAgo);
}

// 진행중 여부
export function isOngoing(endDateStr: string): boolean {
  return getDday(endDateStr) >= 0;
}

// 고용형태 뱃지 색상
export function getHireTypeBadgeColor(hireType: string): string {
  if (hireType.includes('정규직')) return 'bg-blue-100 text-blue-800';
  if (hireType.includes('계약직')) return 'bg-yellow-100 text-yellow-800';
  if (hireType.includes('비정규직')) return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-800';
}

// 채용구분 뱃지 색상
export function getRecruitTypeBadgeColor(recruitType: string): string {
  if (recruitType.includes('신입')) return 'bg-green-100 text-green-800';
  if (recruitType.includes('경력')) return 'bg-purple-100 text-purple-800';
  return 'bg-gray-100 text-gray-800';
}

// 지역 목록
export const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

// 고용형태 목록
export const HIRE_TYPES = ['정규직', '비정규직', '계약직', '무기계약직'];

// 채용구분 목록
export const RECRUIT_TYPES = ['신입', '경력', '신입+경력'];

// 숫자 포맷 (천단위 콤마)
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

// 텍스트 자르기
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
