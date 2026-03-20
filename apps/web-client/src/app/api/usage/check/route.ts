import { NextResponse } from "next/server";
import { usageDb } from "@/lib/usage/store";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextAuthOptions";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { featureName, action = "check" } = await request.json();

    const limitsEnabled = await usageDb.getLimitsEnabled();
    if (!limitsEnabled) {
      if (action === "consume") {
        await usageDb.logUsage(userId, featureName);
      }
      return NextResponse.json({ allowed: true });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "Super Admin" || user.role === "Administrator") {
      if (action === "consume") {
        await usageDb.logUsage(userId, featureName);
      }
      return NextResponse.json({ allowed: true });
    }

    const sub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "Active" },
      orderBy: { startDate: "desc" },
    });
    // Map old plan names to new ones for backward compatibility
    let planName: string = "Scout";
    if (sub?.planType === "Professional") planName = "Trader";
    else if (sub?.planType === "Premium") planName = "ProTrader";
    else if (sub?.planType) planName = sub.planType;

    const limit = await usageDb.findLimit(planName, featureName);

    if (!limit) {
      if (action === "consume") {
        await usageDb.logUsage(userId, featureName);
      }
      return NextResponse.json({ allowed: true });
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyUsage = await usageDb.getUsageCount(
      userId,
      featureName,
      oneHourAgo,
    );
    const dailyUsage = await usageDb.getUsageCount(
      userId,
      featureName,
      oneDayAgo,
    );

    let allowed = true;
    let message = "";
    let resetTime = "";

    if (limit.hourlyLimit === 0 && limit.dailyLimit === 0) {
      allowed = false;
      message = `The ${featureName} module is locked on your current plan.`;
    } else if (
      limit.hourlyLimit !== "Unlimited" &&
      hourlyUsage >= (limit.hourlyLimit as number)
    ) {
      allowed = false;
      message = `You have reached your hourly usage limit for ${featureName}.`;

      // Calculate reset time (time until the oldest request in the last hour expires)
      const oldestLog = await usageDb.getFirstLogAfter(
        userId,
        featureName,
        oneHourAgo,
      );
      if (oldestLog) {
        const resetAt = new Date(oldestLog.getTime() + 60 * 60 * 1000);
        const minutesLeft = Math.ceil(
          (resetAt.getTime() - now.getTime()) / 60000,
        );
        resetTime = `Limit resets in ${minutesLeft} minutes.`;
      }
    } else if (
      limit.dailyLimit !== "Unlimited" &&
      dailyUsage >= (limit.dailyLimit as number)
    ) {
      allowed = false;
      message = `You have reached your daily usage limit for ${featureName}.`;

      const oldestLog = await usageDb.getFirstLogAfter(
        userId,
        featureName,
        oneDayAgo,
      );
      if (oldestLog) {
        const resetAt = new Date(oldestLog.getTime() + 24 * 60 * 60 * 1000);
        const hoursLeft = Math.ceil(
          (resetAt.getTime() - now.getTime()) / (60 * 60 * 1000),
        );
        resetTime = `Limit resets in ${hoursLeft} hours.`;
      }
    }

    if (allowed && action === "consume") {
      await usageDb.logUsage(userId, featureName);
    }

    return NextResponse.json({
      allowed,
      message: allowed ? undefined : message,
      resetTime: allowed ? undefined : resetTime,
      upgradeSuggestion: allowed
        ? undefined
        : planName === "Scout"
          ? "Upgrade to Analyst"
          : "Upgrade to ProTrader",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
