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

export type ArchiveProject = {
  title: string;
  period: string;
  technologies: string[];
  points: string[];
};

export type ArchiveGroup = {
  label: string;
  projects: ArchiveProject[];
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

export const archiveGroups: ArchiveGroup[] = [
  {
    label: '구축·고도화',
    projects: [
      {
        title: '고흥 해창만 갑문 통합 모니터링 · 구조안전진단 시스템',
        period: '2026.06~진행 중',
        technologies: ['Java', 'Spring', 'REST API', 'IoT 계측 센서', 'Cesium.js', 'QGIS'],
        points: [
          '수치지형도 등고선과 QGIS TIN 보간으로 해창만 3D Terrain을 만들고 전라남도 전체로 확대했습니다.',
          '가상 센서와 더미 통계를 걷어내고 현장 센서 실측값과 임계값 기준 판정 로직으로 재설계했습니다.',
          '상태평가·진동/경사·진단이력·예방정비 4개 모듈, 위험등급별 SOP 자동 배정, 기상청 초단기실황 API 연계를 구현했습니다.',
        ],
      },
      {
        title: '무안군 Web-GIS',
        period: '2026.04~2026.05',
        technologies: ['Web-GIS', 'VMS 연동', 'Excel'],
        points: [
          '장비관리, 접속·관제 이력 통계와 엑셀, 사용자·권한·역할 관리 기능을 개발했습니다.',
          'VMS 연동으로 CCTV 접속 상태를 실시간 점검하고 속성 동기화와 미등록 CCTV 엑셀 일괄 처리를 구현했습니다.',
        ],
      },
      {
        title: '고흥군 빅데이터 포털',
        period: '2026.01~2026.04',
        technologies: ['Java', 'YouTube API', '스케줄러'],
        points: [
          '뉴스 기사 분석 모듈에서 Hadoop 구성을 제거하고 수집·분석·API 모듈을 하나로 통합했습니다.',
          '대시보드·스케줄링·로그·API·DB 관리 화면과 수집 주기·키워드 설정, API 테스트 기능을 추가했습니다.',
          '뉴스 채널·API 키 관리와 검색 로그·채널별 통계를 제공하는 YouTube API 관리 패널을 구현했습니다.',
        ],
      },
      {
        title: '고흥군 스마트군정시스템 — 공공데이터 수집·지오코딩',
        period: '2025.12~진행 중',
        technologies: ['Java', 'Spring Batch', '공공 Open API', 'VWorld Geocoding', 'PostgreSQL/PostGIS'],
        points: [
          '부서별 데이터 협의로 약 700쪽 분량의 자료에서 시각화 대상을 선별했습니다.',
          '전기차 충전소·병원·약국·사회복지시설·전통시장·학교·유치원 정보를 공공 API로 자동 수집하는 배치를 구축했습니다.',
          'API가 제공하는 좌표를 우선 사용해 위치 오차를 줄이고, 좌표가 없는 데이터만 VWorld 지오코딩으로 변환했습니다.',
        ],
      },
      {
        title: '나주 배터리 산업협회 RFID 연계',
        period: '2025.09~2026.01',
        technologies: ['RFID', 'CCTV', '3D 표출'],
        points: [
          'RFID 이벤트가 발생하면 3D 모델과 해당 CCTV를 표출하고, 기존 CCTV 순환 표출을 멈췄다 재개하도록 구현했습니다.',
          '정전 후 RFID API 서버가 가동되지 않은 원인을 찾아 서비스를 정상화했습니다.',
        ],
      },
      {
        title: '영광군 3차원 공간정보시스템 구축·고도화',
        period: '2025.03~진행 중',
        technologies: ['Java', 'Spring', 'PostgreSQL/PostGIS', 'OpenLayers', 'GeoServer', 'Cesium.js'],
        points: [
          'Cesium.js 3D 지도 화면과 API 기반 데이터 수집·백엔드 통합 처리를 설계·개발했습니다.',
          '토지·건축물 대장 조회, SHP/엑셀 업·다운로드, 히트맵·영역·버퍼 분석을 구현하고 통합형 공간정보시스템으로 전환했습니다.',
          '외부 CDN 제거, WFS gzip, 캐시로 레이어 표출 속도를 개선하고 서버 간 시간 오차로 실패하던 SSO 인증을 조치했습니다.',
        ],
      },
      {
        title: '영광군 농촌개발 시설물 통합관리시스템',
        period: '2023.06~2024.06',
        technologies: ['Java', 'Spring', 'PostgreSQL', 'GeoServer', 'Cesium.js'],
        points: [
          'Cesium.js 3D 지도와 GeoServer 연동으로 시설물 위치·속성·상태 정보를 표출했습니다.',
          '사용자·권한·시설물·정기점검·유지보수 관리와 거리·면적 측정, 주소검색 기능을 개발했습니다.',
          '운영서버 설치와 실환경 테스트, 내부 점검 결과 패치를 수행했습니다.',
        ],
      },
      {
        title: '해남군 스마트 군정시스템 구축·고도화',
        period: '2023.05~2024.04 · 고도화 2025.09~2026.06',
        technologies: ['Java', 'Spring', 'PostgreSQL', 'OpenLayers', 'GeoServer', 'Apache POI', 'Chart.js'],
        points: [
          '부서마다 다른 데이터 양식을 공통 엑셀 서식으로 합의하고 DB 자동 적재 로직을 구현했습니다.',
          '민원·전기차·SGIS 통계·뉴스를 데이터 허브로 연계하고 인구·민원·정책·재난 현황을 차트·지도 대시보드로 시각화했습니다.',
          '고도화에서 세입/세출·교육·경제·보건/복지 등 분야별 지표와 데이터 일괄등록을 확대했습니다.',
        ],
      },
      {
        title: '데이터 허브 / API Manager',
        period: '2023.02~2023.06 개발 · 이후 결함 수정',
        technologies: ['Java', 'Spring Boot', 'Spring Batch', 'Quartz', 'PostgreSQL'],
        points: [
          '외부 API 등록·호출 테스트와 사용자별 API 키 발급·접근권한 관리를 구현했습니다.',
          '계층형 API 관리 DB와 프로토콜·인증 방식별 핸들러로 기관별 이기종 API를 재사용 가능한 구조로 통합했습니다.',
          'JSON/XML 파싱을 공통 구조로 통합하고, 대량 적재 오류를 분할 처리로 해결했으며 MySQL에서 PostgreSQL로 이관했습니다.',
        ],
      },
      {
        title: '전남도청 근무관리시스템',
        period: '2022.10~2022.11 구축 · 이후 유지보수',
        technologies: ['Java', 'Spring', 'Spring Security', 'MyBatis', 'PostgreSQL', 'Apache POI'],
        points: [
          'Spring Security 로그인과 당직·재난상황·근무·통계 등 10개 이상 업무 영역을 개발했습니다.',
          'SQL 통계 리포트와 엑셀 업·다운로드, 오류 데이터를 바로 고칠 수 있는 오류 파일 처리를 구현했습니다.',
          '서버 OS와 프로그램을 설치해 도청에 배포하고 유지보수를 담당했습니다.',
        ],
      },
      {
        title: '3D 웹 프로젝트 (GS 인증)',
        period: '2022.08~2022.10',
        technologies: ['Java', 'Spring', 'Three.js', 'PostgreSQL'],
        points: [
          'Three.js 기반 3D 뷰어, 모니터링 애니메이션, 카메라 위치 프리셋을 구현했습니다.',
          '사용자·모델 관리 기능을 개발하고 보안 요건을 충족해 GS 인증 획득에 기여했습니다.',
        ],
      },
    ],
  },
  {
    label: '운영·유지보수',
    projects: [
      {
        title: '전라남도 광역 CCTV 통합플랫폼 운영',
        period: '2022.06~현재',
        technologies: ['Java', 'Spring', 'PostgreSQL', 'Oracle', 'VMS', 'Tomcat'],
        points: [
          '22개 시군 CCTV·VMS·영상중계 시스템의 정기점검과 장애 대응을 VMS·망연계·방화벽 업체와 함께 수행했습니다.',
          '전 지자체 gate 재설치와 VMS 교체 지자체의 동기화 설치, CCTV 좌표·구분코드 등록을 맡았습니다.',
          '보안성 검토에 대응해 Tomcat 버전 노출 차단, 접속 IP·포트 제한, 서버별 보안 점검을 수행했습니다.',
        ],
      },
      {
        title: '완도군 공간정보시스템',
        period: '2023.01~2025.07',
        technologies: ['Java', 'GeoServer', 'SHP', '좌표계 변환'],
        points: [
          'SHP 등록 시 원본 좌표계를 선택해 EPSG:5186으로 변환 등록하도록 개선했습니다.',
          'KRAS-KOREPS 변경 후 멈춘 개별공시지가 조회를 운영서버 디버깅으로 추적해 연결 설정 누락과 API 필드 변경을 수정했습니다.',
        ],
      },
      {
        title: '곡성군 Web-GIS · 영상중계 플랫폼',
        period: '2024.05~2026.06',
        technologies: ['Web-GIS', 'Java', 'PostgreSQL/PostGIS', 'VMS'],
        points: [
          'VMS·gate·Web-GIS·DB·바로e맵 현장 설치와 안정화 패치를 수행했습니다.',
          '엑셀로 관리하던 CCTV 화각·구분 데이터를 GIS DB와 동기화하고 행안부 기준으로 구분코드를 재배치했습니다.',
          'CCTV 동기화와 정사영상 표출 오류, 레이어 스타일 저장 오류를 해결했습니다.',
        ],
      },
      {
        title: '목포시 영상반출 시스템',
        period: '2023.04~2024.08',
        technologies: ['Linux', 'Vurix VMS API'],
        points: [
          'Vurix VMS API 버전 업데이트에 맞춰 영상반출 오류를 정상화했습니다.',
          '관제센터 신규 서버로 영상반출 시스템을 설치·이전했습니다.',
          '승인일시·재생횟수·첨부파일 수정과 정보공개청구 관리 기능을 추가했습니다.',
        ],
      },
      {
        title: '영암군 통합플랫폼',
        period: '2022.11~2025.12',
        technologies: ['VMS', 'CCTV 동기화'],
        points: [
          'CCTV 과거영상 저장 오류와 DMZ 서버 통신 오류 등 장애에 대응했습니다.',
          'Vurix에서 다누시스로 VMS를 교체할 때 gate·브릿지를 설치하고 CCTV 목록을 재적재·동기화했습니다.',
        ],
      },
      {
        title: '정읍시 통합플랫폼 · 영상반출 시스템',
        period: '2022.11~2025.06',
        technologies: ['VMS', 'SQL'],
        points: [
          '대시보드 날씨·통계·로드뷰·이력조회 오류와 영상반출·장비 관리 기능을 수정했습니다.',
          'TCOS 서비스 쿼리를 수정하고 VMS 계정 오류로 실패한 영상반출을 조치했습니다.',
        ],
      },
    ],
  },
];

export const otherProjects: string[] = [
  '스마트도시협회 NDMS 테이블 생성·백업 (2022.06)',
  '사천시 재난관리 시스템 SMS·방송장비 그룹 기능 추가 (2022.08)',
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
    items: ['Java', 'Spring Boot', 'Spring Framework', 'Spring Batch', 'Spring Security', 'Quartz', 'MyBatis'],
  },
  {
    label: 'Data',
    items: ['PostgreSQL', 'PostGIS', 'Oracle', 'MySQL', 'JSON/XML'],
  },
  {
    label: 'GIS',
    items: ['OpenLayers', 'GeoServer', 'Cesium.js', 'Three.js', 'QGIS', 'GeoTools', 'VWorld API'],
  },
  {
    label: 'Integration / Operations',
    items: ['REST API', 'MQTT', 'Linux', 'Windows Server', 'Tomcat'],
  },
  {
    label: '영상관제',
    items: ['Genetec', 'Milestone', '이노뎁', 'Vurix', '다누시스', 'CCTV 동기화·영상중계'],
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
  {
    title: '『우아한 타입스크립트 with 리액트』 스터디',
    summary: '2024.08~2025.01 · 타입 시스템, 제네릭, 유틸리티 타입을 실습했습니다.',
    href: 'https://github.com/Gwangju-Web-Study/WoowahanTS_Study',
    external: true,
  },
  {
    title: '『모던 자바스크립트 Deep Dive』 스터디',
    summary: '2024.02~2024.07 · 비동기, 클로저, 프로토타입 등 동작 원리를 학습했습니다.',
    href: 'https://github.com/Gwangju-Web-Study/ModernJS_Deepdive',
    external: true,
  },
];

export const activities: string[] = ['2022 AI 창업 경진대회 참가 (정보통신산업진흥원 주관, 2022.06)'];
