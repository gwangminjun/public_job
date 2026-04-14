import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireGrandmaAdminRoute } from '@/lib/grandma/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const unauthorized = await requireGrandmaAdminRoute();
    if (unauthorized) return unauthorized;

    const formData = await request.formData();
    const file = formData.get('file');
    const captionValue = formData.get('caption');
    const takenYearValue = formData.get('takenYear');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '이미지 파일을 선택해주세요.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: storageError } = await supabase.storage.from('grandma-photos').upload(path, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    });

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    const { data: lastPhoto } = await supabase
      .from('grandma_photos')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from('grandma_photos')
      .insert({
        storage_path: path,
        caption: typeof captionValue === 'string' && captionValue.trim() ? captionValue.trim() : null,
        taken_year: typeof takenYearValue === 'string' && takenYearValue ? Number.parseInt(takenYearValue, 10) : null,
        sort_order: (lastPhoto?.sort_order ?? 0) + 10,
      })
      .select('id, storage_path, caption, taken_year, sort_order, created_at')
      .single();

    if (error || !data) {
      await supabase.storage.from('grandma-photos').remove([path]);
      return NextResponse.json({ error: error?.message ?? '사진 등록에 실패했습니다.' }, { status: 500 });
    }

    revalidatePath('/grandma/gallery');
    revalidatePath('/grandma/admin');

    return NextResponse.json({
      photo: {
        ...data,
        publicUrl: supabase.storage.from('grandma-photos').getPublicUrl(path).data.publicUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '사진 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const unauthorized = await requireGrandmaAdminRoute();
    if (unauthorized) return unauthorized;

    const body = (await request.json()) as { id?: string; storage_path?: string };

    if (!body.id || !body.storage_path) {
      return NextResponse.json({ error: '삭제할 사진 정보를 찾을 수 없습니다.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error: storageError } = await supabase.storage.from('grandma-photos').remove([body.storage_path]);

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    const { error } = await supabase.from('grandma_photos').delete().eq('id', body.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/grandma/gallery');
    revalidatePath('/grandma/admin');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '사진 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
