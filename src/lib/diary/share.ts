export const DIARY_SHARE_TITLE = '우리 둘의 일기장';
export const DIARY_SHARE_TEXT = '우리 둘만 보는 비공개 일기장이에요.\n함께 쌓아 온 하루를 보러 오세요.';

export function diaryShareDetails(origin: string) {
  return {
    title: DIARY_SHARE_TITLE,
    text: DIARY_SHARE_TEXT,
    url: new URL('/diary', origin).toString(),
  };
}
