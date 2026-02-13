'use client';

import { useEffect, useState } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useFilterPresetStore } from '@/store/filterPresetStore';
import { REGIONS, HIRE_TYPES, RECRUIT_TYPES, NCS_TYPES, EDUCATION_TYPES } from '@/lib/utils';
import { SortType } from '@/lib/types';

interface SearchSuggestion {
  text: string;
  type: 'institution' | 'keyword';
}

interface SearchFilterProps {
  showPresetPanel?: boolean;
  isPresetPanelVisible?: boolean;
  onTogglePresetPanel?: () => void;
}

export function SearchFilter({
  showPresetPanel = false,
  isPresetPanelVisible = false,
  onTogglePresetPanel,
}: SearchFilterProps) {
  const {
    keyword,
    setKeyword,
    regions,
    toggleRegion,
    hireTypes,
    toggleHireType,
    recruitTypes,
    toggleRecruitType,
    ncsTypes,
    toggleNcsType,
    educationTypes,
    toggleEducationType,
    onlyOngoing,
    setOnlyOngoing,
    sort,
    setSort,
    resetFilters,
  } = useFilterStore();

  const presets = useFilterPresetStore((state) => state.presets);
  const savePreset = useFilterPresetStore((state) => state.savePreset);
  const loadPreset = useFilterPresetStore((state) => state.loadPreset);
  const deletePreset = useFilterPresetStore((state) => state.deletePreset);

  const [searchInput, setSearchInput] = useState(keyword);
  const [showFilters, setShowFilters] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);


  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  useEffect(() => {
    const query = searchInput.trim();

    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/jobs/suggestions?q=${encodeURIComponent(query)}&limit=8`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data: { suggestions?: SearchSuggestion[] } = await response.json();
        const nextSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
        setSuggestions(nextSuggestions);
        setShowSuggestions(nextSuggestions.length > 0);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSuggestions([]);
        }
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (value: string) => {
    setSearchInput(value);
    setKeyword(value);
    setShowSuggestions(false);
  };

  const activeFilterCount =
    regions.length + hireTypes.length + recruitTypes.length + ncsTypes.length + educationTypes.length + (onlyOngoing ? 0 : 1);

  const handleSavePreset = () => {
    const trimmedName = presetName.trim();

    if (!trimmedName) {
      return;
    }

    savePreset(trimmedName, {
      keyword,
      regions,
      hireTypes,
      recruitTypes,
      ncsTypes,
      educationTypes,
      onlyOngoing,
      sort,
    });
    setPresetName('');
  };

  const handleLoadPreset = () => {
    if (!selectedPresetId) {
      return;
    }

    loadPreset(selectedPresetId);
  };

  const handleDeletePreset = () => {
    if (!selectedPresetId) {
      return;
    }

    deletePreset(selectedPresetId);
    setSelectedPresetId('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 transition-colors duration-300">
      {/* 검색바 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
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
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              window.setTimeout(() => setShowSuggestions(false), 120);
            }}
            placeholder="공고명, 기관명으로 검색..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-800 dark:text-gray-100 truncate">{suggestion.text}</span>
                    <span className="text-[11px] rounded-full px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 shrink-0">
                      {suggestion.type === 'institution' ? '기관' : '직무'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          검색
        </button>
        {onTogglePresetPanel && (
          <button
            type="button"
            onClick={onTogglePresetPanel}
            className={`px-4 py-2.5 rounded-lg font-medium transition-colors border ${
              isPresetPanelVisible
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
            }`}
            aria-pressed={isPresetPanelVisible}
          >
            필터 프리셋
          </button>
        )}
      </form>

      {/* 필터 프리셋 */}
      {showPresetPanel && (
        <div className="mt-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="필터 프리셋 이름"
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                저장
              </button>
            </div>

            <div className="flex-1 flex gap-2">
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">프리셋 선택</option>
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleLoadPreset}
                disabled={!selectedPresetId}
                className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-white hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                불러오기
              </button>
              <button
                type="button"
                onClick={handleDeletePreset}
                disabled={!selectedPresetId}
                className="px-4 py-2 text-sm rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            현재 필터 조건을 이름으로 저장하고 빠르게 다시 불러올 수 있습니다.
          </p>
        </div>
      )}

      {/* 필터 토글 버튼 및 정렬/옵션 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          상세 필터 {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>

        <div className="flex items-center gap-4">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="text-sm border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5 px-3"
          >
            <option value="latest">최신순</option>
            <option value="deadline">마감임박순</option>
            <option value="personnel">채용인원순</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyOngoing}
              onChange={(e) => setOnlyOngoing(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">진행중인 공고만</span>
          </label>
        </div>
      </div>


      {/* 상세 필터 */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
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

          {/* NCS 직무분류 */}
          <FilterSection title="직무분야 (NCS)">
            <div className="flex flex-wrap gap-2">
              {NCS_TYPES.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  isActive={ncsTypes.includes(type)}
                  onClick={() => toggleNcsType(type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* 학력정보 */}
          <FilterSection title="학력">
            <div className="flex flex-wrap gap-2">
              {EDUCATION_TYPES.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  isActive={educationTypes.includes(type)}
                  onClick={() => toggleEducationType(type)}
                />
              ))}
            </div>
          </FilterSection>

          {/* 필터 초기화 */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</h4>
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
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
    >
      {label}
    </button>
  );
}
