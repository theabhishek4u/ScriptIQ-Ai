import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/seed";

export async function GET() {
  try {
    const { user, workspace } = await getOrCreateDefaultUser();

    // Count actual analyses in the workspace
    const analysesUsed = await prisma.aIAnalysis.count({
      where: {
        transcript: {
          video: {
            project: {
              workspaceId: workspace.id,
            },
          },
        },
      },
    });

    // Count actual rewrites in the workspace
    const rewritesUsed = await prisma.generatedScript.count({
      where: {
        analysis: {
          transcript: {
            video: {
              project: {
                workspaceId: workspace.id,
              },
            },
          },
        },
      },
    });

    // Plan details based on workspace tier
    const planLimits: Record<string, { analyses: number; rewrites: number }> = {
      free: { analyses: 3, rewrites: 1 },
      creator: { analyses: 50, rewrites: 150 },
      agency: { analyses: 9999, rewrites: 9999 },
    };

    const currentLimits = planLimits[workspace.plan] || planLimits.free;

    // Reset period placeholder (1 month from workspace creation)
    const resetDate = new Date(workspace.createdAt);
    resetDate.setMonth(resetDate.getMonth() + 1);

    return NextResponse.json({
      analysesUsed,
      analysesLimit: currentLimits.analyses,
      rewritesUsed,
      rewritesLimit: currentLimits.rewrites,
      plan: workspace.plan,
      currentPeriodEnd: resetDate.toISOString(),
    });
  } catch (error: any) {
    console.error("GET Usage failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
