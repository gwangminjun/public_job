export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  updatedAt: string;
  images: { symbol: string; logo: string };
  legalities: { standard?: string; expanded?: string; unlimited?: string };
}

export interface PriceDetail {
  low: number;
  mid: number;
  high: number;
  market: number;
  directLow?: number;
}

export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  rarity?: string;
  number: string;
  artist?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  set: PokemonSet;
  images: { small: string; large: string };
  legalities: { standard?: string; expanded?: string; unlimited?: string };
  abilities?: Array<{ name: string; text: string; type: string }>;
  attacks?: Array<{
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
  }>;
  weaknesses?: Array<{ type: string; value: string }>;
  resistances?: Array<{ type: string; value: string }>;
  retreatCost?: string[];
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices: {
      normal?: PriceDetail;
      holofoil?: PriceDetail;
      reverseHolofoil?: PriceDetail;
      '1stEditionHolofoil'?: PriceDetail;
      '1stEditionNormal'?: PriceDetail;
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
    };
  };
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

export interface CardSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}

export interface SetSearchParams {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}

export interface CardFilterState {
  keyword: string;
  types: string[];
  subtypes: string[];
  rarity: string;
  hpMin: string;
  hpMax: string;
  orderBy: string;
  page: number;
}
