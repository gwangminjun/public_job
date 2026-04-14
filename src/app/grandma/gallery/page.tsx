import { PhotoGallery } from '@/components/grandma/PhotoGallery';
import { GrandmaPrintButton } from '@/components/grandma/GrandmaPrintButton';
import { getGrandmaPhotos } from '@/lib/grandma/server';

export const revalidate = 60;

export default async function GalleryPage() {
  const photos = await getGrandmaPhotos();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#5C3317' }}>
          📷 사진첩
        </h1>
        <p className="text-sm" style={{ color: '#A07850' }}>
          할머니와 함께한 소중한 추억들
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <GrandmaPrintButton />
      </div>

      <PhotoGallery photos={photos} />
    </div>
  );
}
