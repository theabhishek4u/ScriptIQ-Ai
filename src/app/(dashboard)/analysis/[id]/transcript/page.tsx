"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, FileText, Clock, Loader2, AlertCircle } from "lucide-react";

interface TranscriptSegment {
  start: number;
  end: number;
  speaker?: string;
  text: string;
}

export default function TranscriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [search, setSearch] = useState("");
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [fullText, setFullText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/transcripts/${id}`);
        if (!res.ok) throw new Error("Failed to load transcript data");
        const data = await res.json();
        setSegments(data.segments || []);
        setFullText(data.fullText || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTranscript();
  }, [id]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const downloadText = (format: "txt" | "srt") => {
    let content = "";
    const filename = `transcript_${id}.${format}`;

    if (format === "txt") {
      content = fullText;
    } else {
      content = segments
        .map((seg, i) => {
          const index = i + 1;
          const startStr = formatSrtTime(seg.start);
          const endStr = formatSrtTime(seg.end);
          return `${index}\n${startStr} --> ${endStr}\n${seg.text}\n`;
        })
        .join("\n");
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const formatSrtTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
  };

  const filteredSegments = segments.filter((seg) =>
    seg.text.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Loading transcript segments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <CardTitle className="text-destructive mb-2 font-heading">Failed to Load Transcript</CardTitle>
        <p className="text-muted-foreground text-sm">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-2xl border border-border/50 glass">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 rounded-xl"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => downloadText("txt")}
            className="w-full sm:w-auto rounded-xl border-border/50 hover:bg-muted bg-background/50"
          >
            <Download className="w-4 h-4 mr-2" />
            TXT
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadText("srt")}
            className="w-full sm:w-auto rounded-xl border-border/50 hover:bg-muted bg-background/50"
          >
            <Download className="w-4 h-4 mr-2" />
            SRT
          </Button>
        </div>
      </div>

      <Card className="glass border-border/50 overflow-hidden">
        <CardHeader className="bg-card/50 border-b border-border/40 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Full Transcript
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto divide-y divide-border/20">
            {filteredSegments.length > 0 ? (
              filteredSegments.map((segment, i) => (
                <div
                  key={i}
                  className="p-4 hover:bg-muted/30 transition-colors flex gap-4 group"
                >
                  <div className="w-16 shrink-0 pt-0.5 flex items-start gap-1 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(segment.start)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
                      {search ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: segment.text.replace(
                              new RegExp(search, "gi"),
                              (match) =>
                                `<mark class="bg-primary/30 text-primary-foreground rounded px-1">${match}</mark>`
                            ),
                          }}
                        />
                      ) : (
                        segment.text
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No results found for "{search}"
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
