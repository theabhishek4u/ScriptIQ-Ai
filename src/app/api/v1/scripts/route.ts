import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateScript } from "@/lib/ai/generator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { analysisId, style, intensity, language } = body;

    if (!analysisId || !style || !intensity || !language) {
      return NextResponse.json(
        { error: "analysisId, style, intensity, and language are required." },
        { status: 400 }
      );
    }

    // Lookup analysis to get source transcript
    const analysis = await prisma.aIAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        transcript: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    }

    const generated = await generateScript(
      analysis.transcript.fullText || "",
      style,
      intensity,
      language
    );

    // Save GeneratedScript to database
    const script = await prisma.generatedScript.create({
      data: {
        analysisId: analysis.id,
        style,
        intensity,
        language,
        content: generated.content,
        hooks: JSON.stringify(generated.hooks),
        ctas: JSON.stringify(generated.ctas),
        originality: generated.originality,
      },
    });

    return NextResponse.json({
      id: script.id,
      analysisId: script.analysisId,
      style: script.style,
      intensity: script.intensity,
      language: script.language,
      content: script.content,
      hooks: generated.hooks,
      ctas: generated.ctas,
      originality: script.originality,
      createdAt: script.createdAt,
    });
  } catch (error: any) {
    console.error("POST Scripts failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get("analysisId");

    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId query parameter is required." },
        { status: 400 }
      );
    }

    const script = await prisma.generatedScript.findFirst({
      where: { analysisId },
      orderBy: { createdAt: "desc" },
    });

    if (!script) {
      return NextResponse.json({ error: "No generated script found for this analysis." }, { status: 404 });
    }

    let hooks = [];
    try {
      if (script.hooks) hooks = JSON.parse(script.hooks);
    } catch (_) {}

    let ctas = [];
    try {
      if (script.ctas) ctas = JSON.parse(script.ctas);
    } catch (_) {}

    return NextResponse.json({
      id: script.id,
      analysisId: script.analysisId,
      style: script.style,
      intensity: script.intensity,
      language: script.language,
      content: script.content,
      hooks,
      ctas,
      originality: script.originality,
      createdAt: script.createdAt,
    });
  } catch (error: any) {
    console.error("GET Script failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
