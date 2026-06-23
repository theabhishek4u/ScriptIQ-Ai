import prisma from "./prisma";

export async function getOrCreateDefaultUser() {
  // Find or create default user
  let user = await prisma.user.findUnique({
    where: { email: "creator@aiscriptstudio.local" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "creator@aiscriptstudio.local",
        name: "Default Creator",
        role: "creator",
        authProvider: "mock",
      },
    });
  }

  // Find or create default workspace
  let workspace = await prisma.workspace.findFirst({
    where: { ownerId: user.id },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "My Workspace",
        ownerId: user.id,
        plan: "creator",
      },
    });

    // Add workspace member association
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        memberRole: "owner",
      },
    });
  }

  // Seed default subscription plans if they don't exist
  const planCount = await prisma.subscriptionPlan.count();
  if (planCount === 0) {
    await prisma.subscriptionPlan.createMany({
      data: [
        {
          code: "free",
          name: "Free",
          priceMonthly: 0,
          priceAnnual: 0,
          currency: "USD",
          limits: JSON.stringify({ analyses: 3, rewrites: 1, seats: 1 }),
        },
        {
          code: "creator",
          name: "Creator Pro",
          priceMonthly: 19,
          priceAnnual: 190,
          currency: "USD",
          limits: JSON.stringify({ analyses: 50, rewrites: 150, seats: 1 }),
        },
        {
          code: "agency",
          name: "Agency",
          priceMonthly: 79,
          priceAnnual: 790,
          currency: "USD",
          limits: JSON.stringify({ analyses: 9999, rewrites: 9999, seats: 10 }),
        },
      ],
    });
  }

  return { user, workspace };
}
