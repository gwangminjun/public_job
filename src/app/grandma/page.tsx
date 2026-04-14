import Link from 'next/link';
import { Countdown } from '@/components/grandma/Countdown';

const MENU_CARDS = [
  {
    href: '/grandma/timeline',
    emoji: '📖',
    title: '80년의 발자취',
    desc: '할머니의 소중한 인생 이야기',
  },
  {
    href: '/grandma/gallery',
    emoji: '📷',
    title: '사진첩',
    desc: '추억이 담긴 소중한 사진들',
  },
  {
    href: '/grandma/guestbook',
    emoji: '✉️',
    title: '방명록',
    desc: '따뜻한 축하 메시지를 남겨주세요',
  },
];

export default function GrandmaHomePage() {
  return (
    <div>
      {/* 히어로 섹션 */}
      <section
        className="relative overflow-hidden py-20 px-4 text-center"
        style={{
          background: 'linear-gradient(160deg, #FFF3DC 0%, #FFE4C4 50%, #FFDAB9 100%)',
        }}
      >
        {/* 장식 꽃 */}
        <div className="absolute top-4 left-4 text-4xl opacity-30 select-none">🌸</div>
        <div className="absolute top-8 right-8 text-3xl opacity-20 select-none">🌼</div>
        <div className="absolute bottom-4 left-12 text-3xl opacity-20 select-none">🌺</div>
        <div className="absolute bottom-6 right-6 text-4xl opacity-30 select-none">🌸</div>

        <div className="relative max-w-2xl mx-auto">
          <p className="text-5xl mb-4">🎂</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#5C3317' }}>
            팔순을 축하합니다
          </h1>
          <p className="text-xl md:text-2xl mb-2" style={{ color: '#8B5E3C' }}>
            할머니의 소중한 80번째 생신
          </p>
          <p className="text-base mb-10" style={{ color: '#A07850' }}>
            2026년 4월 25일 (토)
          </p>

          {/* 카운트다운 */}
          <div
            className="inline-block rounded-3xl px-8 py-6 shadow-xl mb-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: '#A07850' }}>
              🎉 잔치까지 남은 시간
            </p>
            <Countdown />
          </div>
        </div>
      </section>

      {/* 잔치 정보 */}
      <section className="max-w-2xl mx-auto px-4 py-10">
        <div
          className="rounded-3xl p-6 md:p-8 shadow-sm border text-center"
          style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}
        >
          <h2 className="text-xl font-bold mb-6" style={{ color: '#5C3317' }}>
            🌸 잔치 안내
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm" style={{ color: '#7B4F2E' }}>
            <div>
              <p className="text-2xl mb-2">📅</p>
              <p className="font-semibold mb-1">일시</p>
              <p>2026년 4월 25일 (토)</p>
              <p>오후 12시</p>
            </div>
            <div>
              <p className="text-2xl mb-2">📍</p>
              <p className="font-semibold mb-1">장소</p>
              <p>가족 모임 장소</p>
              <p className="text-xs opacity-70 mt-1">추후 업데이트</p>
            </div>
            <div>
              <p className="text-2xl mb-2">👨‍👩‍👧‍👦</p>
              <p className="font-semibold mb-1">주최</p>
              <p>온 가족이 함께</p>
              <p className="text-xs opacity-70 mt-1">소중한 분들과 함께</p>
            </div>
          </div>
        </div>
      </section>

      {/* 메뉴 카드 */}
      <section className="max-w-2xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MENU_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col items-center text-center rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {card.emoji}
              </span>
              <h3 className="font-bold text-sm mb-1" style={{ color: '#5C3317' }}>
                {card.title}
              </h3>
              <p className="text-xs" style={{ color: '#A07850' }}>
                {card.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 관리자 버튼 */}
      <section className="max-w-2xl mx-auto px-4 pb-16 text-center">
        <Link
          href="/grandma/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          style={{ backgroundColor: '#FFFAF3', borderColor: '#C49A6C', color: '#7B4F2E' }}
        >
          🛠️ 사진 관리
        </Link>
      </section>
    </div>
  );
}
