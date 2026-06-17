'use client';

import { useState } from 'react';
import { useCardFilterStore } from '@/store/cardFilterStore';

const TYPES = [
  'Fire', 'Water', 'Grass', 'Lightning', 'Psychic',
  'Fighting', 'Darkness', 'Metal', 'Dragon', 'Fairy', 'Colorless',
];
const SUBTYPES = ['Basic', 'Stage 1', 'Stage 2', 'EX', 'GX', 'V', 'VMAX', 'VSTAR', 'ex'];
const RARITIES = [
  'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo EX', 'Rare Holo GX',
  'Rare Holo V', 'Rare Holo VMAX', 'Rare Ultra', 'Rare Secret', 'Rare Rainbow',
  'Amazing Rare', 'Promo',
];
const ORDER_OPTIONS = [
  { value: 'name', label: '이름 (A-Z)' },
  { value: '-name', label: '이름 (Z-A)' },
  { value: 'number', label: '카드 번호' },
  { value: '-hp', label: 'HP 높은순' },
  { value: 'hp', label: 'HP 낮은순' },
];

export function CardFilterPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const store = useCardFilterStore();

  const activeCount = [
    store.types.length > 0,
    store.subtypes.length > 0,
    !!store.rarity,
    !!store.hpMin || !!store.hpMax,
  ].filter(Boolean).length;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
          🎯 필터
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-red-600 text-white rounded-full font-bold">
              {activeCount}
            </span>
          )}
        </span>
        <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-5">

          {/* 타입 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">타입</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => store.toggleType(type)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    store.types.includes(type)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 서브타입 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">서브타입</p>
            <div className="flex flex-wrap gap-1.5">
              {SUBTYPES.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => store.toggleSubtype(sub)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    store.subtypes.includes(sub)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* 희귀도 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">희귀도</p>
            <select
              value={store.rarity}
              onChange={(e) => store.setRarity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="">전체</option>
              {RARITIES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* HP 범위 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">HP 범위</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={store.hpMin}
                onChange={(e) => store.setHpMin(e.target.value)}
                placeholder="최소"
                min={0}
                className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
              <span className="text-gray-400">~</span>
              <input
                type="number"
                value={store.hpMax}
                onChange={(e) => store.setHpMax(e.target.value)}
                placeholder="최대"
                min={0}
                className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* 정렬 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">정렬</p>
            <select
              value={store.orderBy}
              onChange={(e) => store.setOrderBy(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            >
              {ORDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={store.resetFilters}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
