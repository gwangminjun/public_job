export const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const;

export type MbtiType = (typeof MBTI_TYPES)[number];
export type QuestionId =
  | 'start' | 'social' | 'logic' | 'emotion-logical' | 'emotion-other'
  | 'really' | 'machines' | 'bad' | 'lazy' | 'chakra' | 'rules'
  | 'extreme' | 'quiet' | 'enforce' | 'one-night' | 'college';

export type QuizOption = {
  label: string;
  next: { kind: 'question'; id: QuestionId } | { kind: 'result'; type: MbtiType };
};

export type QuizQuestion = {
  text: string;
  options: readonly QuizOption[];
};

export const START_QUESTION_ID: QuestionId = 'start';

export const QUESTIONS: Record<QuestionId, QuizQuestion> = {
  start: {
    text: '너 이상해?',
    options: [
      { label: '응', next: { kind: 'question', id: 'social' } },
      { label: '아니', next: { kind: 'question', id: 'rules' } },
    ],
  },
  social: {
    text: '사회적으로 불안해?',
    options: [
      { label: '응', next: { kind: 'question', id: 'logic' } },
      { label: '아니', next: { kind: 'question', id: 'bad' } },
    ],
  },
  logic: {
    text: '논리적이야?',
    options: [
      { label: '응', next: { kind: 'question', id: 'emotion-logical' } },
      { label: '아니', next: { kind: 'question', id: 'emotion-other' } },
    ],
  },
  'emotion-logical': {
    text: '감정적이야?',
    options: [
      { label: '응', next: { kind: 'result', type: 'INFJ' } },
      { label: '미친 듯이 울음', next: { kind: 'result', type: 'INFP' } },
      { label: '아니', next: { kind: 'question', id: 'really' } },
    ],
  },
  'emotion-other': {
    text: '감정적이야?',
    options: [
      { label: '응', next: { kind: 'result', type: 'INFJ' } },
      { label: '미친 듯이 울음', next: { kind: 'result', type: 'INFP' } },
    ],
  },
  really: {
    text: '진짜로?',
    options: [
      { label: '돌로 된 심장에 대한 찰스 다윈 명언', next: { kind: 'result', type: 'INTJ' } },
      { label: '설명하기엔 좀 길어', next: { kind: 'question', id: 'machines' } },
    ],
  },
  machines: {
    text: '기계 좋아해?',
    options: [
      { label: '완전 좋아', next: { kind: 'result', type: 'ISTP' } },
      { label: '괜찮네', next: { kind: 'result', type: 'INTP' } },
    ],
  },
  bad: {
    text: '나쁜 놈이야?',
    options: [
      { label: '아니', next: { kind: 'result', type: 'INFJ' } },
      { label: '아마 그런 듯', next: { kind: 'question', id: 'lazy' } },
    ],
  },
  lazy: {
    text: '게을러?',
    options: [
      { label: '아니', next: { kind: 'result', type: 'ENTJ' } },
      { label: 'ㅇㅇ', next: { kind: 'question', id: 'chakra' } },
    ],
  },
  chakra: {
    text: '차크라 믿어?',
    options: [
      { label: '개소리지', next: { kind: 'result', type: 'ENTP' } },
      { label: '명상 좀 더 해야겠어. 힘의 중심이 안 맞아', next: { kind: 'result', type: 'ENFP' } },
    ],
  },
  rules: {
    text: '규칙은?',
    options: [
      { label: '어기라고 만들어진 것', next: { kind: 'question', id: 'extreme' } },
      { label: '사회가 원활하게 굴러가기 위해 필요한 것', next: { kind: 'question', id: 'enforce' } },
      { label: '짜증 나지만 않으면 괜찮아', next: { kind: 'question', id: 'one-night' } },
    ],
  },
  extreme: {
    text: '익스트림 스포츠?',
    options: [
      { label: '존중', next: { kind: 'result', type: 'ESTP' } },
      { label: '차라리 마약을 하겠다', next: { kind: 'question', id: 'quiet' } },
    ],
  },
  quiet: {
    text: '조용하게?',
    options: [
      { label: '아니', next: { kind: 'result', type: 'ESFP' } },
      { label: '응', next: { kind: 'result', type: 'ISFP' } },
    ],
  },
  enforce: {
    text: '규칙을 강제한다면?',
    options: [
      { label: '소리 지르면서', next: { kind: 'result', type: 'ESTJ' } },
      { label: '소리 지르지는 않고', next: { kind: 'result', type: 'ISTJ' } },
    ],
  },
  'one-night': {
    text: '원나잇 어케 생각해?',
    options: [
      { label: 'ㄱㅊ네', next: { kind: 'question', id: 'college' } },
      { label: '아베 마리아를 40번 말함', next: { kind: 'result', type: 'ISFJ' } },
    ],
  },
  college: {
    text: '대학 교육 받았어?',
    options: [
      { label: '젠더학', next: { kind: 'result', type: 'ENFJ' } },
      { label: '아니', next: { kind: 'result', type: 'ESFJ' } },
    ],
  },
};
