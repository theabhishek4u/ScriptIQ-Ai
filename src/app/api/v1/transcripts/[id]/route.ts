import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getProcessingStatus } from "../route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transcript = await prisma.transcript.findUnique({
      where: { id },
      include: {
        video: true,
        analyses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!transcript) {
      return NextResponse.json({ error: "Transcript not found." }, { status: 404 });
    }

    // If an analysis exists, it means the whole pipeline has succeeded!
    if (transcript.analyses.length > 0) {
      let videoMeta = {};
      try {
        if (transcript.video.metadata) {
          videoMeta = JSON.parse(transcript.video.metadata);
        }
      } catch (_) {}

      let segments = [];
      try {
        if (transcript.segments) {
          segments = JSON.parse(transcript.segments);
        }
      } catch (_) {}

      return NextResponse.json({
        id: transcript.id,
        videoId: transcript.videoId,
        language: transcript.language || "en",
        source: transcript.source || "captions",
        fullText: transcript.fullText || "",
        segments,
        createdAt: transcript.createdAt,
        status: "completed",
        analysisId: transcript.analyses[0].id,
        video: {
          id: transcript.video.id,
          sourceUrl: transcript.video.sourceUrl,
          platform: transcript.video.platform,
          externalId: transcript.video.externalId,
          title: transcript.video.title,
          durationSec: transcript.video.durationSec,
          ...videoMeta,
        },
      });
    }

    // Check in-memory processing status
    const bgStatus = getProcessingStatus(id);
    if (bgStatus?.status === "failed") {
      return NextResponse.json({
        id: transcript.id,
        status: "failed",
        error: bgStatus.error || "An unknown error occurred during processing.",
      });
    }

    // Default to processing if no analysis exists yet
    return NextResponse.json({
      id: transcript.id,
      status: "processing",
    });
  } catch (error: any) {
    console.error("GET Transcript failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
