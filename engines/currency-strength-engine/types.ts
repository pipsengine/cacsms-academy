export interface CurrencyTick {
  timestamp: string;
  pair: string;
  price: number;
}

export interface StrengthScore {
  currency: string;
  strength: number;
  rank: number;
}
