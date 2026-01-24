// 채용공고 목록 아이템
export interface Job {
  recrutPblntSn: number;        // 공고 일련번호
  instNm: string;               // 기관명
  recrutPbancTtl: string;       // 공고 제목
  ncsCdNmLst: string;           // 직무분야
  hireTypeNmLst: string;        // 고용형태
  workRgnNmLst: string;         // 근무지역
  recrutSeNm: string;           // 채용구분 (신입/경력)
  recrutNope: number;           // 채용인원
  pbancBgngYmd: string;         // 공고시작일 (YYYYMMDD)
  pbancEndYmd: string;          // 공고종료일 (YYYYMMDD)
  ongoingYn: 'Y' | 'N';         // 진행중 여부
  acbgCondNmLst: string;        // 학력요건
  aplyQlfcCn?: string;          // 지원자격
  disqlfcRsn?: string;          // 결격사유
}

// 채용공고 상세
export interface JobDetail extends Job {
  scrnprcdrMthdExpln: string;   // 전형방법
  prefCn: string;               // 가산점
  files: JobFile[];             // 첨부파일
  steps?: JobStep[];            // 전형단계
}

export interface JobFile {
  atchFileNm: string;           // 파일명
  url: string;                  // 파일 URL
}

export interface JobStep {
  stepNm: string;               // 단계명
  stepExpln: string;            // 단계설명
}

// API 응답
export interface JobListResponse {
  resultCode: number;
  resultMsg: string;
  totalCount: number;
  result: Job[];
}

export interface JobDetailResponse {
  resultCode: number;
  resultMsg: string;
  result: JobDetail;
}

// 필터 상태
export interface FilterState {
  keyword: string;
  regions: string[];
  hireTypes: string[];
  recruitTypes: string[];
  onlyOngoing: boolean;
  page: number;
  limit: number;
}

// 통계
export interface Stats {
  totalCount: number;
  endingSoon: number;      // 3일 이내 마감
  newJobs: number;         // 7일 이내 등록
  institutions: number;    // 등록기관 수
}
