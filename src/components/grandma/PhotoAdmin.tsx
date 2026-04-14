'use client';

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { GrandmaPhoto } from './PhotoGallery';

interface PhotoAdminProps {
  initialPhotos: GrandmaPhoto[];
}

export function PhotoAdmin({ initialPhotos }: PhotoAdminProps) {
  const [photos, setPhotos] = useState<GrandmaPhoto[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [takenYear, setTakenYear] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const supabase = createSupabaseBrowserClient();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하만 가능합니다.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);

    try {
      const ext = selectedFile.name.split('.').pop();
      const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: storageError } = await supabase.storage
        .from('grandma-photos')
        .upload(path, selectedFile, { cacheControl: '3600', upsert: false });

      if (storageError) throw storageError;

      const { data: insertData, error: dbError } = await supabase
        .from('grandma_photos')
        .insert({
          storage_path: path,
          caption: caption.trim() || null,
          taken_year: takenYear ? parseInt(takenYear, 10) : null,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const publicUrl = supabase.storage.from('grandma-photos').getPublicUrl(path).data.publicUrl;
      setPhotos((prev) => [...prev, { ...insertData, publicUrl }]);

      // 초기화
      setCaption('');
      setTakenYear('');
      setPreview(null);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else if (typeof e === 'object' && e !== null && 'message' in e) {
        setError(String((e as { message: unknown }).message));
      } else {
        setError(JSON.stringify(e));
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photo: GrandmaPhoto) {
    setDeleteId(photo.id);
    startTransition(async () => {
      try {
        await supabase.storage.from('grandma-photos').remove([photo.storage_path]);
        await supabase.from('grandma_photos').delete().eq('id', photo.id);
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      } catch {
        setError('삭제 중 오류가 발생했습니다.');
      } finally {
        setDeleteId(null);
      }
    });
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 81 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-10">
      {/* 업로드 폼 */}
      <section
        className="rounded-3xl p-6 md:p-8 border shadow-sm"
        style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}
      >
        <h2 className="text-lg font-bold mb-6" style={{ color: '#5C3317' }}>
          사진 업로드
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 파일 선택 */}
          <div>
            <div
              onClick={() => fileRef.current?.click()}
              className="aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
              style={{ borderColor: '#C49A6C', backgroundColor: '#FFF3DC' }}
            >
              {preview ? (
                <div className="relative w-full h-full">
                  <Image src={preview} alt="미리보기" fill className="object-contain" />
                </div>
              ) : (
                <>
                  <span className="text-3xl mb-2">📤</span>
                  <p className="text-sm font-medium" style={{ color: '#7B4F2E' }}>
                    클릭하여 사진 선택
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#A07850' }}>
                    JPG, PNG, WEBP · 최대 10MB
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* 메타데이터 입력 */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>
                사진 설명 (선택)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="예: 결혼식 날, 손자와 함께"
                maxLength={50}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: '#C49A6C' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>
                촬영 연도 (선택)
              </label>
              <select
                value={takenYear}
                onChange={(e) => setTakenYear(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#C49A6C' }}
              >
                <option value="">연도 선택</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="mt-auto w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#7B4F2E' }}
            >
              {uploading ? '업로드 중...' : '업로드'}
            </button>
          </div>
        </div>
      </section>

      {/* 사진 목록 */}
      <section>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#5C3317' }}>
          등록된 사진 ({photos.length}장)
        </h2>
        {photos.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: '#A07850' }}>
            아직 등록된 사진이 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-2xl overflow-hidden border shadow-sm"
                style={{ borderColor: '#E8C99A' }}
              >
                <Image
                  src={photo.publicUrl}
                  alt={photo.caption ?? ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {/* 오버레이 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {photo.caption && (
                    <p className="text-white text-xs text-center px-2 font-medium">{photo.caption}</p>
                  )}
                  <button
                    onClick={() => handleDelete(photo)}
                    disabled={deleteId === photo.id || isPending}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white transition-colors"
                    style={{ backgroundColor: 'rgba(185,28,28,0.85)' }}
                  >
                    {deleteId === photo.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
                {photo.taken_year && (
                  <span
                    className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(123,79,46,0.75)', color: 'white' }}
                  >
                    {photo.taken_year}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
