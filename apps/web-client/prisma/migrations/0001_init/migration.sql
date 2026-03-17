-- Migration 0001_init: initial schema for Intel Trader
-- Run `prisma migrate deploy` to apply.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  "image" TEXT,
  "passwordHash" TEXT,
  "country" TEXT NOT NULL DEFAULT 'International',
  "role" TEXT NOT NULL DEFAULT 'User',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "Account" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
  UNIQUE ("provider", "providerAccountId")
);

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMPTZ NOT NULL,
  UNIQUE ("identifier", "token")
);

CREATE TABLE "Subscription" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "planType" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "startDate" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "expiryDate" TIMESTAMPTZ NOT NULL,
  "paymentProvider" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX "Subscription_userId_status_idx" ON "Subscription" ("userId", "status");

CREATE TABLE "UsageLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "featureName" TEXT NOT NULL,
  "usageType" TEXT NOT NULL DEFAULT 'request',
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "UsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX "UsageLog_user_feature_ts_idx" ON "UsageLog" ("userId", "featureName", "timestamp");

CREATE TABLE "PlatformSetting" (
  "key" TEXT PRIMARY KEY,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "UsageLimit" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "planName" TEXT NOT NULL,
  "featureName" TEXT NOT NULL,
  "hourlyLimit" TEXT NOT NULL,
  "dailyLimit" TEXT NOT NULL,
  UNIQUE ("planName", "featureName")
);
