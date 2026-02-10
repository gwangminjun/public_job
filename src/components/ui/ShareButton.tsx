'use client';

import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, text, url, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Web Share API 지원 확인
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        // 사용자가 취소하거나 에러가 발생한 경우 무시
        console.log('Share canceled or failed:', err);
      }
    } else {
      // 클립보드 복사 폴백
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // 2초 후 초기화
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('링크 복사에 실패했습니다.');
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm ${className}`}
        aria-label="공고 공유하기"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        공유하기
      </button>

      {/* 복사 완료 툴팁 */}
      {copied && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap animate-fade-in-up">
          링크가 복사되었습니다!
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}
