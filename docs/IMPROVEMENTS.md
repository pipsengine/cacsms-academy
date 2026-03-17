## 1. Overview of Strategic Improvements

| Area | Current State | Desired Upgrade |
| --- | --- | --- |
| Landing & Routing | `/` renders dashboard layout (`apps/web-client/src/app/page.tsx`). | Root should show landing experience, dashboard locked behind authentication (`Apps/web-client/src/app/landing`). |
| Usage Limits | In-memory `UsageStore` and `usageDb` (`apps/web-client/src/lib/usage/store.ts`, `apps/web-client/src/app/api/usage/check/route.ts`). | Persist usage logs, limits, and flag via Prisma; compute history without unbounded memory; expose admin control and telemetry. |
| Analytics | `apps/web-client/src/app/api/admin/analytics/route.ts` reads in-memory logs. | Aggregate via Prisma using grouping/counts; cache or precompute to avoid repeated heavy reads. |
| Market Data & Dashboard | Components rely on mock socket data (`apps/web-client/server.ts`, `MarketDataProvider`). | Hardening connection (reconnect, stale detection), provide health metadata, fallback messaging when feed down. Dashboard should clearly show plan/usage status, limit warnings, and feed health. |
| Gating (UsageLimiter, AccessControl) | UI gate but no server feed; per-feature throttle tracked via `usage/check`. | Flow from server should drive gating (e.g., nextAction/resume timestamps, remaining quota) and show plan/backoff info. |
| AI Assistant | `apps/web-client/src/app/api/chat/route.ts` posts to Gemini with no streaming or context. | Introduce streaming/response caching, include user context metadata, throttle usage, handle fallback when API down. |
| Pricing & Checkout | Pricing is static cards, Stripe session per request (`apps/.../checkout`). | Serve plan catalog from DB/config, route user to checkout with metadata, add webhook handler to sync `Subscription` rows. |
| Testing & Reliability | No automated tests currently. | Add targeted tests for auth, usage gating, pricing flows, landing routing, and API responses. |

## 2. Execution Strategy

1. **Persistence & Config**: Schema changes were introduced already (new models for `UsageLog` and `PlatformSetting`). The next focus is turning usage/analytics APIs over to these models and ensuring admin toggles persist.
2. **Dashboard/Data Health**: Strengthen the MarketDataProvider to expose `isConnected`, `lastUpdate` timestamps, and a health verdict. Use this metadata inside dashboard cards for clarity.
3. **AI & Pricing**: Capture user plan in chat requests, shift pricing to a dynamic catalog (e.g., `pricingPlans` table or JSON file), and add webhook handling for Stripe events.
4. **Automated Tests**: Begin with API route tests for `/api/usage/check`, `pricing`, and `/api/auth`, plus a simple E2E verifying landing route. Use Jest/Playwright to simulate key flows.

## 3. Next Deliverables

Each subsequent change will reference this document and confirm tasks with the user before committing the next batch of code.
