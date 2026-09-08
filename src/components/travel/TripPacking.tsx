'use client';

import { useMemo, useState } from 'react';
import { useTravelStore } from '@/store/travelStore';
import { Trip } from '@/lib/travel/types';

const PACKING_CATEGORIES = ['필수', '의류', '전자기기', '세면도구', '기타'];

const DEFAULT_TEMPLATE: Array<{ name: string; category: string }> = [
  { name: '여권 / 신분증', category: '필수' },
  { name: '지갑 · 카드', category: '필수' },
  { name: '숙소 예약 확인서', category: '필수' },
  { name: '상의', category: '의류' },
  { name: '하의', category: '의류' },
  { name: '속옷 · 양말', category: '의류' },
  { name: '휴대폰 충전기', category: '전자기기' },
  { name: '보조배터리', category: '전자기기' },
  { name: '칫솔 · 치약', category: '세면도구' },
  { name: '스킨케어', category: '세면도구' },
  { name: '상비약', category: '기타' },
];

export function TripPacking({ trip }: { trip: Trip }) {
  const addPackingItem = useTravelStore((s) => s.addPackingItem);
  const addPackingItems = useTravelStore((s) => s.addPackingItems);
  const togglePackingItem = useTravelStore((s) => s.togglePackingItem);
  const deletePackingItem = useTravelStore((s) => s.deletePackingItem);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(PACKING_CATEGORIES[0]);

  const packedCount = trip.packing.filter((i) => i.packed).length;
  const progress = trip.packing.length === 0 ? 0 : Math.round((packedCount / trip.packing.length) * 100);

  const grouped = useMemo(() => {
    const categories = [
      ...PACKING_CATEGORIES,
      ...trip.packing.map((i) => i.category).filter((c) => !PACKING_CATEGORIES.includes(c)),
    ];
    return categories
      .filter((c, i) => categories.indexOf(c) === i)
      .map((c) => ({ category: c, items: trip.packing.filter((i) => i.category === c) }))
      .filter((g) => g.items.length > 0);
  }, [trip.packing]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addPackingItem(trip.id, name.trim(), category);
    setName('');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            챙긴 짐 {packedCount} / {trip.packing.length}
          </span>
          <span className="text-sky-600 font-semibold">{progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {trip.packing.length === 0 && (
          <button
            onClick={() => addPackingItems(trip.id, DEFAULT_TEMPLATE)}
            className="mt-4 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900 transition-colors"
          >
            ✨ 기본 템플릿으로 시작하기
          </button>
        )}
      </div>

      <form
        onSubmit={handleAdd}
        className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 shadow-sm"
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        >
          {PACKING_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="준비물 이름"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          추가
        </button>
      </form>

      {grouped.map(({ category: cat, items }) => (
        <section key={cat} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
          <h3 className="border-b border-slate-100 dark:border-slate-800 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white">
            {cat}{' '}
            <span className="font-normal text-slate-400">
              {items.filter((i) => i.packed).length}/{items.length}
            </span>
          </h3>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-2.5">
                <label className="flex flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.packed}
                    onChange={() => togglePackingItem(trip.id, item.id)}
                    className="h-4 w-4 accent-sky-600"
                  />
                  <span
                    className={`text-sm ${item.packed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}
                  >
                    {item.name}
                  </span>
                </label>
                <button
                  onClick={() => deletePackingItem(trip.id, item.id)}
                  className="rounded p-1 text-slate-300 hover:text-red-500 transition-colors"
                  aria-label="삭제"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
