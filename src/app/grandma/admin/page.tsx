import { PhotoAdmin } from '@/components/grandma/PhotoAdmin';
import { EventConfigAdmin } from '@/components/grandma/EventConfigAdmin';
import { TimelineAdmin } from '@/components/grandma/TimelineAdmin';
import { getGrandmaConfig, getGrandmaPhotos, getGrandmaTimeline } from '@/lib/grandma/server';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [photos, config, timeline] = await Promise.all([
    getGrandmaPhotos(),
    getGrandmaConfig(),
    getGrandmaTimeline(),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#5C3317' }}>
          할머니 사이트 관리
        </h1>
        <p className="text-sm" style={{ color: '#A07850' }}>
          잔치 정보, 타임라인, 사진첩 콘텐츠를 한 곳에서 관리합니다.
        </p>
      </div>

      <div className="space-y-10">
        <EventConfigAdmin initialConfig={config} />
        <TimelineAdmin initialEvents={timeline} />
        <PhotoAdmin initialPhotos={photos} />
      </div>
    </div>
  );
}
