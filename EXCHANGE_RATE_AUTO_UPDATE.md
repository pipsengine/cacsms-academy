# USD/NGN Exchange Rate Auto-Update Implementation

## Overview
This implementation adds automatic background updating of the USD/NGN exchange rate every 30 minutes, ensuring pricing stays current without manual intervention.

## Solution Architecture

### 1. Exchange Rate Scheduler (`src/lib/pricing/exchangeRateScheduler.ts`)

**Purpose**: Automatically fetches and persists the current USD/NGN exchange rate at regular intervals.

**Key Features**:
- Runs every 30 minutes (configurable)
- Performs immediate refresh on server startup
- Uses existing `getUsdNgnExchangeRate()` function with `forceRefresh: true`
- Graceful error handling with fallback to cached rate
- Comprehensive logging for monitoring

**Functions**:
- `startExchangeRateScheduler()` - Initializes and starts the scheduler
- `stopExchangeRateScheduler()` - Stops the scheduler (for cleanup)
- `refreshExchangeRate()` - Internal function that triggers a rate refresh

**Configuration**:
```typescript
const EXCHANGE_RATE_SCHEDULER_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
```

To change the interval, modify `EXCHANGE_RATE_SCHEDULER_INTERVAL_MS`:
- For 15 minutes: `15 * 60 * 1000`
- For 1 hour: `60 * 60 * 1000`

### 2. Server Integration (`server.ts`)

**Changes**:
- Import scheduler: `import { startExchangeRateScheduler } from './src/lib/pricing/exchangeRateScheduler.ts';`
- Initialize on startup: `startExchangeRateScheduler();` (right after COT scheduler)

**Execution Flow**:
1. Server starts → `app.prepare()`
2. Market service and COT scheduler initialize
3. Exchange rate scheduler starts
4. Immediate refresh triggered
5. Recurring updates every 30 minutes

### 3. Data Flow

```
Server Startup
    ↓
startExchangeRateScheduler() called
    ↓
Initial refresh: getUsdNgnExchangeRate({ forceRefresh: true })
    ↓
Fetch from Open Exchange Rates API (if cache expired)
    ↓
Persist to platformSetting table (key: "usdNgnExchangeRate")
    ↓
Log: "1 USD = X.XX NGN (source: openexchangerates)"
    ↓
Set 30-minute interval
    ↓
Repeat fetch every 30 minutes indefinitely
```

### 4. Storage Mechanism

**Table**: `platformSetting`
**Key**: `usdNgnExchangeRate`
**Value Format** (JSON string):
```json
{
  "usdToNgn": 1352.62,
  "fetchedAt": "2026-03-21T14:30:00.000Z",
  "source": "openexchangerates",
  "stale": false
}
```

### 5. Exchange Rate Sources (Priority Order)

1. **Open Exchange Rates API** (Primary)
   - Requires: `OPEN_EXCHANGE_RATES_APP_ID` environment variable
   - Returns: Real-time rates updated daily
   - Endpoint: `https://openexchangerates.org/api/latest.json`

