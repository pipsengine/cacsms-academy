import { OrderBook } from './types';

export const calculateImbalance = (book: OrderBook[]): number => {
  const bids = book.reduce((sum, level) => sum + level.bid, 0);
  const asks = book.reduce((sum, level) => sum + level.ask, 0);
  if (bids + asks === 0) return 0;
  return (bids - asks) / (bids + asks);
};
