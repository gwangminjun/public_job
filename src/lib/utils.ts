import { differenceInDays, parse, format, isAfter, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Job } from '@/lib/types';

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
  if (hireType.includes('정규직')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  if (hireType.includes('계약직')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (hireType.includes('비정규직')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

// 채용구분 뱃지 색상
export function getRecruitTypeBadgeColor(recruitType: string): string {
  if (recruitType.includes('신입')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  if (recruitType.includes('경력')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

// 지역 목록 (CODE.pdf R3000)
export const REGIONS = [
  '서울', '인천', '대전', '대구', '부산', '광주', '울산', '세종',
  '경기', '강원', '충남', '충북', '경북', '경남', '전남', '전북', '제주', '해외'
];

// 고용형태 목록 (CODE.pdf R1000)
export const HIRE_TYPES = [
  '정규직', '계약직', '무기계약직', '비정규직',
  '청년인턴', '청년인턴(체험형)', '청년인턴(채용형)'
];

// 채용구분 목록 (CODE.pdf R2000)
export const RECRUIT_TYPES = ['신입', '경력', '신입+경력', '외국인 전형'];

// NCS 직무분류 목록 (CODE.pdf R6000)
export const NCS_TYPES = [
  '사업관리', '경영.회계.사무', '금융.보험', '교육.자연.사회과학',
  '법률.경찰.소방.교도.국방', '보건.의료', '사회복지.종교', '문화.예술.디자인.방송',
  '운전.운송', '영업판매', '경비.청소', '이용.숙박.여행.오락.스포츠',
  '음식서비스', '건설', '기계', '재료', '화학', '섬유.의복',
  '전기.전자', '정보통신', '식품가공', '인쇄.목재.가구.공예',
  '환경.에너지.안전', '농림어업', '연구'
];

// 학력정보 목록 (CODE.pdf R7000)
export const EDUCATION_TYPES = [
  '학력무관', '중졸이하', '고졸', '대졸(2~3년)', '대졸(4년)', '석사', '박사'
];

// 숫자 포맷 (천단위 콤마)
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

// 텍스트 자르기
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatRecentViewedAt(isoDateTime: string): string {
  const date = new Date(isoDateTime);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function buildIcsDate(dateStr: string, addDaysOffset = 0): string {
  const cleaned = dateStr.replace(/[^0-9]/g, '').slice(0, 8);
  if (cleaned.length !== 8) {
    return cleaned;
  }

  const year = Number(cleaned.slice(0, 4));
  const month = Number(cleaned.slice(4, 6)) - 1;
  const day = Number(cleaned.slice(6, 8));

  const date = new Date(year, month, day);
  date.setDate(date.getDate() + addDaysOffset);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export function createJobDeadlineIcs(job: Job): string {
  const startDate = buildIcsDate(job.pbancEndYmd);
  const endDate = buildIcsDate(job.pbancEndYmd, 1);
  const uid = `${job.recrutPblntSn}@public-job-portal`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Public Job Portal//Recruitment Deadline//KO',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${startDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeIcsText(`[마감] ${job.recrutPbancTtl}`)}`,
    `DESCRIPTION:${escapeIcsText(`${job.instNm} 채용공고 마감일`)}`,
    `LOCATION:${escapeIcsText(job.workRgnNmLst || '온라인/기관별 상이')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

export function downloadJobDeadlineIcs(job: Job): void {
  if (typeof window === 'undefined') {
    return;
  }

  const ics = createJobDeadlineIcs(job);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `job-deadline-${job.recrutPblntSn}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
