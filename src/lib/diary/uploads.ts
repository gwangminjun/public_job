import type { SupabaseClient } from '@supabase/supabase-js';
import { validateEntry, validatePhotos } from './validation';

export async function readEntryInput(request: Request) {
  const form = request.headers.get('content-type')?.includes('multipart/form-data') ? await request.formData() : null;
  const body = form ? { entryDate: form.get('entryDate'), content: form.get('content'), mood: form.get('mood') || null, updatedAt: form.get('updatedAt'), retainedPhotos: form.has('retainedPhotos') ? JSON.parse(String(form.get('retainedPhotos'))) : undefined } : await request.json();
  const invalid = validateEntry(body);
  if (invalid) throw new Error(invalid);
  const files = form ? form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0) : [];
  const photoError = validatePhotos(files, 0);
  if (photoError) throw new Error(photoError);
  return { body: body as { entryDate: string; content: string; mood: string | null; updatedAt?: string; retainedPhotos?: string[] }, files };
}
export async function uploadPhotos(db: SupabaseClient, files: File[], retainedCount: number): Promise<string[]> {
  const invalid = validatePhotos(files, retainedCount);
  if (invalid) throw new Error(invalid);
  const paths: string[] = [];
  try {
    for (const file of files) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const valid = file.type === 'image/jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff : file.type === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
      if (!valid) throw new Error('사진 파일 형식을 확인해주세요.');
      const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
      const path = `entries/${crypto.randomUUID()}.${ext}`;
      const { error } = await db.storage.from('diary-photos').upload(path, bytes, { contentType: file.type, upsert: false });
      if (error) throw new Error('사진을 업로드하지 못했습니다. 다시 시도해주세요.');
      paths.push(path);
    }
    return paths;
  } catch (error) {
    if (paths.length) await db.storage.from('diary-photos').remove(paths);
    throw error;
  }
}
