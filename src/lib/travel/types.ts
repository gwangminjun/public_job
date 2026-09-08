export type PlaceCategory = 'sight' | 'food' | 'stay' | 'transport' | 'etc';

export const PLACE_CATEGORIES: Record<PlaceCategory, { label: string; emoji: string }> = {
  sight: { label: '관광', emoji: '📍' },
  food: { label: '맛집', emoji: '🍜' },
  stay: { label: '숙소', emoji: '🏨' },
  transport: { label: '이동', emoji: '🚆' },
  etc: { label: '기타', emoji: '⭐' },
};

export interface TravelPlace {
  id: string;
  name: string;
  /** YYYY-MM-DD — 어느 날짜의 일정인지 */
  date: string;
  category: PlaceCategory;
  memo?: string;
  lat?: number;
  lng?: number;
}

export type ExpenseCategory = 'transport' | 'stay' | 'food' | 'activity' | 'shopping' | 'etc';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; emoji: string }> = {
  transport: { label: '교통', emoji: '🚆' },
  stay: { label: '숙박', emoji: '🏨' },
  food: { label: '식비', emoji: '🍜' },
  activity: { label: '액티비티', emoji: '🎟️' },
  shopping: { label: '쇼핑', emoji: '🛍️' },
  etc: { label: '기타', emoji: '💳' },
};

export interface TravelExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  emoji: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  places: TravelPlace[];
  packing: PackingItem[];
  expenses: TravelExpense[];
  createdAt: string;
}
