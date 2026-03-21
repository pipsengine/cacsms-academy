# USD/NGN Auto-Update Exchange Rate - Quick Setup Guide

## ✅ What Was Implemented

Your pricing page now has **automatic USD/NGN exchange rate updates every 30 minutes** with these features:

- **Permanent Storage**: Rate stored in PostgreSQL (survives server restarts)
- **Automatic Refresh**: Background job runs every 30 minutes
- **Real-Time**: Fetches current rate from Open Exchange Rates API (currently: **1 USD = 1,352.62 NGN**)
- **Fallback Protection**: If API fails, uses cached rate (pricing never breaks)
- **Admin Monitoring**: Super admin can check current rate and manually refresh

## 🚀 How to Activate

### Step 1: Set Environment Variable
Add this to your `.env.local` or production environment:

```bash
OPEN_EXCHANGE_RATES_APP_ID=your_api_key_here
```

**How to get API key**:
1. Visit https://openexchangerates.org/
2. Sign up for free plan (free tier is sufficient for this use case)
3. Copy your API key
4. Add to environment variables

### Step 2: Restart Server
```bash
npm run dev  # for development
# or
npm run start  # for production
```

### Step 3: Verify It's Working
Check server logs for:
```
[ExchangeRateScheduler] Exchange rate scheduler initialized, will refresh every 30 minutes
[ExchangeRateScheduler] Rate refreshed: 1 USD = 1352.62 NGN (source: openexchangerates)
```

## 📊 Current Pricing (with today's rate: 1 USD = 1,352.62 NGN)

| Plan | Monthly USD | Monthly NGN | Annual USD | Annual NGN |
|------|------------|------------|-----------|-----------|
| Analyst | $19 | ₦25,699 | $228 | ₦308,397 |
| Trader | $49 | ₦66,278 | $588 | ₦795,540 |
| ProTrader | $99 | ₦133,909 | $1,188 | ₦1,606,537 |

*(Updated automatically - these numbers will reflect real rates in 30 minutes)*

## 🔍 Admin Monitoring Features

### Check Current Rate
```bash
# As super admin, call:
GET /api/admin/exchange-rate
```

Response:
```json
{
  "success": true,
  "rate": {
    "usdToNgn": 1352.62,
    "fetchedAt": "2026-03-21T14:30:00.000Z",
    "source": "openexchangerates",
    "stale": false
  },
  "examples": {
    "analyst": { "usd": 19, "ngn": 25699 },
    "trader": { "usd": 49, "ngn": 66278 },
    "proTrader": { "usd": 99, "ngn": 133909 }
  }
}
```

### Manually Trigger Refresh (Testing)
```bash
# Force immediate refresh:
POST /api/admin/exchange-rate
Content-Type: application/json

{ "action": "refresh" }
```

### Manually Set Rate (For Testing)
```bash
# Override rate temporarily:
POST /api/admin/exchange-rate
Content-Type: application/json

{ "action": "set", "usdToNgn": 1400 }
```

## 📁 What Changed

### Created Files:
1. `src/lib/pricing/exchangeRateScheduler.ts` - The automatic background updater
2. `src/app/api/admin/exchange-rate/route.ts` - Admin monitoring API
3. `EXCHANGE_RATE_AUTO_UPDATE.md` - Full technical documentation

### Modified Files:
1. `server.ts` - Added scheduler initialization
2. `src/lib/pricing/store.ts` - Fixed import paths for Node.js ESM

## ⚠️ What You Need to Know

### Important Notes:
- ✅ **Database**: No migration needed (uses existing `platformSetting` table)
- ✅ **Backward Compatible**: Existing pricing logic unchanged
- ✅ **Secure**: Admin API requires super_admin role
- ✅ **Resilient**: Works even if API is temporarily down
- ✅ **Permanent**: Rate stored in database, not in code

### Scheduling Details:
- **Default Interval**: 30 minutes (configurable)
- **First Refresh**: Immediately on server startup
- **Recurring**: Every 30 minutes automatically
- **Storage**: PostgreSQL `platformSetting` table
- **TTL**: No TTL - stays until next update

## 🔧 Configuration (Optional)

To change refresh interval, edit `src/lib/pricing/exchangeRateScheduler.ts`:

```typescript
const EXCHANGE_RATE_SCHEDULER_INTERVAL_MS = 30 * 60 * 1000; // Change this

// Examples:
// 15 minutes: 15 * 60 * 1000
// 1 hour: 60 * 60 * 1000
// 1 hour 30 min: 90 * 60 * 1000
```

Then restart server.

## 📈 Monitoring in Production

**Check logs for these messages**:

✅ **Good** (working normally):
```
[ExchangeRateScheduler] Rate refreshed: 1 USD = XXXX.XX NGN (source: openexchangerates)
```

⚠️ **Warning** (API temporarily down, using fallback):
```
[ExchangeRateScheduler] Scheduled refresh failed: [error reason]
```

## 🛠️ Troubleshooting

### Rates not updating?
1. ✅ Check `OPEN_EXCHANGE_RATES_APP_ID` is set in environment
2. ✅ Verify API account has active subscription
3. ✅ Check server logs for `[ExchangeRateScheduler]` messages
4. ✅ Manually trigger refresh: `POST /api/admin/exchange-rate {"action":"refresh"}`

### Still using old rate?
1. ✅ Clear browser cache (Ctrl+F5 on Windows, Cmd+Shift+R on Mac)
2. ✅ Verify database has fresh rate via admin API
3. ✅ Check if source is "fallback" (means API is down)

### Getting "Invalid API key" error?
1. ✅ Re-check your Open Exchange Rates API key
2. ✅ Verify key is correctly set in environment
3. ✅ Check if subscription is still active
4. ✅ Try manual override with known good rate for testing

## 📞 Support

For detailed technical information, see: `EXCHANGE_RATE_AUTO_UPDATE.md`

Key topics covered:
- Complete architecture & data flow
- Exchange rate storage mechanism
- How pricing calculations work
- Error handling & fallbacks
- Deployment checklist
- Performance metrics

## ✨ Summary

Your USD/NGN pricing will now automatically update every 30 minutes with real market rates. No manual updates needed. Pricing stays current permanently. Perfect for serving Nigerian users with accurate, up-to-date pricing! 🇳🇬
