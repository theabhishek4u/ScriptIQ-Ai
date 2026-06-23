"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, TrendingUp, Sparkles, BrainCircuit, Activity, Loader2, AlertCircle } from "lucide-react";

interface SubScores {
  hook: number;
  retention: number;
  engagement: number;
  storytelling: number;
  cta: number;
}

interface AnalysisData {
  viralScore: number;
  subScores: SubScores;
  hookAnalysis: { score: number; type: string; notes: string };
  retentionAnalysis: { score: number; dropRiskZones: string[]; notes: string };
  ctaAnalysis: { score: number; type: string; notes: string };
  storytellingAnalysis: { score: number; framework: string; notes: string };
  emotionalTriggers: string[];
  curiosityLoops: { opened: string; closed: string; description: string }[];
  contentStructure: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

export default function InsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/analyses/${id}`);
        if (!res.ok) throw new Error("Failed to load analysis insights");
        const data = await res.json();
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Evaluating viral retention metrics...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <CardTitle className="text-destructive mb-2 font-heading">Failed to Load Insights</CardTitle>
        <p className="text-muted-foreground text-sm">{error || "No analysis available yet."}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Viral Score */}
        <div className="w-full md:w-1/3 shrink-0">
          <Card className="h-full glass-strong border-primary/20 bg-linear-to-br from-card/90 to-primary/5 shadow-xl shadow-primary/5">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-heading text-xl">Viral Score</CardTitle>
              <CardDescription>Estimated performance potential</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              {/* Animated SVG Gauge */}
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="score-gauge-track"
                    style={{ fill: "transparent", stroke: "oklch(0.2 0.05 300 / 0.2)", strokeWidth: 8 }}
                  />
                  {/* Fill */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="score-gauge-fill"
                    style={{
                      fill: "transparent",
                      stroke: "url(#gradient)",
                      strokeWidth: 8,
                      strokeLinecap: "round",
                      strokeDasharray: 283,
                      strokeDashoffset: 283 - (283 * analysis.viralScore) / 100,
                      transition: "stroke-dashoffset 1s ease-in-out",
                    }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="oklch(0.6 0.22 310)" />
                      <stop offset="100%" stopColor="oklch(0.7 0.2 340)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-heading font-bold gradient-text">{analysis.viralScore}</span>
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">/ 100</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground uppercase">Hook Quality</span>
                    <span className="text-primary">{analysis.subScores.hook}</span>
                  </div>
                  <Progress value={analysis.subScores.hook} className="h-1.5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground uppercase">Retention</span>
                    <span className="text-primary">{analysis.subScores.retention}</span>
                  </div>
                  <Progress value={analysis.subScores.retention} className="h-1.5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground uppercase">Storytelling</span>
                    <span className="text-primary">{analysis.subScores.storytelling}</span>
                  </div>
                  <Progress value={analysis.subScores.storytelling} className="h-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Deep Breakdown */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="glass border-border/50 bg-linear-to-br from-green-500/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed font-sans">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="glass border-border/50 bg-linear-to-br from-orange-500/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed font-sans">{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="glass border-border/50">
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-lg flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                Retention Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 text-foreground/80 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Drop Risk Zones
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {analysis.retentionAnalysis.dropRiskZones.map((zone, i) => (
                    <Badge key={i} variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 rounded-md">
                      {zone}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-3 rounded-lg border border-border/50 font-sans leading-relaxed">
                  {analysis.retentionAnalysis.notes}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-foreground/80">Emotional Triggers</h4>
                  <div className="flex gap-2 flex-wrap">
                    {analysis.emotionalTriggers.map((t, i) => (
                      <Badge key={i} className="bg-primary/20 hover:bg-primary/30 text-primary-foreground font-medium rounded-md">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-foreground/80">Storytelling Framework</h4>
                  <Badge variant="secondary" className="rounded-md">
                    {analysis.storytellingAnalysis.framework}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content Flow Timeline */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Content Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            {analysis.contentStructure.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className="px-4 py-2 rounded-lg bg-card border border-border/50 text-sm font-medium shadow-sm font-sans">
                  {step}
                </div>
                {i < analysis.contentStructure.length - 1 && (
                  <div className="w-6 h-px bg-border mx-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
