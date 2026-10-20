export type Profile = {
  name: string;
  role: string;
  headline: string;
  employer: string;
};

export type PortfolioLinks = {
  email: string;
  github: string;
  blog: string;
};

export type Highlight = {
  value: string;
  label: string;
};

export type Strength = {
  title: string;
  summary: string;
  evidence: string;
};

export type CaseStudyData = {
  slug: string;
  title: string;
  period: string;
  role: string;
  technologies: string[];
  problem: string;
  decision: string;
  implementation: string;
  result: string;
};

export type TimelineItem = {
  year: string;
  title: string;
  summary: string;
};

export type SkillGroup = {
  label: string;
  items: string[];
};

export type EducationItem = {
  period: string;
  school: string;
  program: string;
  status: string;
};

export type CredentialGroup = {
  label: string;
  items: string[];
};

export type SideProject = {
  title: string;
  summary: string;
  href: string;
  external: boolean;
};

export const profile: Profile = {
  name: '양민준',
  role: '백엔드 · 스마트시티/GIS 개발자',
  headline: '공공 정보시스템을 구축부터 운영까지 책임져 온 개발자입니다.',
  employer: '대호이엔지 웹개발부서 · 주임 · 2022.06~현재',
};

export const links: PortfolioLinks = {
  email: 'gnb1215@naver.com',
  github: 'https://github.com/gwangminjun',
  blog: 'https://gwangminjun.github.io/goramin/',
};

export const highlights: Highlight[] = [
  { value: '4년+', label: '공공 정보시스템 구축·운영' },
  { value: '22개 시군', label: '광역 CCTV 플랫폼 운영' },
  { value: '10종+', label: 'API·MQTT·DB View 데이터 연계' },
  { value: '11개 시·군', label: '전라남도 지역 프로젝트 수행' },
];

export const strengths: Strength[] = [
  {
    title: '이기종 데이터 연계와 자동화',
    summary:
      '서로 다른 규격의 API·MQTT·DB View·JSON/XML 데이터를 수집하고 검증해 운영 데이터로 연결합니다.',
    evidence: 'Data Hub/API Manager, 남원 통합플랫폼, 고흥 스마트군정',
  },
  {
    title: 'GIS·스마트시티 시스템 개발',
    summary:
      '공간 데이터의 좌표 변환부터 2D·3D 지도 표출, 시설물 관제와 공간 분석까지 구현합니다.',
    evidence: 'GeoSync, 영광 3차원 공간정보, 해창만 구조안전진단',
  },
  {
    title: '운영 장애 분석과 안정화',
    summary:
      '로그·DB·네트워크·외부 연계 구간을 순서대로 확인해 장애 범위를 좁히고 재발 방지 구조를 만듭니다.',
    evidence: '전라남도 광역 CCTV, 완도 KRAS-KOREPS, VMS 연계',
  },
];

export const caseStudies: CaseStudyData[] = [
  {
    slug: 'jeonnam-cctv-sync',
    title: '전라남도 22개 시군 CCTV 동기화',
    period: '2025.08~2026.08 고도화',
    role: '백엔드·DB 구조 개선 및 운영 안정화',
    technologies: ['Java', 'Spring', 'PostgreSQL', 'Oracle', 'Batch Scheduler'],
    problem:
      '실패 건마다 로그가 한 행씩 쌓여 DB 부하가 커졌고, 시군구 코드와 현장 스키마 차이로 동기화 중단과 중복 적재가 발생했습니다.',
    decision:
      '개별 장애를 반복해서 패치하기보다 로그 저장 구조, 사전 데이터 검증, 스키마 복구 흐름을 함께 개선했습니다.',
    implementation:
      '실패 상세를 JSON 단위로 통합하고 완료 상태를 UPDATE 방식으로 전환했습니다. 필수값 검증, DB View 기반 위치 조회, 누락된 제약조건·테이블·컬럼 복구 로직도 적용했습니다.',
    result:
      '22개 시군 동기화 운영을 정상화하고 로그·DB·망연계 구간별로 장애 원인을 확인할 수 있는 기반을 만들었습니다.',
  },
  {
    slug: 'geosync-kras',
    title: 'GeoSync — 영광군 KRAS 연계',
    period: '2026.06~진행 중',
    role: '동기화 시스템 설계·개발·배포',
    technologies: ['Java 17', 'Spring Boot 3', 'GeoTools', 'PostgreSQL/PostGIS'],
    problem:
      '기존 KRAS 연계 프로그램이 SHP와 행정 데이터를 안정적으로 반영하지 못해 지속 가능한 동기화 구조가 필요했습니다.',
    decision:
      '기존 코드를 반복 보수하는 대신 수집과 운영 반영의 책임을 분리한 별도 동기화 프로그램을 구축했습니다.',
    implementation:
      '수집·스테이징·운영 승격 단계와 건수 급감 방지 가드를 설계했습니다. 17개 데이터셋 계약 검증, 좌표 변환, 실행 이력, 사전 점검과 반영 이어하기도 구현했습니다.',
    result:
      'KRAS 데이터와 SHP를 일정에 따라 수집하고 검증을 거쳐 운영 DB에 반영하는 관리 흐름을 구축했습니다.',
  },
  {
    slug: 'namwon-smart-city',
    title: '남원 스마트시티 통합플랫폼',
    period: '2024.04~2026.06',
    role: '데이터 연계 및 시설물 관제 풀스택 개발',
    technologies: ['Java', 'Spring', 'MyBatis', 'PostgreSQL', 'OpenLayers', 'MQTT'],
    problem:
      '화재감지기·CCTV·ITS·스마트횡단보도 등 서로 다른 규격과 통신 방식의 시설물을 하나의 플랫폼에 연결해야 했습니다.',
    decision:
      '명세와 실제 수신 데이터가 다를 때 임의로 보정하지 않고 로그를 근거로 업체와 규격·좌표계·수집주기를 합의했습니다.',
    implementation:
      'REST API·MQTT·DB View 방식의 수집·검증·적재 로직과 스마트 가로등·횡단보도·주차장·예경보·화재감지기 관제 기능을 화면까지 개발했습니다.',
    result:
      '10종 이상의 외부 연계와 5개 시설물 관제 기능을 구축해 검수를 완료했습니다.',
  },
];

