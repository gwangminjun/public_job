'use client';

import { useEffect, useRef, useState } from 'react';
import { validatePhotos } from '@/lib/diary/validation';

export function DiaryPhotoPicker({ files, existing, onFiles, onRemoveExisting, disabled }: {
  files: File[]; existing: { path: string; url: string }[]; onFiles: (files: File[]) => void; onRemoveExisting: (path: string) => void; disabled: boolean;
}) {
  const [error, setError] = useState('');
  return (
    <div className="space-y-3">
      <label className="diary-form-label" htmlFor="entry-photos">함께 남길 사진 <span className="diary-muted font-normal">· {files.length + existing.length}/6</span></label>
      <p id="photo-help" className="diary-muted text-xs leading-5">JPEG·PNG·WebP, 장당 10MB 이하. 사진은 임시 저장에 포함되지 않아요.</p>
      <input id="entry-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled} aria-describedby="photo-help" className="diary-field text-sm" onChange={(event) => {
        const next = [...files, ...Array.from(event.target.files ?? [])];
        const invalid = validatePhotos(next, existing.length);
        setError(invalid ?? '');
        if (!invalid) onFiles(next);
        event.target.value = '';
      }} />
      {error && <p role="alert" className="diary-accent text-sm">{error}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {existing.map((photo, index) => <PhotoTile key={photo.path} url={photo.url} label={`기존 사진 ${index + 1}`} disabled={disabled} remove={() => onRemoveExisting(photo.path)} />)}
        {files.map((file, index) => <FilePreview key={`${file.name}-${file.lastModified}-${index}`} file={file} disabled={disabled} remove={() => onFiles(files.filter((_, i) => i !== index))} />)}
      </div>
    </div>
  );
}
function FilePreview({ file, disabled, remove }: { file: File; disabled: boolean; remove: () => void }) {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => { const value = URL.createObjectURL(file); if (image.current) image.current.src = value; return () => URL.revokeObjectURL(value); }, [file]);
  return <div className="diary-comment min-w-0 !p-2">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img ref={image} alt={file.name} className="aspect-square w-full rounded-lg object-cover" />
    <button type="button" disabled={disabled} onClick={remove} aria-label={`${file.name} 제거`} className="diary-nav-link w-full justify-center text-xs">사진 제거</button>
  </div>;
}
function PhotoTile({ url, label, disabled, remove }: { url: string; label: string; disabled: boolean; remove: () => void }) {
  return <div className="diary-comment min-w-0 !p-2">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {url ? <img src={url} alt={label} className="aspect-square w-full rounded-lg object-cover" /> : <p className="diary-muted text-xs leading-6">미리보기를 불러오지 못했어요. 사진은 보존됩니다.</p>}
    <button type="button" disabled={disabled} onClick={remove} aria-label={`${label} 제거`} className="diary-nav-link w-full justify-center text-xs">사진 제거</button>
  </div>;
}
