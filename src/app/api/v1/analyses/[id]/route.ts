import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let analysis = await prisma.aIAnalysis.findUnique({
      where: { id },
      include: {
        transcript: {
          include: {
            video: true,
          },
        },
      },
    });

    if (!analysis) {
      // Try to lookup by transcriptId
      analysis = await prisma.aIAnalysis.findFirst({
        where: { transcriptId: id },
        include: {
          transcript: {
            include: {
              video: true,
            },
          },
        },
      });
    }

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    }

    let subScores = { hook: 50, retention: 50, engagement: 50, storytelling: 50, cta: 50 };
    try {
      if (analysis.subScores) {
        subScores = JSON.parse(analysis.subScores);
      }
    } catch (_) {}

    let parsedInsights: any = {};
    try {
      if (analysis.insights) {
        parsedInsights = JSON.parse(analysis.insights);
      }
    } catch (_) {}

    let videoMeta = {};
    try {
      if (analysis.transcript.video.metadata) {
        videoMeta = JSON.parse(analysis.transcript.video.metadata);
      }
    } catch (_) {}

    return NextResponse.json({
      id: analysis.id,
      transcriptId: analysis.transcriptId,
      viralScore: analysis.viralScore || 0,
      subScores,
      createdAt: analysis.createdAt,
      modelVersion: analysis.modelVersion || "gpt-4o",
      hookAnalysis: parsedInsights.hookAnalysis || { score: 0, type: "unknown", notes: "" },
      retentionAnalysis: parsedInsights.retentionAnalysis || { score: 0, dropRiskZones: [], notes: "" },
      ctaAnalysis: parsedInsights.ctaAnalysis || { score: 0, type: "unknown", notes: "" },
      storytellingAnalysis: parsedInsights.storytellingAnalysis || { score: 0, framework: "unknown", notes: "" },
      emotionalTriggers: parsedInsights.emotionalTriggers || [],
      curiosityLoops: parsedInsights.curiosityLoops || [],
      contentStructure: parsedInsights.contentStructure || [],
      strengths: parsedInsights.strengths || [],
      weaknesses: parsedInsights.weaknesses || [],
      opportunities: parsedInsights.opportunities || [],
      video: {
        id: analysis.transcript.video.id,
        sourceUrl: analysis.transcript.video.sourceUrl,
        platform: analysis.transcript.video.platform,
        externalId: analysis.transcript.video.externalId,
        title: analysis.transcript.video.title,
        durationSec: analysis.transcript.video.durationSec,
        ...videoMeta,
      },
    });
  } catch (error: any) {
    console.error("GET Analysis failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
