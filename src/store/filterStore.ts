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
  setNcsTypes: (ncsTypes: string[]) => void;
  toggleNcsType: (ncsType: string) => void;
  setEducationTypes: (educationTypes: string[]) => void;
  toggleEducationType: (educationType: string) => void;
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
  ncsTypes: [],
  educationTypes: [],
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

  setNcsTypes: (ncsTypes) => set({ ncsTypes, page: 1 }),

  toggleNcsType: (ncsType) => set((state) => ({
    ncsTypes: state.ncsTypes.includes(ncsType)
      ? state.ncsTypes.filter((n) => n !== ncsType)
      : [...state.ncsTypes, ncsType],
    page: 1,
  })),

  setEducationTypes: (educationTypes) => set({ educationTypes, page: 1 }),

  toggleEducationType: (educationType) => set((state) => ({
    educationTypes: state.educationTypes.includes(educationType)
      ? state.educationTypes.filter((e) => e !== educationType)
      : [...state.educationTypes, educationType],
    page: 1,
  })),

  setOnlyOngoing: (onlyOngoing) => set({ onlyOngoing, page: 1 }),

  setPage: (page) => set({ page }),

  setLimit: (limit) => set({ limit, page: 1 }),

  resetFilters: () => set(initialState),
}));
