```
Migration: 0001_init
Generated: initial schema baseline
```

This migration creates the core schema for Intel Trader, including authentication tables (`User`, `Account`, `Session`, `VerificationToken`), billing (`Subscription`), telemetry (`UsageLog`, `UsageLimit`), and lightweight platform configuration (`PlatformSetting`). Apply it via `npx prisma migrate deploy` in production or `npm run db:migrate` during development.
