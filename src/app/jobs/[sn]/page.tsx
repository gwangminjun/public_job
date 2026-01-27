import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JobDetail } from '@/lib/types';
import { formatDate, getDdayText, isEndingSoon } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const API_BASE_URL = 'https://apis.data.go.kr/1051000/recruitment';
const SERVICE_KEY = process.env.DATA_GO_KR_API_KEY || '';

async function getJobDetail(sn: string): Promise<JobDetail | null> {
  try {
    if (!SERVICE_KEY) return null;

    // URL 직접 구성 (인코딩 없이)
    const apiUrl = `${API_BASE_URL}/detail?serviceKey=${SERVICE_KEY}&resultType=json&sn=${sn}`;

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.result || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ sn: string }> }): Promise<Metadata> {
  const { sn } = await params;
  const job = await getJobDetail(sn);

  if (!job) {
    return {
      title: '채용공고를 찾을 수 없습니다',
    };
  }

  return {
    title: `${job.recrutPbancTtl} | ${job.instNm}`,
    description: `${job.instNm}에서 ${job.recrutNope}명 채용 - 마감일: ${formatDate(job.pbancEndYmd)}`,
    openGraph: {
      title: job.recrutPbancTtl,
      description: `${job.instNm} | ${job.workRgnNmLst} | ${job.hireTypeNmLst}`,
    },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ sn: string }> }) {
  const { sn } = await params;
  const job = await getJobDetail(sn);

  if (!job) {
    notFound();
  }

  const ddayText = getDdayText(job.pbancEndYmd);
  const endingSoon = isEndingSoon(job.pbancEndYmd);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 상단 정보 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold
                  ${endingSoon ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
              >
                {ddayText}
              </span>
              {job.ongoingYn === 'Y' && <Badge variant="info">진행중</Badge>}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.recrutPbancTtl}</h1>
          <p className="text-lg text-gray-600 mb-4">{job.instNm}</p>

          <div className="flex flex-wrap gap-2">
            {job.hireTypeNmLst && <Badge>{job.hireTypeNmLst}</Badge>}
            {job.recrutSeNm && <Badge>{job.recrutSeNm}</Badge>}
            {job.workRgnNmLst && <Badge>{job.workRgnNmLst}</Badge>}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">기본 정보</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="채용인원" value={`${job.recrutNope}명`} />
            <InfoItem label="근무지역" value={job.workRgnNmLst || '-'} />
            <InfoItem label="고용형태" value={job.hireTypeNmLst || '-'} />
            <InfoItem label="채용구분" value={job.recrutSeNm || '-'} />
            <InfoItem label="학력요건" value={job.acbgCondNmLst || '-'} />
            <InfoItem label="직무분야" value={job.ncsCdNmLst || '-'} />
            <InfoItem label="충원여부" value={job.replmprYn === 'Y' ? '충원' : '신규'} />
            <InfoItem
              label="공고기간"
              value={`${formatDate(job.pbancBgngYmd)} ~ ${formatDate(job.pbancEndYmd)}`}
            />
          </dl>
        </div>

        {/* 지원자격 */}
        {job.aplyQlfcCn && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">지원자격</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.aplyQlfcCn}</p>
          </div>
        )}

        {/* 우대조건 */}
        {job.prefCondCn && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">우대조건</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.prefCondCn}</p>
          </div>
        )}

        {/* 우대사항(가점) */}
        {job.prefCn && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">우대사항(가점)</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.prefCn}</p>
          </div>
        )}

        {/* 전형절차 */}
        {job.scrnprcdrMthdExpln && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">전형절차</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.scrnprcdrMthdExpln}</p>
          </div>
        )}

        {/* 결격사유 */}
        {job.disqlfcRsn && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">결격사유</h2>
            <p className="text-gray-700 whitespace-pre-line text-sm">{job.disqlfcRsn}</p>
          </div>
        )}

        {/* 지원방법 */}
        {job.nonatchRsn && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">지원방법</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.nonatchRsn}</p>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            목록으로
          </Link>
          {job.srcUrl && (
            <a
              href={job.srcUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              원본 공고
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <a
            href={`https://www.gojobs.go.kr/mobile/jobMain.do?reqNo=${job.recrutPblntSn}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            잡알리오에서 지원하기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <dt className="w-24 flex-shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}