export const careerTimeline: TimelineItem[] = [
  {
    year: '2022',
    title: '공공 시스템 개발과 운영의 시작',
    summary:
      '전남도청 근무관리시스템과 GS 인증 3D 웹 프로젝트를 개발하고, 22개 시군 광역 CCTV 플랫폼 운영을 시작했습니다.',
  },
  {
    year: '2023',
    title: '데이터 플랫폼과 GIS로 확장',
    summary:
      'Data Hub/API Manager, 해남 스마트군정, 영광 농촌개발 시설물 관리시스템을 구축하며 데이터 연계와 GIS 경험을 넓혔습니다.',
  },
  {
    year: '2024',
    title: '현장 중심 통합플랫폼 구축',
    summary:
      '남원 통합플랫폼과 곡성 Web-GIS를 구축하고 여러 지자체 운영 시스템의 서버 설치, 데이터 이관, 장애 대응을 수행했습니다.',
  },
  {
    year: '2025',
    title: '3D 공간정보와 운영 구조 개선',
    summary:
      '영광 3차원 공간정보시스템을 고도화하고 공공데이터 자동 수집과 광역 CCTV 동기화 프로그램 개발을 진행했습니다.',
  },
  {
    year: '2026',
    title: '동기화·센서·데이터 시스템 고도화',
    summary:
      'GeoSync, 해창만 구조안전진단, 무안 Web-GIS, 고흥 빅데이터 포털을 통해 데이터 신뢰성과 운영 안정성을 높였습니다.',
  },
];

export const skillGroups: SkillGroup[] = [
  {
    label: 'Backend',
    items: ['Java', 'Spring Boot', 'Spring Framework', 'Spring Batch', 'MyBatis'],
  },
  {
    label: 'Data',
    items: ['PostgreSQL', 'PostGIS', 'Oracle', 'MySQL', 'JSON/XML'],
  },
  {
    label: 'GIS',
    items: ['OpenLayers', 'GeoServer', 'Cesium.js', 'QGIS', 'GeoTools'],
  },
  {
    label: 'Integration / Operations',
    items: ['REST API', 'MQTT', 'VMS', 'Linux', 'Windows Server', 'Tomcat'],
  },
  {
    label: 'Web',
    items: ['JavaScript', 'TypeScript', 'React', 'Next.js'],
  },
];

export const education: EducationItem[] = [
  {
    period: '2026.03~현재',
    school: '한국방송통신대학교',
    program: '컴퓨터과학과 3학년',
    status: '재학 중',
  },
  {
    period: '2026.01',
    school: '학점은행제',
    program: '컴퓨터공학 학사과정',
    status: '학점 인정',
  },
];

export const credentialGroups: CredentialGroup[] = [
  {
    label: '개발·데이터·인프라',
    items: [
      '정보처리기사',
      'SQL 개발자(SQLD)',
      '네트워크관리사 2급',
      'NAVER Cloud Platform Certified Professional',
    ],
  },
  {
    label: '기타 자격',
    items: ['컴퓨터응용가공산업기사', '전산응용기계제도기능사', '컴퓨터응용밀링기능사'],
  },
];

export const sideProjects: SideProject[] = [
  {
    title: '공공기관 채용정보 포털',
    summary: '공공데이터 기반 채용공고 검색, 필터, 북마크와 알림 기능을 구현했습니다.',
    href: '/public-job',
    external: false,
  },
  {
    title: '꽃말 큐레이션 꽃 도서관',
    summary: '스터디원과 함께 꽃말 탐색과 큐레이션 경험을 제공하는 웹 서비스를 개발했습니다.',
    href: 'https://github.com/flowervoca/flowerary',
    external: true,
  },
  {
    title: '기술 블로그와 개발 스터디',
    summary: '프로젝트 사례를 기록하고 주말 개발 스터디를 기획·운영하고 있습니다.',
    href: 'https://gwangminjun.github.io/goramin/',
    external: true,
  },
];
