import { GrandmaVideoCard } from '@/components/grandma/GrandmaVideoCard';
import { getGrandmaConfig } from '@/lib/grandma/server';

export default async function GrandmaVideoPage() {
  const config = await getGrandmaConfig();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#5C3317' }}>
          🎬 축하 영상
        </h1>
        <p className="text-sm" style={{ color: '#A07850' }}>
          가족과 지인들의 마음을 영상으로 함께 보는 공간입니다.
        </p>
      </div>

      <GrandmaVideoCard title={config.celebration_video_title} videoUrl={config.celebration_video_url} />
    </div>
  );
}
