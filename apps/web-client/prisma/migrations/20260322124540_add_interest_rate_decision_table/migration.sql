-- CreateTable
CREATE TABLE "InterestRateDecision" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "decisionTimestamp" TIMESTAMP(3) NOT NULL,
    "changeBps" INTEGER NOT NULL,
    "previousRate" DOUBLE PRECISION,
    "forecastRate" DOUBLE PRECISION,
    "policyDirection" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterestRateDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterestRateDecision_currency_decisionTimestamp_idx" ON "InterestRateDecision"("currency", "decisionTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "InterestRateDecision_currency_date_key" ON "InterestRateDecision"("currency", "date");
