'use client';

import { useEffect, useMemo, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetDate: Date): TimeLeft {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

interface CountdownProps {
  targetIso: string;
}

export function Countdown({ targetIso }: CountdownProps) {
  const targetDate = useMemo(() => new Date(targetIso), [targetIso]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setTimeLeft(calcTimeLeft(targetDate)), 0);
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000);
    return () => {
      window.clearTimeout(timeoutId);
      clearInterval(id);
    };
  }, [targetDate]);

  if (!timeLeft) return null;

  const isDDay = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;

  if (isDDay) {
    return (
      <div className="text-center py-6">
        <p className="text-4xl font-bold" style={{ color: '#7B4F2E' }}>🎉 오늘이 바로 그 날! 🎉</p>
      </div>
    );
  }

  const units = [
    { label: '일', value: pad(timeLeft.days) },
    { label: '시간', value: pad(timeLeft.hours) },
    { label: '분', value: pad(timeLeft.minutes) },
    { label: '초', value: pad(timeLeft.seconds) },
  ];

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="text-center">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg"
              style={{ backgroundColor: '#7B4F2E' }}
            >
              {value}
            </div>
            <p className="text-xs mt-1 font-medium" style={{ color: '#7B4F2E' }}>{label}</p>
          </div>
          {i < units.length - 1 && (
            <span className="text-2xl font-bold mb-4" style={{ color: '#C49A6C' }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}
