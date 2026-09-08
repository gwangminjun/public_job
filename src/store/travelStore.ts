import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Trip,
  TravelPlace,
  TravelExpense,
  PackingItem,
} from '@/lib/travel/types';

interface NewTripInput {
  title: string;
  destination: string;
  emoji: string;
  startDate: string;
  endDate: string;
}

interface TravelState {
  trips: Trip[];

  addTrip: (input: NewTripInput) => string;
  deleteTrip: (tripId: string) => void;

  addPlace: (tripId: string, place: Omit<TravelPlace, 'id'>) => void;
  deletePlace: (tripId: string, placeId: string) => void;
  setPlaceLocation: (tripId: string, placeId: string, lat: number, lng: number) => void;
  movePlace: (tripId: string, placeId: string, direction: 'up' | 'down') => void;

  addPackingItem: (tripId: string, name: string, category: string) => void;
  addPackingItems: (tripId: string, items: Array<{ name: string; category: string }>) => void;
  togglePackingItem: (tripId: string, itemId: string) => void;
  deletePackingItem: (tripId: string, itemId: string) => void;

  addExpense: (tripId: string, expense: Omit<TravelExpense, 'id'>) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
}

function updateTrip(trips: Trip[], tripId: string, updater: (trip: Trip) => Trip): Trip[] {
  return trips.map((trip) => (trip.id === tripId ? updater(trip) : trip));
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set) => ({
      trips: [],

      addTrip: (input) => {
        const id = crypto.randomUUID();
        const newTrip: Trip = {
          id,
          ...input,
          places: [],
          packing: [],
          expenses: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ trips: [newTrip, ...state.trips] }));
        return id;
      },

      deleteTrip: (tripId) => {
        set((state) => ({ trips: state.trips.filter((t) => t.id !== tripId) }));
      },

      addPlace: (tripId, place) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => ({
            ...trip,
            places: [...trip.places, { ...place, id: crypto.randomUUID() }],
          })),
        }));
      },

      deletePlace: (tripId, placeId) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => ({
            ...trip,
            places: trip.places.filter((p) => p.id !== placeId),
          })),
        }));
      },

      setPlaceLocation: (tripId, placeId, lat, lng) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => ({
            ...trip,
            places: trip.places.map((p) => (p.id === placeId ? { ...p, lat, lng } : p)),
          })),
        }));
      },

      movePlace: (tripId, placeId, direction) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => {
            const index = trip.places.findIndex((p) => p.id === placeId);
            if (index < 0) return trip;

            const place = trip.places[index];
            // 같은 날짜 안에서만 순서를 바꾼다
            const step = direction === 'up' ? -1 : 1;
            let swapIndex = index + step;
            while (swapIndex >= 0 && swapIndex < trip.places.length) {
              if (trip.places[swapIndex].date === place.date) break;
              swapIndex += step;
            }
            if (swapIndex < 0 || swapIndex >= trip.places.length) return trip;
            if (trip.places[swapIndex].date !== place.date) return trip;

            const places = [...trip.places];
            [places[index], places[swapIndex]] = [places[swapIndex], places[index]];
            return { ...trip, places };
          }),
        }));
      },

      addPackingItem: (tripId, name, category) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => ({
            ...trip,
            packing: [...trip.packing, { id: crypto.randomUUID(), name, category, packed: false }],
          })),
        }));
      },

      addPackingItems: (tripId, items) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => {
            const existing = new Set(trip.packing.map((i) => `${i.category}:${i.name}`));
            const added: PackingItem[] = items
              .filter((item) => !existing.has(`${item.category}:${item.name}`))
              .map((item) => ({ id: crypto.randomUUID(), ...item, packed: false }));
            return { ...trip, packing: [...trip.packing, ...added] };
          }),
        }));
      },

      togglePackingItem: (tripId, itemId) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => ({
            ...trip,
            packing: trip.packing.map((i) =>
              i.id === itemId ? { ...i, packed: !i.packed } : i
            ),
          })),
        }));
      },

      deletePackingItem: (tripId, itemId) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => ({
            ...trip,
            packing: trip.packing.filter((i) => i.id !== itemId),
          })),
        }));
      },

      addExpense: (tripId, expense) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => ({
            ...trip,
            expenses: [{ ...expense, id: crypto.randomUUID() }, ...trip.expenses],
          })),
        }));
      },

      deleteExpense: (tripId, expenseId) => {
        set((state) => ({
          trips: updateTrip(state.trips, tripId, (trip) => ({
            ...trip,
            expenses: trip.expenses.filter((e) => e.id !== expenseId),
          })),
        }));
      },
    }),
    {
      name: 'travel-trips',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
