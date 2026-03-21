import { getUsdNgnExchangeRate } from './store.ts';

const EXCHANGE_RATE_SCHEDULER_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
let schedulerInterval: NodeJS.Timeout | null = null;

async function refreshExchangeRate() {
  try {
    const rate = await getUsdNgnExchangeRate({ forceRefresh: true });
    console.log(
      `[ExchangeRateScheduler] Rate refreshed: 1 USD = ${rate.usdToNgn.toFixed(2)} NGN (source: ${rate.source})`
    );
    return rate;
  } catch (error) {
    console.error('[ExchangeRateScheduler] Failed to refresh exchange rate:', error);
    throw error;
  }
}

export function startExchangeRateScheduler() {
  if (schedulerInterval !== null) {
    console.warn('[ExchangeRateScheduler] Scheduler already running, skipping initialization');
    return;
  }

  console.log('[ExchangeRateScheduler] Exchange rate scheduler initialized, will refresh every 30 minutes');

  // Perform initial refresh on startup
  void refreshExchangeRate().catch((error) => {
    console.error('[ExchangeRateScheduler] Initial refresh failed:', error);
  });

  // Schedule recurring updates
  schedulerInterval = setInterval(() => {
    void refreshExchangeRate().catch((error) => {
      console.error('[ExchangeRateScheduler] Scheduled refresh failed:', error);
    });
  }, EXCHANGE_RATE_SCHEDULER_INTERVAL_MS);

  // Ensure the interval doesn't prevent process from exiting (if needed)
  if (schedulerInterval.unref) {
    schedulerInterval.unref();
  }
}

export function stopExchangeRateScheduler() {
  if (schedulerInterval !== null) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[ExchangeRateScheduler] Scheduler stopped');
  }
}
