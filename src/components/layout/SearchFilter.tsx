'use client';

import { useState } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { REGIONS, HIRE_TYPES, RECRUIT_TYPES } from '@/lib/utils';

export function SearchFilter() {
  const {
    keyword,
    setKeyword,
    regions,
    toggleRegion,
    hireTypes,
    toggleHireType,
    recruitTypes,
    toggleRecruitType,
    onlyOngoing,
    setOnlyOngoing,
    resetFilters,
  } = useFilterStore();

  const [searchInput, setSearchInput] = useState(keyword);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
  };

  const activeFilterCount =
    regions.length + hireTypes.length + recruitTypes.length + (onlyOngoing ? 0 : 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      {/* 검색바 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="공고명, 기관명으로 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          검색
        </button>
      </form>

      {/* 필터 토글 버튼 */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          필터 {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyOngoing}
            onChange={(e) => setOnlyOngoing(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">진행중인 공고만</span>
        </label>
      </div>

      {/* 상세 필터 */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          {/* 지역 */}
          <FilterSection title="근무지역">
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <FilterChip
                  key={region}
                  label={region}
                  isActive={regions.includes(region)}
                  onClick={() => toggleRegion(region)}
                />
              ))}
            </div>
          </FilterSection>

          {/* 고용형태 */}
          <FilterSection title="고용형태">
            <div className="flex flex-wrap gap-2">
              {HIRE_TYPES.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  isActive={hireTypes.includes(type)}
                  onClick={() => toggleHireType(type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* 채용구분 */}
          <FilterSection title="채용구분">
            <div className="flex flex-wrap gap-2">
              {RECRUIT_TYPES.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  isActive={recruitTypes.includes(type)}
                  onClick={() => toggleRecruitType(type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* 필터 초기화 */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-red-500 hover:text-red-700"
            >
              필터 초기화
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      {children}
    </div>
  );
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
        ${isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      {label}
    </button>
  );
}
