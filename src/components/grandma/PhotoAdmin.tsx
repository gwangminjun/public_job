'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { GrandmaPhoto } from '@/lib/grandma/shared';

interface PhotoAdminProps {
  initialPhotos: GrandmaPhoto[];
}

interface SelectedPreview {
  file: File;
  previewUrl: string;
}

export function PhotoAdmin({ initialPhotos }: PhotoAdminProps) {
  const [photos, setPhotos] = useState<GrandmaPhoto[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [takenYear, setTakenYear] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState('');
  const [editingYear, setEditingYear] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 81 }, (_, index) => currentYear - index), [currentYear]);
  const editingIndex = editingId ? photos.findIndex((photo) => photo.id === editingId) : -1;
  const editingPhoto = editingIndex >= 0 ? photos[editingIndex] : null;

  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, [selectedFiles]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const invalid = files.find((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024);
    if (invalid) {
      setError('이미지 파일만 업로드할 수 있으며, 각 파일은 10MB 이하여야 합니다.');
      return;
    }

    setError(null);
    setSelectedFiles((prev) => {
      prev.forEach((file) => URL.revokeObjectURL(file.previewUrl));
      return files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    });
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    const uploadedPhotos: GrandmaPhoto[] = [];

    try {
      for (const [index, selected] of selectedFiles.entries()) {
        const formData = new FormData();
        formData.append('file', selected.file);
        formData.append('caption', caption);
        formData.append('takenYear', takenYear);

        const response = await fetch('/api/grandma/photos', {
          method: 'POST',
          body: formData,
        });

        const result = (await response.json()) as { photo?: GrandmaPhoto; error?: string };
        if (!response.ok || !result.photo) {
          throw new Error(result.error ?? '사진 업로드에 실패했습니다.');
        }

        uploadedPhotos.push(result.photo);
        setUploadProgress(Math.round(((index + 1) / selectedFiles.length) * 100));
      }

      setPhotos((prev) => [...prev, ...uploadedPhotos]);
      setCaption('');
      setTakenYear('');
      setSelectedFiles((prev) => {
        prev.forEach((file) => URL.revokeObjectURL(file.previewUrl));
        return [];
      });
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photo: GrandmaPhoto) {
    setDeleteId(photo.id);
    try {
      const response = await fetch('/api/grandma/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id, storage_path: photo.storage_path }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? '삭제 중 오류가 발생했습니다.');
      }

      setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
      if (editingId === photo.id) {
        setEditingId(null);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleteId(null);
    }
  }

  async function persistOrder(nextPhotos: GrandmaPhoto[], previousPhotos: GrandmaPhoto[]) {
    setSavingOrder(true);
    setError(null);

    try {
      const response = await fetch('/api/grandma/photos/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: nextPhotos.map((photo) => photo.id) }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? '사진 순서 저장에 실패했습니다.');
      }

      setPhotos(nextPhotos.map((photo, index) => ({ ...photo, sort_order: (index + 1) * 10 })));
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : '사진 순서 저장에 실패했습니다.');
      setPhotos(previousPhotos);
    } finally {
      setSavingOrder(false);
    }
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;

    const currentIndex = photos.findIndex((photo) => photo.id === draggedId);
    const targetIndex = photos.findIndex((photo) => photo.id === targetId);
    if (currentIndex < 0 || targetIndex < 0) return;

    const previousPhotos = [...photos];
    const nextPhotos = [...photos];
    const [moved] = nextPhotos.splice(currentIndex, 1);
    nextPhotos.splice(targetIndex, 0, moved);
    setPhotos(nextPhotos);
    setDraggedId(null);
    void persistOrder(nextPhotos, previousPhotos);
  }

  function openEditor(photoId: string) {
    const photo = photos.find((item) => item.id === photoId);
    if (!photo) return;

    setEditingId(photoId);
    setEditingCaption(photo.caption ?? '');
    setEditingYear(photo.taken_year ? String(photo.taken_year) : '');
  }

  function moveEditor(direction: 'prev' | 'next') {
    if (editingIndex < 0 || photos.length === 0) return;

    const nextIndex = direction === 'prev'
      ? (editingIndex === 0 ? photos.length - 1 : editingIndex - 1)
      : (editingIndex === photos.length - 1 ? 0 : editingIndex + 1);

    openEditor(photos[nextIndex].id);
  }

  async function savePhotoMeta() {
    if (!editingPhoto) return;

    setSavingEdit(true);
    setError(null);

    try {
      const response = await fetch(`/api/grandma/photos/${editingPhoto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: editingCaption,
          taken_year: editingYear ? Number.parseInt(editingYear, 10) : null,
        }),
      });

      const result = (await response.json()) as { photo?: GrandmaPhoto; error?: string };
      if (!response.ok || !result.photo) {
        throw new Error(result.error ?? '사진 설명 저장에 실패했습니다.');
      }

      setPhotos((prev) => prev.map((photo) => (photo.id === result.photo?.id ? result.photo : photo)));
      setEditingId(result.photo.id);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '사진 설명 저장에 실패했습니다.');
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl p-6 md:p-8 border shadow-sm" style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#5C3317' }}>
              사진 업로드
            </h2>
            <p className="text-sm mt-1" style={{ color: '#A07850' }}>
              여러 장을 한 번에 선택해 같은 촬영 연도와 공통 설명으로 업로드할 수 있습니다.
            </p>
          </div>
          {uploading && (
            <div className="min-w-40">
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F3E4CF' }}>
                <div className="h-full transition-all duration-300" style={{ width: `${uploadProgress}%`, backgroundColor: '#7B4F2E' }} />
              </div>
              <p className="text-xs text-right mt-1" style={{ color: '#A07850' }}>
                {uploadProgress}% 완료
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr,1fr] gap-6">
          <div>
            <div
              onClick={() => fileRef.current?.click()}
              className="min-h-64 rounded-3xl border-2 border-dashed p-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ borderColor: '#C49A6C', backgroundColor: '#FFF3DC' }}
            >
              {selectedFiles.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: '#7B4F2E' }}>
                      선택된 사진 {selectedFiles.length}장
                    </p>
                    <span className="text-xs" style={{ color: '#A07850' }}>
                      다시 클릭하면 다시 선택할 수 있어요
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedFiles.map((selected, index) => (
                      <div key={`${selected.file.name}-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border" style={{ borderColor: '#E8C99A' }}>
                        <Image src={selected.previewUrl} alt={selected.file.name} fill className="object-cover" />
                        <span className="absolute bottom-2 left-2 right-2 rounded-full px-2 py-1 text-[11px] font-medium truncate" style={{ backgroundColor: 'rgba(255,255,255,0.88)', color: '#5C3317' }}>
                          {selected.file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-56 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl mb-2">📤</span>
                  <p className="text-sm font-medium" style={{ color: '#7B4F2E' }}>
                    클릭하여 사진 여러 장 선택
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#A07850' }}>
                    JPG, PNG, WEBP · 각 파일 최대 10MB
                  </p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>
                공통 사진 설명 (선택)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="예: 가족사진, 팔순 기념 식사"
                maxLength={50}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>
                촬영 연도 (선택)
              </label>
              <select
                value={takenYear}
                onChange={(event) => setTakenYear(event.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
              >
                <option value="">연도 선택</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="mt-auto w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#7B4F2E' }}
            >
              {uploading ? '업로드 중...' : `${selectedFiles.length || 0}장 업로드`}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#5C3317' }}>
              등록된 사진 ({photos.length}장)
            </h2>
            <p className="text-sm" style={{ color: '#A07850' }}>
              드래그로 순서를 바꾸고, 사진을 눌러 라이트박스에서 설명과 연도를 수정하세요.
            </p>
          </div>
          {savingOrder && (
            <p className="text-sm" style={{ color: '#A07850' }}>
              사진 순서 저장 중...
            </p>
          )}
        </div>

        {photos.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: '#A07850' }}>
            아직 등록된 사진이 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => setDraggedId(photo.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(photo.id)}
                onDragEnd={() => setDraggedId(null)}
                className="group relative aspect-square rounded-2xl overflow-hidden border shadow-sm"
                style={{ borderColor: draggedId === photo.id ? '#7B4F2E' : '#E8C99A' }}
              >
                <button type="button" onClick={() => openEditor(photo.id)} className="absolute inset-0 z-10">
                  <span className="sr-only">사진 편집 열기</span>
                </button>
                <Image src={photo.publicUrl} alt={photo.caption ?? ''} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 z-20 pointer-events-none">
                  <p className="text-white text-xs text-center px-2 font-medium">
                    {photo.caption ?? '설명 편집'}
                  </p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDelete(photo);
                    }}
                    disabled={deleteId === photo.id || savingOrder}
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white transition-colors pointer-events-auto"
                    style={{ backgroundColor: 'rgba(185,28,28,0.85)' }}
                  >
                    {deleteId === photo.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
                {photo.taken_year && (
                  <span className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full z-20" style={{ backgroundColor: 'rgba(123,79,46,0.75)', color: 'white' }}>
                    {photo.taken_year}
                  </span>
                )}
                <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full z-20" style={{ backgroundColor: 'rgba(255,255,255,0.88)', color: '#5C3317' }}>
                  {photo.sort_order}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} onClick={() => setEditingId(null)}>
          <div className="relative max-w-4xl w-full rounded-[2rem] overflow-hidden border shadow-2xl" style={{ borderColor: 'rgba(255,255,255,0.12)' }} onClick={(event) => event.stopPropagation()}>
            <div className="relative bg-black" style={{ aspectRatio: '4 / 3' }}>
              <Image src={editingPhoto.publicUrl} alt={editingPhoto.caption ?? ''} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 1024px" />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => moveEditor('prev')} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full text-2xl text-white" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    ‹
                  </button>
                  <button type="button" onClick={() => moveEditor('next')} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full text-2xl text-white" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    ›
                  </button>
                </>
              )}
              <button type="button" onClick={() => setEditingId(null)} className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.2fr,0.8fr] gap-5 p-5" style={{ backgroundColor: '#FFFAF3' }}>
              <div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#5C3317' }}>
                  라이트박스에서 사진 설명 수정
                </h3>
                <p className="text-sm" style={{ color: '#A07850' }}>
                  사진을 넘겨가며 설명과 촬영 연도를 바로 수정할 수 있어요.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>
                    사진 설명
                  </label>
                  <input
                    type="text"
                    value={editingCaption}
                    onChange={(event) => setEditingCaption(event.target.value)}
                    maxLength={50}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#7B4F2E' }}>
                    촬영 연도
                  </label>
                  <select
                    value={editingYear}
                    onChange={(event) => setEditingYear(event.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ borderColor: '#C49A6C', color: '#3B1F0E', backgroundColor: '#FFFDF7' }}
                  >
                    <option value="">연도 선택 안 함</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={savePhotoMeta}
                  disabled={savingEdit}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#7B4F2E' }}
                >
                  {savingEdit ? '저장 중...' : '사진 정보 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