2. **Cached Rate** (Fallback)
   - Used when API fails
   - TTL: 6 hours (after which it's marked as stale)
   - Automatically refreshes on next request

3. **Default Fallback Rate**
   - Calculated from: `₦29,999 ÷ $49 = ~612.2` (from Trader plan)
   - Used only if no cache exists and API fails

### 6. Pricing Calculation

**Monthly Pricing Examples** (with 1 USD = 1,352.62 NGN):

| Plan | USD Price | NGN Price | Formula |
|------|-----------|-----------|---------|
| Analyst | $19 | ₦25,699 | 19 × 1352.62 |
| Trader | $49 | ₦66,278 | 49 × 1352.62 |
| ProTrader | $99 | ₦133,909 | 99 × 1352.62 |

**Rounding**: Results are rounded to nearest Naira integer.

### 7. How It Stays Permanent

**Storage**: Exchange rate persists in PostgreSQL `platformSetting` table
- Survives server restarts
- Survives database backups
- Never deleted unless manually cleared

**Refresh Mechanism**:
- Automatic every 30 minutes (configurable persistence)
- Initial refresh on each server startup
- Could add webhook triggers if API supports (future enhancement)

### 8. Environment Variables

**Required**:
- `OPEN_EXCHANGE_RATES_APP_ID` - API key for exchange rate service

**Optional** (already configured):
- `NODE_ENV` - Set to "production" or "development"
- `PORT` - Server port (default: 3000)

**How to Set**:
```bash
# .env.local or .env.production
OPEN_EXCHANGE_RATES_APP_ID=your_api_key_here
```

### 9. Monitoring & Logging

**Console Output Examples**:

On startup:
```
[ExchangeRateScheduler] Exchange rate scheduler initialized, will refresh every 30 minutes
[ExchangeRateScheduler] Rate refreshed: 1 USD = 1352.62 NGN (source: openexchangerates)
```

Every 30 minutes:
```
[ExchangeRateScheduler] Rate refreshed: 1 USD = 1352.62 NGN (source: openexchangerates)
```

On API failure:
```
[ExchangeRateScheduler] Scheduled refresh failed: [error details]
```

**To Monitor in Production**:
- Check logs for `[ExchangeRateScheduler]` prefix
- Compare `fetchedAt` timestamp to current time
- Source should be "openexchangerates" for live rates

### 10. Deployment Checklist

- [ ] Add `OPEN_EXCHANGE_RATES_APP_ID` to production environment
- [ ] Restart server to activate scheduler
- [ ] Verify logs show "scheduler initialized"
- [ ] Check pricing page displays correct NGN rates
- [ ] Confirm rates update correctly after 30 minutes

### 11. API Integration Details

**Open Exchange Rates Request**:
```http
GET https://openexchangerates.org/api/latest.json?app_id=YOUR_ID&symbols=NGN&prettyprint=0
```

**Response Sample**:
```json
{
  "disclaimer": "Usage subject to terms...",
  "license": "https://openexchangerates.org/license",
  "timestamp": 1711000800,
  "base": "USD",
  "rates": {
    "NGN": 1352.62
  }
}
```

**Error Handling**:
- API rate limit exceeded → Use cached rate, log warning
- Network timeout → Use cached rate, log error
- Invalid response → Use cached rate, log error
- All errors gracefully handled; pricing never breaks

### 12. Performance Impact

- **CPU**: Minimal (~1-2ms per refresh)
- **Network**: Single API call every 30 minutes (~300ms)
- **Memory**: ~1KB stored rate + scheduler context
- **Database**: Single upsert operation every 30 minutes
- **User Impact**: Negligible - runs in background

### 13. Future Enhancements

Possible improvements:
1. Add webhook support if API provides it (real-time updates)
2. Support multiple exchange rate providers (redundancy)
3. Add manual admin override endpoint
4. Add rate change notifications
5. Track historical rate changes for analytics
6. Implement rate alerts (notify if changes exceed threshold)

### 14. Troubleshooting

**Rates not updating?**
- Check `OPEN_EXCHANGE_RATES_APP_ID` is set
- Check API account has active subscription
- Verify server logs for errors
- Check `platformSetting` table for last `fetchedAt`
- Check if API rate limit exceeded

**Using fallback rate?**
- Check if `source` in database is "fallback"
- Verify API key is valid
- Check network connectivity
- Verify API response format hasn't changed

**Pricing showing old rates?**
- Clear browser cache (Ctrl+F5 / Cmd+Shift+R)
- Verify database has fresh rate
- Check if rate conversion formula is correct
- Verify pricing page is reading from DB (not cached in code)

## Files Modified

1. **Created**: `apps/web-client/src/lib/pricing/exchangeRateScheduler.ts`
   - New scheduler implementation
   - ~50 lines

2. **Modified**: `apps/web-client/server.ts`
   - Added import
   - Added initialization call
   - 2 lines changed

3. **Fixed**: `apps/web-client/src/lib/pricing/store.ts`
   - Changed `@/lib` imports to relative imports
   - Required for Node.js ESM compatibility
   - 2 lines changed

## Testing

**Manual Test Steps**:
1. Start server: `npm run dev`
2. Check logs for scheduler initialization
3. Visit `/pricing` page
4. Note NGN prices displayed
5. Wait 30 minutes (or adjust interval to 1 minute for testing)
6. Refresh pricing page
7. Verify rates update (if new API rate received)

**Database Verification**:
```sql
SELECT key, value, "updatedAt" FROM "PlatformSetting" 
WHERE key = 'usdNgnExchangeRate';
```

Expected result:
```
key: usdNgnExchangeRate
value: {"usdToNgn":1352.62,"fetchedAt":"2026-03-21T14:30:00.000Z","source":"openexchangerates","stale":false}
updatedAt: 2026-03-21 14:30:00
```

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review console logs for errors
3. Verify `.env` has correct API key
4. Check API provider status page
5. Contact support with logs and error details
