import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getOrCreateDefaultUser } from "@/lib/db/seed";
import { extractTranscript, extractVideoId } from "@/lib/ai/transcript";
import { analyzeTranscript } from "@/lib/ai/analyzer";

// An in-memory cache to track background processing status
const processingStatus = new Map<string, { status: string; error?: string }>();

export async function POST(request: Request) {
  try {
    const { user } = await getOrCreateDefaultUser();
    const body = await request.json();
    const { projectId, url } = body;

    if (!projectId || !url) {
      return NextResponse.json(
        { error: "projectId and url are required." },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL." },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    // Create the Video record in db
    const video = await prisma.video.create({
      data: {
        projectId: project.id,
        userId: user.id,
        sourceUrl: url,
        platform: "youtube",
        externalId: videoId,
        title: "Fetching video info...",
        durationSec: 300, // placeholder
        metadata: JSON.stringify({
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          channelName: "YouTube Creator",
        }),
      },
    });

    // Create a placeholder transcript in the DB
    const transcript = await prisma.transcript.create({
      data: {
        videoId: video.id,
        language: "en",
        source: "captions",
        fullText: "",
        segments: "[]",
      },
    });

    // Track processing status
    processingStatus.set(transcript.id, { status: "processing" });

    // Kick off async background pipeline
    runBackgroundPipeline(video.id, transcript.id, url, videoId).catch((err) => {
      console.error(`Background pipeline failed for transcript ${transcript.id}:`, err);
      processingStatus.set(transcript.id, { status: "failed", error: err.message });
    });

    return NextResponse.json(
      {
        id: transcript.id,
        status: "processing",
        platform: "youtube",
      },
      { status: 202 }
    );
  } catch (error: any) {
    console.error("POST Transcripts failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Retrieve status in GET handler
export async function GET(request: Request) {
  // Let's implement status checks for the list or query if needed,
  // but specific transcript retrieval belongs in [id]/route.ts.
  return NextResponse.json({ error: "Method not allowed. Use GET /api/v1/transcripts/:id" }, { status: 405 });
}

// The background engine doing transcript extraction -> analysis
async function runBackgroundPipeline(
  videoId: string,
  transcriptId: string,
  url: string,
  externalId: string
) {
  console.log(`[Queue] Starting extraction for transcript ${transcriptId} (${url})`);

  // 1. Fetch transcript segments
  const extracted = await extractTranscript(url);

  // 2. Try to fetch YouTube video metadata to make it realistic
  let title = "Awesome YouTube Video";
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${externalId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
    }
  } catch (e) {
    console.warn("Could not fetch YouTube video title, using default:", e);
  }

  // Update video info with real title
  await prisma.video.update({
    where: { id: videoId },
    data: {
      title,
      metadata: JSON.stringify({
        thumbnailUrl: `https://img.youtube.com/vi/${externalId}/maxresdefault.jpg`,
        channelName: "YouTube Creator",
      }),
    },
  });

  // Update transcript contents
  await prisma.transcript.update({
    where: { id: transcriptId },
    data: {
      language: extracted.language,
      fullText: extracted.fullText,
      segments: JSON.stringify(extracted.segments),
    },
  });

  console.log(`[Queue] Transcript extracted. Running AI Content Analyzer for ${transcriptId}`);

  // 3. Auto-trigger Analysis Stage
  const analysisResult = await analyzeTranscript(extracted.fullText, title);

  // Save AIAnalysis to db
  await prisma.aIAnalysis.create({
    data: {
      transcriptId: transcriptId,
      viralScore: analysisResult.viralScore,
      subScores: JSON.stringify(analysisResult.subScores),
      insights: JSON.stringify({
        hookAnalysis: analysisResult.hookAnalysis,
        retentionAnalysis: analysisResult.retentionAnalysis,
        ctaAnalysis: analysisResult.ctaAnalysis,
        storytellingAnalysis: analysisResult.storytellingAnalysis,
        emotionalTriggers: analysisResult.emotionalTriggers,
        curiosityLoops: analysisResult.curiosityLoops,
        contentStructure: analysisResult.contentStructure,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        opportunities: analysisResult.opportunities,
      }),
      modelVersion: "gpt-4o-v1",
    },
  });

  console.log(`[Queue] Pipeline completed successfully for transcript ${transcriptId}`);
  processingStatus.set(transcriptId, { status: "completed" });
}

// Export the status map helper for internal API routes
export function getProcessingStatus(id: string) {
  return processingStatus.get(id);
}
