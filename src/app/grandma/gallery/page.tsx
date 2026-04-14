import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PhotoGallery, GrandmaPhoto } from '@/components/grandma/PhotoGallery';

export const revalidate = 60;

async function getPhotos(): Promise<GrandmaPhoto[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('grandma_photos')
    .select('id, storage_path, caption, taken_year, created_at')
    .order('taken_year', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    publicUrl: supabase.storage.from('grandma-photos').getPublicUrl(row.storage_path).data.publicUrl,
  }));
}

export default async function GalleryPage() {
  const photos = await getPhotos();

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

      <PhotoGallery photos={photos} />
    </div>
  );
}
