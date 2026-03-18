import { getPricingDetailFromMatrix, planOrder, type BillingCycle, type PlanType, type PricingMatrix, type Region } from '@/lib/pricing/catalog';
import { getBillingPrice } from '@/lib/pricing/store';

export type UpgradeCharge = {
  currentPlan: PlanType | null;
  targetPlan: PlanType;
  chargeAmount: number;
  chargeAmountCents: number;
  isUpgrade: boolean;
};

export type CurrentSubscriptionLike = {
  planType: string;
  billingCycle?: string | null;
  expiryDate: Date;
};

export function getPlanRank(plan: PlanType) {
  return planOrder.indexOf(plan);
}

export function isPlanType(value: unknown): value is PlanType {
  return typeof value === 'string' && planOrder.includes(value as PlanType);
}

export function getSubscriptionExpiryDate(
  billingCycle: BillingCycle,
  currentSubscription?: CurrentSubscriptionLike | null
) {
  if (currentSubscription && currentSubscription.planType !== 'Scout' && currentSubscription.expiryDate > new Date()) {
    return currentSubscription.expiryDate;
  }

  const days = billingCycle === 'annual' ? 365 : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function calculateUpgradeCharge(params: {
  pricingMatrix: PricingMatrix;
  region: Region;
  targetPlan: PlanType;
  billingCycle: BillingCycle;
  currentSubscription?: CurrentSubscriptionLike | null;
}): UpgradeCharge {
  const { pricingMatrix, region, targetPlan, billingCycle, currentSubscription } = params;
  const targetPricing = getPricingDetailFromMatrix(pricingMatrix, targetPlan, region);
  const targetBilling = getBillingPrice(targetPricing, billingCycle);

  if (!currentSubscription || !isPlanType(currentSubscription.planType) || currentSubscription.planType === 'Scout') {
    return {
      currentPlan: currentSubscription && isPlanType(currentSubscription.planType) ? currentSubscription.planType : null,
      targetPlan,
      chargeAmount: targetBilling.priceValue,
      chargeAmountCents: targetBilling.unitAmountCents,
      isUpgrade: false,
    };
  }

  const currentPlan = currentSubscription.planType;
  const currentRank = getPlanRank(currentPlan);
  const targetRank = getPlanRank(targetPlan);

  if (targetRank < currentRank) {
    throw new Error('Downgrades are not available through checkout. Please contact support or an administrator.');
  }

  if (targetRank === currentRank) {
    throw new Error('You are already on this subscription tier.');
  }

  if (currentSubscription.billingCycle !== billingCycle) {
    throw new Error('Upgrade billing cycle must match your current subscription cycle.');
  }

  const currentPricing = getPricingDetailFromMatrix(pricingMatrix, currentPlan, region);
  const currentBilling = getBillingPrice(currentPricing, billingCycle);
  const chargeAmountCents = Math.max(0, targetBilling.unitAmountCents - currentBilling.unitAmountCents);
  const chargeAmount = Math.max(0, targetBilling.priceValue - currentBilling.priceValue);

  return {
    currentPlan,
    targetPlan,
    chargeAmount,
    chargeAmountCents,
    isUpgrade: true,
  };
}
