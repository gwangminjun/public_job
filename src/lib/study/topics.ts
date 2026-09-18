export const SUBJECTS = [
  { id: 'algorithm', title: '알고리즘', folder: '알고리즘' },
  { id: 'machine-learning', title: '머신러닝', folder: '머신러닝' },
] as const;

export type StudySubject = (typeof SUBJECTS)[number]['id'];
export interface StudyTopic {
  id: string;
  subject: StudySubject;
  title: string;
  question: string;
  sources: string[];
}

export const STUDY_TOPICS: StudyTopic[] = [
  { id: 'search', subject: 'algorithm', title: '탐색과 이진 탐색 트리', question: '순차 탐색·이진 탐색·BST의 조건과 복잡도를 비교하고, BST의 삭제 3가지 경우와 2-3-4 트리의 균형 유지 방법을 설명하세요.', sources: ['탐색_알고리즘.md'] },
  { id: 'balanced-hash', subject: 'algorithm', title: '균형 탐색 트리와 해싱', question: '레드-블랙 트리와 B-트리의 특징을 쓰고, 해시 충돌을 체이닝·선형 탐사·이차 탐사로 해결하는 방법을 비교하세요.', sources: ['균형탐색트리와_해싱.md'] },
  { id: 'greedy', subject: 'algorithm', title: '욕심쟁이 방법', question: '그리디의 선택 원리와 한계를 설명하세요. 동전 1·3·4로 6을 만들 때의 반례와 분할 가능 배낭의 선택 기준을 쓰세요.', sources: ['욕심쟁이_방법.md'] },
  { id: 'sorting', subject: 'algorithm', title: '비교 기반 정렬', question: '선택·버블·삽입·셸·퀵·합병 정렬의 동작, 시간 복잡도, 안정성을 비교하세요. 퀵과 합병의 분할·결합 차이는 무엇인가요?', sources: ['정렬_알고리즘.md', '시험_직전_핵심암기.md'] },
  { id: 'heap', subject: 'algorithm', title: '힙과 힙 정렬', question: '완전 이진 트리와 최대·최소 힙의 조건을 쓰세요. 최대 힙으로 오름차순 정렬하는 과정과 힙 구축·전체 정렬의 복잡도를 설명하세요.', sources: ['힙과_힙정렬.md'] },
  { id: 'distribution', subject: 'algorithm', title: '분포 기반 정렬', question: '비교 정렬의 하한과 계수·기수·버킷 정렬의 전제 및 복잡도를 쓰세요. LSD와 MSD의 차이를 설명하세요.', sources: ['분포기반_정렬.md'] },
  { id: 'graph', subject: 'algorithm', title: '그래프와 순회', question: '인접 행렬과 리스트를 비교하고, DFS·BFS의 자료구조와 동작을 쓰세요. 위상 정렬의 조건, 연결 성분과 강연결 성분의 차이는 무엇인가요?', sources: ['그래프.md'] },
  { id: 'foundations', subject: 'machine-learning', title: '학습의 기본 개념', question: 'AI·머신러닝·딥러닝의 포함 관계와 학습·추론 흐름을 쓰세요. 지도·비지도·강화학습, 분류·회귀·군집화를 구분하세요.', sources: ['머신러닝.md'] },
  { id: 'bayes-knn', subject: 'machine-learning', title: '베이즈와 K-NN', question: '베이즈 정리와 분류 기준, 가우시안 공분산에 따른 결정경계, K-NN의 예측 방식과 K의 영향을 설명하세요.', sources: ['머신러닝.md'] },
  { id: 'features', subject: 'machine-learning', title: '특징 추출과 차원 축소', question: 'PCA의 계산 순서와 LDA의 목적함수를 쓰세요. 레이블 사용 여부와 보존하는 정보를 비교하고 MDS·t-SNE·Isomap을 구분하세요.', sources: ['특징추출.md'] },
  { id: 'regression', subject: 'machine-learning', title: '선형회귀와 로지스틱 회귀', question: '잔차·최소제곱·MSE·RMSE를 설명하고, 시그모이드·오즈·로짓의 관계를 쓰세요. 로지스틱 회귀는 무엇을 예측하고 어떻게 학습하나요?', sources: ['회귀.md'] },
  { id: 'svm', subject: 'machine-learning', title: 'SVM과 커널', question: '결정경계·마진·서포트 벡터의 관계를 설명하세요. 하드/소프트 마진, 슬랙 변수와 C, 커널 트릭의 역할을 쓰세요.', sources: ['선형분류기_SVM_커널법.md'] },
  { id: 'decision-tree', subject: 'machine-learning', title: '결정트리와 랜덤 포레스트', question: '지니 불순도·엔트로피·정보이득·분산 감소량이 각각 어떤 분할을 선호하는지 쓰세요. 과적합 대책과 랜덤 포레스트의 두 무작위성을 설명하세요.', sources: ['결정트리.md'] },
  { id: 'ensemble', subject: 'machine-learning', title: '앙상블 학습', question: '배깅과 부스팅의 데이터 구성·학습 순서·결합 방식을 비교하세요. AdaBoost, 스태킹, 캐스케이딩, 전문가 혼합을 구분하세요.', sources: ['앙상블학습 (1).md'] },
  { id: 'clustering', subject: 'machine-learning', title: '군집화', question: 'K-평균의 할당·갱신 과정과 목적함수, 초기값·K의 영향을 쓰세요. 계층적 군집화의 두 방향과 5가지 연결법을 설명하세요.', sources: ['군집화.md'] },
  { id: 'neural-network', subject: 'machine-learning', title: '신경망과 퍼셉트론', question: '인공신경망의 3요소와 뉴런 계산식을 쓰세요. 활성화 함수의 특징, 퍼셉트론의 XOR 한계, MLP가 비선형 문제를 푸는 조건을 설명하세요.', sources: ['신경망_퍼셉트론.md'] },
  { id: 'training', subject: 'machine-learning', title: 'MLP 학습과 MNIST', question: '전방향 계산부터 가중치 갱신까지 설명하고 역전파와 경사하강법을 구분하세요. 학습 모드·출력층/손실 조합·과적합 대책·MNIST 구성을 쓰세요.', sources: ['MLP_학습과_MNIST.md'] },
  { id: 'cnn', subject: 'machine-learning', title: 'CNN과 학습 성능 개선', question: '합성곱·패딩·스트라이드·풀링의 역할을 쓰세요. 풀링의 채널 수와 학습 파라미터, 느린 학습 및 과적합의 개선 방법을 구분하세요.', sources: ['딥러닝_CNN_학습정리.md'] },
  { id: 'rnn', subject: 'machine-learning', title: 'RNN·LSTM·GRU', question: 'RNN의 가중치 공유와 BPTT를 설명하세요. 기울기 소멸·폭발·장기 의존성을 구분하고 LSTM/GRU의 게이트를 쓰세요.', sources: ['딥러닝_CNN_학습정리.md'] },
  { id: 'vision', subject: 'machine-learning', title: '영상 인식·검출·생성', question: 'AlexNet·VGG·GoogLeNet·ResNet의 핵심을 비교하세요. 객체검출·영상설명·오토인코더·U-Net·GAN의 목적과 구조를 구분하세요.', sources: ['딥러닝_응용.md'] },
  { id: 'nlp', subject: 'machine-learning', title: '자연어처리와 Transformer', question: '전처리와 텍스트 표현, CBOW/Skip-gram을 비교하세요. Seq2Seq의 한계와 Attention·Transformer·BERT의 차이, 두 CoT 방식의 차이를 쓰세요.', sources: ['딥러닝_응용.md'] },
  { id: 'reinforcement', subject: 'machine-learning', title: '강화학습과 DQN', question: 'MDP의 5요소, 정책·수익·V·Q를 쓰세요. Q-학습의 갱신과 탐험/활용, Q-테이블의 한계, DQN의 안정화 기법을 설명하세요.', sources: ['딥러닝_응용.md'] },
];

export function getStudySubject(value: string | null): StudySubject {
  return value === 'machine-learning' ? value : 'algorithm';
}
