import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@cacsms.com";
const userWithSubscriptions = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { subscriptions: true },
});

type UserWithSubscriptions = Prisma.UserGetPayload<typeof userWithSubscriptions>;

function getRequiredAdminPassword(): string {
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_INITIAL_PASSWORD is required to run setup-admin.");
  }

  return adminPassword;
}

async function setupSuperAdmin() {
  try {
    console.log("🚀 Setting up Super Admin user...\n");
    const adminPassword = getRequiredAdminPassword();

    // 1. Find or create the Super Admin user
    let user: UserWithSubscriptions;
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      ...userWithSubscriptions,
    });

    if (!existingUser) {
      console.log(`📝 Creating new user: ${ADMIN_EMAIL}`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: "System Administrator",
          role: "Super Admin",
          country: "International",
          passwordHash: hashedPassword,
          emailVerified: new Date(),
        },
        ...userWithSubscriptions,
      });
      console.log(`✅ User created with ID: ${user.id}`);
    } else {
      user = existingUser;
      console.log(`👤 Found existing user: ${ADMIN_EMAIL} (ID: ${user.id})`);

      // Update role to Super Admin if not already
      if (user.role !== "Super Admin") {
        console.log(`🔄 Updating role from "${user.role}" to "Super Admin"`);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: "Super Admin", emailVerified: new Date() },
          ...userWithSubscriptions,
        });
        console.log(`✅ Role updated to Super Admin`);
      } else {
        console.log(`✓ Already Super Admin`);
      }
    }

    // 2. Check and update/create Institutional subscription
    const activeSubscription = user.subscriptions.find(
      (s) => s.status === "Active",
    );

    if (activeSubscription && activeSubscription.planType === "Institutional") {
      console.log(`\n📦 Subscription: Institutional (already active)`);
      const daysRemaining = Math.ceil(
        (new Date(activeSubscription.expiryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      console.log(`   Expires in ${daysRemaining} days`);
    } else {
      // Expire all existing subscriptions
      if (activeSubscription) {
        console.log(
          `\n🔄 Expiring previous subscription: ${activeSubscription.planType}`,
        );
        await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: { status: "Expired" },
        });
      }

      // Create new Institutional subscription (1 year)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      console.log(`\n📦 Creating Institutional subscription`);
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planType: "Institutional",
          billingCycle: "annual",
          price: 2990,
          currency: "$",
          startDate: new Date(),
          expiryDate,
          paymentProvider: "Internal",
          status: "Active",
        },
      });
      console.log(`✅ Subscription created (ID: ${subscription.id})`);
      console.log(`   Plan: Institutional (Annual)`);
      console.log(`   Price: $2,990/year`);
      console.log(`   Expires: ${expiryDate.toLocaleDateString()}`);
    }

    console.log(`\n${"═".repeat(50)}`);
    console.log(`✅ Super Admin Setup Complete!`);
    console.log(`${"═".repeat(50)}`);
    console.log(`\n📋 Summary:`);
    console.log(`   Email:  ${user.email}`);
    console.log(`   Role:   Super Admin`);
    console.log(`   Plan:   Institutional`);
    console.log(`   Status: ✓ Active`);
    console.log(`\n`);
  } catch (error) {
    console.error("❌ Error setting up Super Admin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupSuperAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
