import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = [
    { key: 'legalVersion', value: new Date().toISOString() },
    { key: 'platformStatus', value: 'online' },
  ];

  await Promise.all(
    settings.map((setting) =>
      prisma.platformSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      })
    )
  );

  const limits = [
    { planName: 'Free', featureName: 'apiCalls', hourlyLimit: '100', dailyLimit: '1000' },
    { planName: 'Professional', featureName: 'apiCalls', hourlyLimit: '500', dailyLimit: '5000' },
    { planName: 'Premium', featureName: 'apiCalls', hourlyLimit: '2000', dailyLimit: '20000' },
    { planName: 'Free', featureName: 'dashboardAccess', hourlyLimit: '1', dailyLimit: '1' },
    { planName: 'Professional', featureName: 'dashboardAccess', hourlyLimit: '6', dailyLimit: '12' },
    { planName: 'Premium', featureName: 'dashboardAccess', hourlyLimit: '24', dailyLimit: '24' },
  ];

  await Promise.all(
    limits.map((limit) =>
      prisma.usageLimit.upsert({
        where: {
          planName_featureName: {
            planName: limit.planName,
            featureName: limit.featureName,
          },
        },
        update: limit,
        create: limit,
      })
    )
  );
}

main()
  .catch((error) => {
    console.error('Database seeding failed', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
