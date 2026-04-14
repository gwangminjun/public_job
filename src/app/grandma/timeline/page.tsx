import { getGrandmaTimeline } from '@/lib/grandma/server';

export default async function TimelinePage() {
  const events = await getGrandmaTimeline();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#5C3317' }}>
          📖 80년의 발자취
        </h1>
        <p className="text-sm" style={{ color: '#A07850' }}>
          할머니의 소중한 인생 여정
        </p>
      </div>

      {/* 타임라인 */}
      <div className="relative">
        {/* 세로선 */}
        <div
          className="absolute left-8 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: '#C49A6C' }}
        />

        <div className="space-y-8">
          {events.map((event) => (
            <div key={event.year} className="relative flex items-start gap-6">
              {/* 원형 아이콘 */}
              <div
                className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md shrink-0 border-2"
                style={
                  event.highlight
                    ? { backgroundColor: '#7B4F2E', borderColor: '#7B4F2E', fontSize: '1.5rem' }
                    : { backgroundColor: '#FFF3DC', borderColor: '#C49A6C' }
                }
              >
                {event.emoji}
              </div>

              {/* 내용 */}
              <div
                className="flex-1 rounded-2xl p-5 border shadow-sm"
                style={
                  event.highlight
                    ? { backgroundColor: '#7B4F2E', borderColor: '#7B4F2E' }
                    : { backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }
                }
              >
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={
                      event.highlight
                        ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                        : { backgroundColor: '#E8C99A', color: '#5C3317' }
                    }
                  >
                    {event.year}년
                  </span>
                  <h3
                    className="font-bold text-sm"
                    style={{ color: event.highlight ? 'white' : '#5C3317' }}
                  >
                    {event.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: event.highlight ? 'rgba(255,255,255,0.85)' : '#7B4F2E' }}
                >
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-12 py-8 rounded-3xl border" style={{ backgroundColor: '#FFFAF3', borderColor: '#E8C99A' }}>
        <p className="text-3xl mb-3">🌸</p>
        <p className="font-bold text-lg" style={{ color: '#5C3317' }}>
          80년의 세월이 담긴 소중한 삶
        </p>
        <p className="text-sm mt-2" style={{ color: '#A07850' }}>
          할머니, 오래오래 건강하세요
        </p>
      </div>
    </div>
  );
}
