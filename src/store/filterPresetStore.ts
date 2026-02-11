import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FilterPreset, PresetFilters } from '@/lib/types';
import { useFilterStore } from './filterStore';

interface FilterPresetState {
  presets: FilterPreset[];
  savePreset: (name: string, filters: PresetFilters) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}

export const useFilterPresetStore = create<FilterPresetState>()(
  persist(
    (set, get) => ({
      presets: [],
      
      savePreset: (name, filters) => {
        const { presets } = get();

        const newPreset: FilterPreset = {
          id: crypto.randomUUID(),
          name,
          filters,
          createdAt: new Date().toISOString(),
        };
        
        set({ presets: [newPreset, ...presets] });
      },

      loadPreset: (id) => {
        const { presets } = get();
        const preset = presets.find((p) => p.id === id);
        
        if (preset) {
          // Apply filters and reset page to 1
          useFilterStore.getState().setFilters({
            ...preset.filters,
            page: 1
          });
        }
      },

      deletePreset: (id) => {
        const { presets } = get();
        set({
          presets: presets.filter((p) => p.id !== id),
        });
      },
    }),
    {
      name: 'filter-presets',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
