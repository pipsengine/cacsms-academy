export interface PricePoint {
  timestamp: string;
  price: number;
}

export interface Channel {
  support: number;
  resistance: number;
  slope: number;
  validity: number;
}
