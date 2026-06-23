"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Lightbulb, PenTool, ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface VideoDetails {
  id: string;
  sourceUrl: string;
  platform: string;
  externalId: string;
  title: string;
  durationSec: number;
  thumbnailUrl: string;
  channelName: string;
}

export default function AnalysisLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = React.use(params);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"processing" | "completed" | "failed">("processing");
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading pipeline steps to show to the user
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    "Locating YouTube video container...",
    "Extracting closed captions & text tracks...",
    "Structuring transcript timeline timestamps...",
    "Sending transcripts to OpenAI GPT-4 engine...",
    "Parsing hook strength and retention drop zones...",
    "Calculating final Viral Score and recommendations...",
  ];

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/v1/transcripts/${id}`);
      if (!res.ok) {
        throw new Error("Could not find this analysis record.");
      }

      const data = await res.json();
      if (data.status === "completed") {
        setStatus("completed");
        setVideo(data.video);
        setLoading(false);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      } else if (data.status === "failed") {
        setStatus("failed");
        setError(data.error || "AI transcription pipeline failed.");
        setLoading(false);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      } else {
        setStatus("processing");
      }
    } catch (err: any) {
      setStatus("failed");
      setError(err.message);
      setLoading(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Poll status every 2.5 seconds
    pollIntervalRef.current = setInterval(fetchStatus, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [id]);

  // Rotate through loading step messages for premium feel
  useEffect(() => {
    if (status !== "processing") return;
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [status]);

  const tabs = [
    {
      name: "Transcript",
      href: `/analysis/${id}/transcript`,
      icon: <FileText className="w-4 h-4" />,
    },
    {
      name: "Insights",
      href: `/analysis/${id}/insights`,
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      name: "Script Generator",
      href: `/analysis/${id}/script`,
      icon: <PenTool className="w-4 h-4" />,
    },
  ];

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <Card className="w-full max-w-lg glass border-primary/20 p-8 shadow-2xl relative">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <Sparkles className="w-5 h-5 text-accent absolute" />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-xl font-heading font-bold">Decoding retention mechanics...</CardTitle>
              <CardDescription>Our AI pipeline is reverse-engineering your video structure.</CardDescription>
            </div>

            <div className="w-full space-y-4">
              <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-[shimmer_2s_infinite] bg-linear-to-r from-primary via-accent to-primary" style={{ width: "100%", backgroundSize: "200% 100%" }} />
              </div>
              <p className="text-sm text-primary font-medium animate-pulse">
                {steps[stepIndex]}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Card className="w-full max-w-md glass border-destructive/20 p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <CardTitle className="text-lg font-heading text-destructive font-bold">Analysis Failed</CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
            <Button render={<Link href="/dashboard" />} className="bg-primary text-primary-foreground rounded-xl mt-2 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 lg:-m-8">
      {/* Top Context Bar */}
      <div className="h-20 border-b border-border/40 bg-card/30 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" render={<Link href="/dashboard" />} className="rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {video && (
            <div className="flex items-center gap-4 border-l border-border/40 pl-4">
              <img 
                src={video.thumbnailUrl} 
                alt="Thumbnail" 
                className="w-16 h-10 object-cover rounded shadow-sm border border-border/20"
              />
              <div>
                <h2 className="font-semibold text-sm line-clamp-1 max-w-[400px] md:max-w-[600px]">{video.title}</h2>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{video.channelName}</span>
                  <span>•</span>
                  <span className="uppercase">{video.platform}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar (Vertical Tabs) */}
        <div className="w-full md:w-64 border-r border-border/40 bg-background/50 shrink-0 p-4 flex flex-col gap-2 overflow-y-auto">
          {tabs.map((tab) => {
            const isActive = pathname.includes(tab.name.toLowerCase().split(' ')[0]);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-auto bg-background/30 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
