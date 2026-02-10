'use client';

import { useEffect } from 'react';
import { Job } from '@/lib/types';
import { useJobDetail } from '@/hooks/useJobDetail';
import {
  getDdayText,
  formatDate,
  isEndingSoon,
} from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShareButton } from '@/components/ui/ShareButton';
import Link from 'next/link';

interface JobModalProps {
  job: Job | null;
  onClose: () => void;
}

export function JobModal({ job, onClose }: JobModalProps) {
  const { data, isLoading } = useJobDetail(job?.recrutPblntSn || null);

  useEffect(() => {
    if (job) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [job]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!job) return null;

  const detail = data?.result;
  const endingSoon = isEndingSoon(job.pbancEndYmd);
  const ddayText = getDdayText(job.pbancEndYmd);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/jobs/${job.recrutPblntSn}` : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold
                  ${endingSoon ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
              >
                {ddayText}
              </span>
              {job.ongoingYn === 'Y' && (
                <Badge variant="info">진행중</Badge>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{job.recrutPbancTtl}</h2>
            <p className="text-gray-600 mt-1">{job.instNm}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">기본 정보</h3>

              <InfoRow label="근무지역" value={job.workRgnNmLst || '-'} />
              <InfoRow label="채용인원" value={`${job.recrutNope}명`} />
              <InfoRow label="고용형태" value={job.hireTypeNmLst || '-'} />
              <InfoRow label="채용구분" value={job.recrutSeNm || '-'} />
              <InfoRow label="학력요건" value={job.acbgCondNmLst || '-'} />
              <InfoRow label="직무분야" value={job.ncsCdNmLst || '-'} />
              <InfoRow label="충원여부" value={job.replmprYn === 'Y' ? '충원' : '신규'} />
              <InfoRow
                label="공고기간"
                value={`${formatDate(job.pbancBgngYmd)} ~ ${formatDate(job.pbancEndYmd)}`}
              />
            </div>

            {/* 상세 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">상세 정보</h3>

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : detail ? (
                <div className="space-y-4">
                  {detail.aplyQlfcCn && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">지원자격</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {detail.aplyQlfcCn}
                      </p>
                    </div>
                  )}
                  {detail.prefCondCn && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">우대조건</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {detail.prefCondCn}
                      </p>
                    </div>
                  )}
                  {detail.prefCn && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">우대사항(가점)</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {detail.prefCn}
                      </p>
                    </div>
                  )}
                  {detail.scrnprcdrMthdExpln && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">전형절차</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {detail.scrnprcdrMthdExpln}
                      </p>
                    </div>
                  )}
                  {detail.nonatchRsn && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">지원방법</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {detail.nonatchRsn}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between p-6 border-t border-gray-100 bg-gray-50 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <Link
              href={`/jobs/${job.recrutPblntSn}`}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
            >
              상세 페이지
            </Link>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <ShareButton
              title={job.recrutPbancTtl}
              text={`${job.instNm} 채용공고를 확인해보세요!`}
              url={shareUrl}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-xs px-3 py-1.5"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            {(detail?.srcUrl || job.srcUrl) && (
              <a
                href={detail?.srcUrl || job.srcUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                지원하기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="w-24 flex-shrink-0 text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}
