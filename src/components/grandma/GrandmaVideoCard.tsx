import Link from 'next/link';
import { getEmbedVideoUrl, isEmbeddableVideo } from '@/lib/grandma/shared';

interface GrandmaVideoCardProps {
  title: string | null;
  videoUrl: string | null;
  compact?: boolean;
}

export function GrandmaVideoCard({ title, videoUrl, compact = false }: GrandmaVideoCardProps) {
  const embedUrl = getEmbedVideoUrl(videoUrl);
  const cardTitle = title || '축하 영상';

  return (
    <section className="rounded-[2rem] border shadow-sm overflow-hidden" style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#5C3317' }}>
              🎬 {cardTitle}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#A07850' }}>
              가족의 축하 마음을 영상으로 남길 수 있는 특별 코너입니다.
            </p>
          </div>
          {compact && (
            <Link href="/grandma/video" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border" style={{ borderColor: '#C49A6C', color: '#7B4F2E', backgroundColor: '#FFFDF7' }}>
              영상 페이지 보기
            </Link>
          )}
        </div>

        {embedUrl ? (
          <div className="rounded-[1.5rem] overflow-hidden border" style={{ borderColor: '#E8C99A' }}>
            <div className="relative bg-black" style={{ aspectRatio: compact ? '16 / 9' : '16 / 8.5' }}>
              {isEmbeddableVideo(videoUrl) ? (
                <iframe
                  src={embedUrl}
                  title={cardTitle}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <video controls className="absolute inset-0 w-full h-full object-cover" src={embedUrl} />
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed p-8 text-center" style={{ borderColor: '#C49A6C', backgroundColor: '#FFFDF7' }}>
            <p className="text-4xl mb-3">🎞️</p>
            <p className="font-semibold text-sm" style={{ color: '#5C3317' }}>
              아직 연결된 축하 영상이 없습니다.
            </p>
            <p className="text-sm mt-2" style={{ color: '#A07850' }}>
              관리자 페이지에서 유튜브, Vimeo, 또는 직접 업로드한 영상 URL을 등록해 주세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
