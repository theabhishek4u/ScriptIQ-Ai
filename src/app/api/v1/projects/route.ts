import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/seed";

export async function GET() {
  try {
    const { user, workspace } = await getOrCreateDefaultUser();

    const dbProjects = await prisma.project.findMany({
      where: { workspaceId: workspace.id },
      include: {
        videos: {
          include: {
            transcripts: {
              include: {
                analyses: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map database models to UI Project interface
    const mappedProjects = dbProjects.map((p: any) => {
      // Find latest video and analysis
      const latestVideo = p.videos[0];
      const latestTranscript = latestVideo?.transcripts[0];
      const latestAnalysis = latestTranscript?.analyses[0];

      // Formatted "last analyzed"
      let lastAnalyzed = "No analysis yet";
      if (latestAnalysis) {
        const diffMs = new Date().getTime() - new Date(latestAnalysis.createdAt).getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs === 0) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          lastAnalyzed = diffMins === 0 ? "Just now" : `${diffMins} minutes ago`;
        } else if (diffHrs < 24) {
          lastAnalyzed = `${diffHrs} hours ago`;
        } else {
          lastAnalyzed = `${Math.floor(diffHrs / 24)} days ago`;
        }
      }

      // Thumbnail choice
      let thumbnail = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop";
      if (latestVideo?.metadata) {
        try {
          const meta = JSON.parse(latestVideo.metadata);
          if (meta.thumbnailUrl) thumbnail = meta.thumbnailUrl;
        } catch (_) {}
      }

      // Status mapping
      let status: "completed" | "processing" | "draft" = "draft";
      if (latestAnalysis) {
        status = "completed";
      } else if (latestVideo) {
        status = "processing";
      }

      return {
        id: p.id,
        title: p.title,
        videoCount: p.videos.length,
        lastAnalyzed,
        thumbnail,
        viralScore: latestAnalysis?.viralScore || undefined,
        status,
      };
    });

    return NextResponse.json(mappedProjects);
  } catch (error: any) {
    console.error("GET Projects failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, workspace } = await getOrCreateDefaultUser();
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Project title is required and must be a string." },
        { status: 400 }
      ) as any;
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        workspaceId: workspace.id,
        userId: user.id,
      },
    });

    return NextResponse.json({
      id: newProject.id,
      title: newProject.title,
      videoCount: 0,
      lastAnalyzed: "Just created",
      thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
      status: "draft",
    });
  } catch (error: any) {
    console.error("POST Project failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
