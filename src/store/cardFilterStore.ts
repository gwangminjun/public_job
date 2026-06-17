import { create } from 'zustand';
import type { CardFilterState } from '@/lib/pokemon/types';

interface CardFilterStore extends CardFilterState {
  setKeyword: (keyword: string) => void;
  toggleType: (type: string) => void;
  toggleSubtype: (subtype: string) => void;
  setRarity: (rarity: string) => void;
  setHpMin: (hpMin: string) => void;
  setHpMax: (hpMax: string) => void;
  setOrderBy: (orderBy: string) => void;
  setPage: (page: number) => void;
  buildQuery: () => string;
  resetFilters: () => void;
}

const initial: CardFilterState = {
  keyword: '',
  types: [],
  subtypes: [],
  rarity: '',
  hpMin: '',
  hpMax: '',
  orderBy: 'name',
  page: 1,
};

export const useCardFilterStore = create<CardFilterStore>((set, get) => ({
  ...initial,

  setKeyword: (keyword) => set({ keyword, page: 1 }),

  toggleType: (type) =>
    set((s) => ({
      types: s.types.includes(type) ? s.types.filter((t) => t !== type) : [...s.types, type],
      page: 1,
    })),

  toggleSubtype: (subtype) =>
    set((s) => ({
      subtypes: s.subtypes.includes(subtype)
        ? s.subtypes.filter((t) => t !== subtype)
        : [...s.subtypes, subtype],
      page: 1,
    })),

  setRarity: (rarity) => set({ rarity, page: 1 }),
  setHpMin: (hpMin) => set({ hpMin, page: 1 }),
  setHpMax: (hpMax) => set({ hpMax, page: 1 }),
  setOrderBy: (orderBy) => set({ orderBy, page: 1 }),
  setPage: (page) => set({ page }),

  buildQuery: () => {
    const { keyword, types, subtypes, rarity, hpMin, hpMax } = get();
    const parts: string[] = [];

    if (keyword) parts.push(`name:${keyword}*`);
    types.forEach((t) => parts.push(`types:${t}`));
    subtypes.forEach((s) => parts.push(`subtypes:"${s}"`));
    if (rarity) parts.push(`rarity:"${rarity}"`);
    if (hpMin && hpMax) parts.push(`hp:[${hpMin} TO ${hpMax}]`);
    else if (hpMin) parts.push(`hp:[${hpMin} TO *]`);
    else if (hpMax) parts.push(`hp:[* TO ${hpMax}]`);

    return parts.join(' ');
  },

  resetFilters: () => set(initial),
}));
