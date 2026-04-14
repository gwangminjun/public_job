import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PhotoAdmin } from '@/components/grandma/PhotoAdmin';
import { GrandmaPhoto } from '@/components/grandma/PhotoGallery';

export const dynamic = 'force-dynamic';

async function getPhotos(): Promise<GrandmaPhoto[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('grandma_photos')
    .select('id, storage_path, caption, taken_year, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    ...row,
    publicUrl: supabase.storage.from('grandma-photos').getPublicUrl(row.storage_path).data.publicUrl,
  }));
}

export default async function AdminPage() {
  const photos = await getPhotos();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#5C3317' }}>
          사진 관리
        </h1>
        <p className="text-sm" style={{ color: '#A07850' }}>
          사진을 업로드하거나 삭제할 수 있습니다.
        </p>
      </div>

      <PhotoAdmin initialPhotos={photos} />
    </div>
  );
}
