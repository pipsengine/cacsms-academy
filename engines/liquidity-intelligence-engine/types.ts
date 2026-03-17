export interface OrderBook {
  level: number;
  bid: number;
  ask: number;
}

export interface LiquidityZone {
  level: number;
  concentration: number;
  imbalance: number;
}
