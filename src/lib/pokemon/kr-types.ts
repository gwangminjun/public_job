export interface KrVersionInfo {
  number: string;
  prodNumber: string;
  prodCode: string;
  prodSymbolURL: string;
  prodName: string;
  artist: string;
  rarity: string;
  cardImgURL: string;
  cardPageURL: string;
  regu: string;
  debug: string;
}

export interface KrAttack {
  name: string;
  cost: string;
  damage: string;
  text: string;
}

export interface KrAbility {
  name: string;
  text: string;
  type?: string;
}

export interface KrCard {
  id: string;
  cardID: string;
  name: string;
  supertype: string;
  subtypes: string[];
  rules: string[];
  hp: number | null;
  type: string;
  attacks: KrAttack[];
  abilities: KrAbility[];
  weakness: { type: string; value: string };
  resistance: { type: string; value: string };
  retreatCost: number;
  flavorText: string;
  regulationMark: string[];
  pokemons: Array<{ name: string; pokedexNumber: number }>;
  version_infos: KrVersionInfo[];
  // DB row에서 읽을 때 병합되는 필드
  _versionInfo?: KrVersionInfo;
  _dbId?: string;          // DB primary key (prodCode-number[-idx])
}

export interface KrSet {
  id: string;
  name: string;
  series: string;
  type: string;
  releaseDate: string | null;
  total: number | null;
  regulation: string | null;
  symbolUrl: string | null;
  coverImgUrl: string | null;
}

export interface KrCardSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}

export interface KrSetSearchParams {
  q?: string;
  series?: string;
  type?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface ApiSingleResponse<T> {
  data: T;
}

// 한국판 타입 색상 맵 — "(풀)" 형식
export const KR_TYPE_COLORS: Record<string, string> = {
  '(풀)':    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  '(불꽃)':  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  '(물)':    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  '(번개)':  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  '(초능력)':'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  '(격투)':  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  '(악)':    'bg-gray-800 text-gray-100 dark:bg-gray-900 dark:text-gray-200',
  '(강철)':  'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  '(용)':    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  '(무색)':  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  '(페어리)':'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

export const KR_SERIES_ORDER = ['SV', 'S', 'SM', 'XY', 'BW', 'DP'] as const;
