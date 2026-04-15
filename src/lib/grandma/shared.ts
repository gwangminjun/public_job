export interface GrandmaPhoto {
  id: string;
  storage_path: string;
  caption: string | null;
  taken_year: number | null;
  sort_order: number;
  created_at?: string;
  publicUrl: string;
}

export interface GrandmaTimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string | null;
  emoji: string | null;
  highlight: boolean;
  sort_order: number;
}

export interface GrandmaEventConfig {
  id: number;
  event_date: string;
  event_time: string;
  location: string;
  location_detail: string | null;
  host: string;
  celebration_video_title: string | null;
  celebration_video_url: string | null;
}

export interface GrandmaGuestbookEntry {
  id: string;
  name: string;
  message: string;
  emoji: string;
  created_at: string;
}

export const GRANDMA_VIDEO_BUCKET = 'grandma-videos';

export const DEFAULT_GRANDMA_EVENT_CONFIG: GrandmaEventConfig = {
  id: 1,
  event_date: '2026-04-25',
  event_time: '12:00',
  location: '가족 모임 장소',
  location_detail: '추후 업데이트',
  host: '온 가족이 함께',
  celebration_video_title: '축하 영상',
  celebration_video_url: null,
};

export const DEFAULT_GRANDMA_TIMELINE: GrandmaTimelineEvent[] = [
  {
    id: 'default-1946',
    year: 1946,
    title: '탄생',
    description: '아름다운 세상에 첫 발을 내딛으셨습니다.',
    emoji: '👶',
    highlight: false,
    sort_order: 10,
  },
  {
    id: 'default-1952',
    year: 1952,
    title: '초등학교 입학',
    description: '설렘 가득한 마음으로 학교에 첫 발을 내딛으셨습니다.',
    emoji: '📚',
    highlight: false,
    sort_order: 20,
  },
  {
    id: 'default-1965',
    year: 1965,
    title: '결혼',
    description: '할아버지와 평생을 함께할 인연을 맺으셨습니다.',
    emoji: '💍',
    highlight: false,
    sort_order: 30,
  },
  {
    id: 'default-1967',
    year: 1967,
    title: '첫째 출산',
    description: '엄마라는 이름으로 새로운 인생을 시작하셨습니다.',
    emoji: '👶',
    highlight: false,
    sort_order: 40,
  },
  {
    id: 'default-1980',
    year: 1980,
    title: '자녀들 성장',
    description: '자식들의 건강한 성장을 위해 헌신적으로 돌봐주셨습니다.',
    emoji: '👨‍👩‍👧‍👦',
    highlight: false,
    sort_order: 50,
  },
  {
    id: 'default-1995',
    year: 1995,
    title: '첫 손자·손녀 탄생',
    description: '할머니가 되시는 기쁨을 처음으로 누리셨습니다.',
    emoji: '🍼',
    highlight: false,
    sort_order: 60,
  },
  {
    id: 'default-2010',
    year: 2010,
    title: '황혼의 여유',
    description: '자식들이 장성하여 여유로운 시간을 보내기 시작하셨습니다.',
    emoji: '🌅',
    highlight: false,
    sort_order: 70,
  },
  {
    id: 'default-2026',
    year: 2026,
    title: '팔순 기념',
    description: '온 가족이 함께 소중한 팔순을 축하합니다!',
    emoji: '🎂',
    highlight: true,
    sort_order: 80,
  },
];

export function buildEventDateTime(config: GrandmaEventConfig): string {
  return `${config.event_date}T${config.event_time}:00+09:00`;
}

export function formatEventDateLabel(eventDate: string): string {
  const date = new Date(`${eventDate}T00:00:00+09:00`);

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

export function formatEventTimeLabel(eventTime: string): string {
  const [hourText, minuteText = '00'] = eventTime.split(':');
  const hour = Number.parseInt(hourText, 10);
  const minute = Number.parseInt(minuteText, 10);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return eventTime;
  }

  const period = hour >= 12 ? '오후' : '오전';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  if (minute === 0) {
    return `${period} ${displayHour}시`;
  }

  return `${period} ${displayHour}시 ${minute}분`;
}

export function isGrandmaEventDay(eventDate: string): boolean {
  const seoulToday = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  return seoulToday === eventDate;
}

export function getGrandmaSiteUrl() {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envBase) {
    return `${envBase.replace(/\/$/, '')}/grandma`;
  }

  return 'https://public-job.vercel.app/grandma';
}

export function getEmbedVideoUrl(videoUrl: string | null) {
  if (!videoUrl) return null;

  try {
    const parsed = new URL(videoUrl);

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
    }

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}` : videoUrl;
    }

    return videoUrl;
  } catch {
    return videoUrl;
  }
}

export function isEmbeddableVideo(videoUrl: string | null) {
  if (!videoUrl) return false;
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(videoUrl);
}

export function getVideoPlatform(videoUrl: string | null) {
  if (!videoUrl) return null;

  if (/youtube\.com|youtu\.be/i.test(videoUrl)) {
    return 'YouTube';
  }

  if (/vimeo\.com/i.test(videoUrl)) {
    return 'Vimeo';
  }

  return 'Direct';
}

export function getVideoThumbnailUrl(videoUrl: string | null) {
  if (!videoUrl) return null;

  try {
    const parsed = new URL(videoUrl);

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    }

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function getGrandmaStoragePathFromUrl(videoUrl: string | null) {
  if (!videoUrl) return null;

  try {
    const parsed = new URL(videoUrl);
    const markers = [
      `/storage/v1/object/public/${GRANDMA_VIDEO_BUCKET}/`,
      '/storage/v1/object/public/grandma-photos/',
    ];

    for (const marker of markers) {
      const markerIndex = parsed.pathname.indexOf(marker);

      if (markerIndex !== -1) {
        return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
      }
    }

    return null;
  } catch {
    return null;
  }
}
