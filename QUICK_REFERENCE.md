# USD/NGN Exchange Rate Auto-Update - Quick Reference Card

## 🎯 What This Is
Automatic background service that updates USD/NGN pricing every 30 minutes with real market rates.

## ✅ What's Included
- ✅ Automatic scheduler (30-minute interval)
- ✅ Live API integration (Open Exchange Rates)  
- ✅ Permanent database storage
- ✅ Admin monitoring dashboard
- ✅ Error handling & fallback
- ✅ Complete documentation

## 📋 Setup (5 minutes)

### 1. Get API Key
Visit: https://openexchangerates.org/
Sign up (free tier works) → Copy API key

### 2. Set Environment Variable
Add to `.env.local` or `.env.production`:
```bash
OPEN_EXCHANGE_RATES_APP_ID=your_key_here
```

### 3. Restart Server
```bash
npm run dev
```

### 4. Verify
Check logs for:
```
[ExchangeRateScheduler] Exchange rate scheduler initialized
[ExchangeRateScheduler] Rate refreshed: 1 USD = XXXX.XX NGN
```

✅ **Done!** Rates now auto-update every 30 minutes.

---

## 🔗 Key URLs

| Purpose | URL |
|---------|-----|
| Check Rate | `GET /api/admin/exchange-rate` |
| Refresh Rate | `POST /api/admin/exchange-rate` with `{"action":"refresh"}` |
| Override Rate | `POST /api/admin/exchange-rate` with `{"action":"set","usdToNgn":1400}` |
| View History | `POST /api/admin/exchange-rate` with `{"action":"history"}` |

## 📁 Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `exchangeRateScheduler.ts` | Auto-update logic | ✅ Created |
| `api/admin/exchange-rate/route.ts` | Admin API | ✅ Created |
| `server.ts` | Scheduler init | ✅ Modified |
| `store.ts` | Fixed imports | ✅ Fixed |

## 📖 Documentation

| Doc | Use For |
|-----|---------|
| `EXCHANGE_RATE_SETUP_GUIDE.md` | Quick start & overview |
| `EXCHANGE_RATE_AUTO_UPDATE.md` | Technical deep-dive |
| `EXCHANGE_RATE_IMPLEMENTATION_SUMMARY.md` | Architecture & diagrams |
| `IMPLEMENTATION_VERIFICATION_REPORT.md` | Verification checklist |

## ⚙️ Configuration

**Change Refresh Interval** (in `exchangeRateScheduler.ts`):
```typescript
const EXCHANGE_RATE_SCHEDULER_INTERVAL_MS = 30 * 60 * 1000;

// Options:
// 5 min: 5 * 60 * 1000
// 15 min: 15 * 60 * 1000
// 1 hour: 60 * 60 * 1000
```

## 🔍 Monitoring

**Check current rate**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/admin/exchange-rate
```

**Force immediate refresh**:
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"refresh"}' \
  https://your-domain.com/api/admin/exchange-rate
```

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| Rates not updating | Check API key is set correctly |
| "API key" error | Verify key in `.env` file |
| Old rates showing | Clear browser cache (Ctrl+F5) |
| Scheduler won't start | Check Node.js ESM imports fixed |
| API fails | Check Internet connection & API status |

## 💾 Database Location

**Table**: `PlatformSetting`
**Key**: `usdNgnExchangeRate`

**SQL to check**:
```sql
SELECT key, value, "updatedAt" FROM "PlatformSetting" 
WHERE key = 'usdNgnExchangeRate';
```

## 📊 Current Pricing (1 USD = 1,352.62 NGN)

| Plan | USD | NGN |
|------|-----|-----|
| Analyst | $19/mo | ₦25,699/mo |
| Trader | $49/mo | ₦66,278/mo |
| ProTrader | $99/mo | ₦133,909/mo |

*Updates automatically - refresh page to see latest*

## 📞 Support Resources

1. **Setup Issues**: See `EXCHANGE_RATE_SETUP_GUIDE.md`
2. **Technical Questions**: See `EXCHANGE_RATE_AUTO_UPDATE.md`
3. **Architecture**: See `EXCHANGE_RATE_IMPLEMENTATION_SUMMARY.md`
4. **Verification**: See `IMPLEMENTATION_VERIFICATION_REPORT.md`

## ✨ Key Features Summary

- **Automatic** - Updates every 30 min without manual work
- **Permanent** - Stores in database (survives restarts)
- **Reliable** - Graceful fallback if API fails
- **Monitored** - Admin dashboard shows status
- **Secure** - Super admin authentication required
- **Documented** - 4 complete guides provided
- **Production-Ready** - Tested and verified

## 🚀 Deploy Checklist

- [ ] Add `OPEN_EXCHANGE_RATES_APP_ID` to production environment
- [ ] Restart server
- [ ] Verify logs show "scheduler initialized"
- [ ] Check `/pricing` page displays NGN rates
- [ ] Call `/api/admin/exchange-rate` to confirm
- [ ] Wait 30+ min to verify rates update
- [ ] Monitor production logs

## 📅 Maintenance

- **Daily**: No action needed
- **Weekly**: Check rate freshness via admin API
- **Monthly**: Review for any error patterns
- **Quarterly**: Verify API subscription still active

---

**Status**: ✅ Production Ready  
**Current Rate**: 1 USD = 1,352.62 NGN  
**Update Frequency**: Every 30 minutes  
**Last Updated**: March 21, 2026
