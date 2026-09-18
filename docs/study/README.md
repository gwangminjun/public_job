# 시험 공부 화면

- `/study/review`: 과목별 단권화, 본문 검색, 목차, 원문 참고, 인쇄/PDF.
- `/study/recall`: 주제 질문 → 백지 작성 → 답안 확인 → 다시 공부/설명 가능 표시.
- 프로젝트 허브 `/`에서 두 화면으로 바로 이동한다. 기존 `/study` 정보보안기사 체크리스트도 유지한다.

## 자료 관리

`단권화/알고리즘.md`와 `단권화/머신러닝.md`를 두 화면의 공통 답안으로 사용한다. 각 `##` 제목은 `src/lib/study/topics.ts`의 제목과 일치해야 한다. 주제 ID는 답안 저장 키이므로 기존 ID를 바꾸지 않는다.

알고리즘 원문 9개 중 `전공 - 알고리즘.md`는 다른 8개 문서의 종합본이다. 제목 번호와 공백을 제외한 본문 중복을 확인해, 단권화에서 중복 설명을 한 번만 다뤘다. 머신러닝 원문 11개는 15개 주제로 나눴으며 CNN 문서의 RNN, 응용 문서의 영상·NLP·강화학습도 포함한다. 원문 파일은 보존한다.

원문에 축약된 설명은 단권화에서 성립 조건을 보충했다. 예: 버블 정렬의 최선 조건, BST/해싱의 최악 시간, 베이즈 최소거리와 사전확률, 마르코프 성질, DQN 모델 구조와 예제의 구분. 원문의 “다변량 선형회귀”는 여러 입력·단일 출력의 다중 선형회귀로, 강화학습의 “탐사”는 활용(Exploitation)으로 병기한다.

보충 조건 확인: [가우시안 판별과 사전확률·LDA 차원](https://scikit-learn.org/stable/modules/lda_qda.html), [MDP와 마르코프 성질 강의 자료](https://opencourse.inf.ed.ac.uk/sites/default/files/https/opencourse.inf.ed.ac.uk/rl/2024/rl3markovdecisionprocesses.pdf). Markdown 표 렌더링은 [react-markdown 공식 문서](https://github.com/remarkjs/react-markdown)의 GFM 플러그인 방식을 사용한다.

## 배포와 저장

요약 화면과 허용된 주제의 원문 API는 빌드 시 정적으로 생성한다. `docs/study`를 읽는 코드는 서버 전용이며, 원문은 사용자가 펼칠 때만 요청한다. 문서 변경 후 다시 빌드·배포해야 반영된다. 학습 자료 열람에는 로그인이나 Supabase 설정이 필요하지 않다.

백지 답안과 자가 평가는 `localStorage`의 `study-recall-v1`에 저장한다. 동일 브라우저에서 유지되며 기기 간 동기화는 하지 않는다. 저장이 차단되면 화면에서 알리고 현재 입력은 메모리에 유지한다. 브라우저 데이터 삭제 시 기록도 삭제된다.

## 검증

```sh
npm run lint
npm run build
npm run start -- --port 3002
node scripts/study-browser-smoke.mjs
```

브라우저 검증은 설치된 Chrome과 기존 Lighthouse 의존성의 `puppeteer-core`를 사용한다. `CHROME_PATH`, `STUDY_TEST_URL`로 환경을 바꿀 수 있다. 화면 캡처는 Git에서 제외된 `.study-check/`에 저장한다.
