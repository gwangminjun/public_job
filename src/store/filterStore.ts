import { create } from 'zustand';
import { FilterState } from '@/lib/types';

interface FilterStore extends FilterState {
  setKeyword: (keyword: string) => void;
  setRegions: (regions: string[]) => void;
  toggleRegion: (region: string) => void;
  setHireTypes: (hireTypes: string[]) => void;
  toggleHireType: (hireType: string) => void;
  setRecruitTypes: (recruitTypes: string[]) => void;
  toggleRecruitType: (recruitType: string) => void;
  setOnlyOngoing: (onlyOngoing: boolean) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  keyword: '',
  regions: [],
  hireTypes: [],
  recruitTypes: [],
  onlyOngoing: true,
  page: 1,
  limit: 20,
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,

  setKeyword: (keyword) => set({ keyword, page: 1 }),

  setRegions: (regions) => set({ regions, page: 1 }),

  toggleRegion: (region) => set((state) => ({
    regions: state.regions.includes(region)
      ? state.regions.filter((r) => r !== region)
      : [...state.regions, region],
    page: 1,
  })),

  setHireTypes: (hireTypes) => set({ hireTypes, page: 1 }),

  toggleHireType: (hireType) => set((state) => ({
    hireTypes: state.hireTypes.includes(hireType)
      ? state.hireTypes.filter((h) => h !== hireType)
      : [...state.hireTypes, hireType],
    page: 1,
  })),

  setRecruitTypes: (recruitTypes) => set({ recruitTypes, page: 1 }),

  toggleRecruitType: (recruitType) => set((state) => ({
    recruitTypes: state.recruitTypes.includes(recruitType)
      ? state.recruitTypes.filter((r) => r !== recruitType)
      : [...state.recruitTypes, recruitType],
    page: 1,
  })),

  setOnlyOngoing: (onlyOngoing) => set({ onlyOngoing, page: 1 }),

  setPage: (page) => set({ page }),

  setLimit: (limit) => set({ limit, page: 1 }),

  resetFilters: () => set(initialState),
}));
