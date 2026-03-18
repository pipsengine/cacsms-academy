-- Migration 0002_dashboard_intelligence: alert persistence and user preferences

CREATE TABLE "AlertEvent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT,
  "fingerprint" TEXT NOT NULL UNIQUE,
  "alertType" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'info',
  "pair" TEXT,
  "timeframe" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "source" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AlertEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX "AlertEvent_createdAt_idx" ON "AlertEvent" ("createdAt");
CREATE INDEX "AlertEvent_userId_createdAt_idx" ON "AlertEvent" ("userId", "createdAt");
CREATE INDEX "AlertEvent_alertType_createdAt_idx" ON "AlertEvent" ("alertType", "createdAt");

CREATE TABLE "UserPreference" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL UNIQUE,
  "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
  "pushAlerts" BOOLEAN NOT NULL DEFAULT false,
  "telegramAlerts" BOOLEAN NOT NULL DEFAULT true,
  "soundAlerts" BOOLEAN NOT NULL DEFAULT true,
  "riskPerTrade" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "defaultTimeframe" TEXT NOT NULL DEFAULT 'H1',
  "minProbability" INTEGER NOT NULL DEFAULT 75,
  "autoScan" BOOLEAN NOT NULL DEFAULT true,
  "pairMajors" BOOLEAN NOT NULL DEFAULT true,
  "pairCrosses" BOOLEAN NOT NULL DEFAULT true,
  "pairExotics" BOOLEAN NOT NULL DEFAULT false,
  "pairCrypto" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);
