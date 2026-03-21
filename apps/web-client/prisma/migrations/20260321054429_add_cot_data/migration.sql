-- CreateTable
CREATE TABLE "CotData" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "asset" TEXT NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "short" DOUBLE PRECISION NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "zScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentile" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "velocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "acceleration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trend" TEXT NOT NULL,
    "extreme" BOOLEAN NOT NULL DEFAULT false,
    "phase" TEXT NOT NULL,
    "signal" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "risk" TEXT NOT NULL,
    "weeklyBias" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CotData_asset_date_idx" ON "CotData"("asset", "date" DESC);

-- CreateIndex
CREATE INDEX "CotData_date_idx" ON "CotData"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CotData_asset_date_key" ON "CotData"("asset", "date");
