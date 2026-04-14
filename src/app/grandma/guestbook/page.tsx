import { createSupabaseServerClient } from '@/lib/supabase/server';
import { GuestbookList } from '@/components/grandma/GuestbookList';
import { GuestbookEntry } from '@/components/grandma/GuestbookForm';

export const revalidate = 0;

async function getEntries(): Promise<GuestbookEntry[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('grandma_guestbook')
    .select('id, name, message, emoji, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as GuestbookEntry[];
}

export default async function GuestbookPage() {
  const entries = await getEntries();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#5C3317' }}>
          ✉️ 방명록
        </h1>
        <p className="text-sm" style={{ color: '#A07850' }}>
          할머니께 따뜻한 축하 메시지를 남겨주세요
        </p>
      </div>

      <GuestbookList initialEntries={entries} />
    </div>
  );
}
