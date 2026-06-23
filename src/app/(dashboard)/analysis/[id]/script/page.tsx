"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, Check, Wand2, ArrowRightLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface HookVariation {
  id: string;
  text: string;
  type: "curiosity" | "shock" | "educational" | "story";
  strengthScore: number;
}

interface CTAVariation {
  id: string;
  text: string;
  type: "follow" | "subscribe" | "comment" | "save" | "lead-gen";
  platform: string;
}

interface ScriptData {
  id: string;
  content: string;
  originality: number;
  style: string;
  intensity: string;
  language: string;
  hooks: HookVariation[];
  ctas: CTAVariation[];
}

export default function ScriptGeneratorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Source details
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");

  // Target script state
  const [script, setScript] = useState<ScriptData | null>(null);

  // Form selections
  const [style, setStyle] = useState("viral");
  const [sliderValue, setSliderValue] = useState<number[]>([75]);
  const [language, setLanguage] = useState("english");

  const intensityMap: Record<number, string> = {
    25: "light",
    50: "medium",
    75: "aggressive",
    100: "viral",
  };

  const getIntensityLabel = (val: number) => {
    if (val <= 25) return "Light";
    if (val <= 50) return "Medium";
    if (val <= 75) return "Aggressive";
    return "Viral";
  };

  const intensity = intensityMap[sliderValue[0]] || "aggressive";

  const fetchSourceAndScript = async () => {
    try {
      setLoading(true);
      // 1. Fetch transcript info (to get analysis ID and original text)
      const transcriptRes = await fetch(`/api/v1/transcripts/${id}`);
      if (!transcriptRes.ok) throw new Error("Failed to load transcript data");
      
      const transcriptData = await transcriptRes.json();
      setOriginalText(transcriptData.fullText || "");
      
      const foundAnalysisId = transcriptData.analysisId;
      setAnalysisId(foundAnalysisId);

      if (foundAnalysisId) {
        // 2. Fetch existing script for this analysis if it exists
        const scriptRes = await fetch(`/api/v1/scripts?analysisId=${foundAnalysisId}`);
        if (scriptRes.ok) {
          const scriptData = await scriptRes.json();
          setScript(scriptData);
          setStyle(scriptData.style || "viral");
          setLanguage(scriptData.language || "english");
          
          // Map intensity back to slider value
          const reverseIntensityMap: Record<string, number> = {
            light: 25,
            medium: 50,
            aggressive: 75,
            viral: 100,
          };
          setSliderValue([reverseIntensityMap[scriptData.intensity] || 75]);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSourceAndScript();
  }, [id]);

  const handleGenerateScript = async () => {
    if (!analysisId) return;

    try {
      setGenerating(true);
      const res = await fetch("/api/v1/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId,
          style,
          intensity,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate AI script. Please check your config.");
      }

      const data = await res.json();
      setScript(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!script) return;
    navigator.clipboard.writeText(script.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Loading script workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <CardTitle className="text-destructive mb-2 font-heading">Workspace Loading Error</CardTitle>
        <p className="text-muted-foreground text-sm">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Controls */}
      <Card className="glass border-border/50">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-end">
          <div className="space-y-3 flex-1 w-full">
            <label className="text-sm font-medium text-muted-foreground">Style / Tone</label>
            <Select value={style} onValueChange={(val) => setStyle(val || "viral")}>
              <SelectTrigger className="w-full bg-background/50 border-border/50 h-11 rounded-xl">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viral">Viral / High-Energy</SelectItem>
                <SelectItem value="educational">Educational / Calm</SelectItem>
                <SelectItem value="storytelling">Storytelling / Narrative</SelectItem>
                <SelectItem value="documentary">Documentary</SelectItem>
                <SelectItem value="tech">Tech / Hardware</SelectItem>
                <SelectItem value="finance">Finance / Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 flex-1 w-full">
            <label className="text-sm font-medium text-muted-foreground">Output Language</label>
            <Select value={language} onValueChange={(val) => setLanguage(val || "english")}>
              <SelectTrigger className="w-full bg-background/50 border-border/50 h-11 rounded-xl">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hinglish">Hinglish (Hindi in Latin script)</SelectItem>
                <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-5 flex-1 w-full">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-muted-foreground">Rewrite Intensity</label>
              <span className="text-xs font-semibold text-primary">{getIntensityLabel(sliderValue[0])}</span>
            </div>
            <Slider 
              value={sliderValue} 
              onValueChange={(val) => setSliderValue(Array.isArray(val) ? val : [val])}
              max={100} 
              min={25}
              step={25} 
              className="w-full" 
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest px-1">
              <span>Light</span>
              <span>Med</span>
              <span>High</span>
              <span>Viral</span>
            </div>
          </div>
          
          <div className="w-full md:w-auto pt-2 md:pt-0">
            <Button 
              onClick={handleGenerateScript}
              disabled={generating || !analysisId}
              className="w-full md:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {script ? <RefreshCw className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                  {script ? "Regenerate" : "Generate Script"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Side by Side Editor */}
      <div className="grid lg:grid-cols-2 gap-6 h-[550px]">
        {/* Original */}
        <Card className="glass border-border/50 hidden lg:flex flex-col h-full overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
          <CardHeader className="py-3 px-4 border-b border-border/40 bg-card/50">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              Original Transcript
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto bg-muted/10">
            <div className="p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">
              {originalText}
            </div>
          </CardContent>
        </Card>

        {/* Generated */}
        <Card className="glass-strong border-primary/20 flex flex-col h-full overflow-hidden shadow-xl shadow-primary/5 relative lg:col-span-1 col-span-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-10" />
          
          <CardHeader className="py-3 px-4 border-b border-border/40 bg-card/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Generated Script
            </CardTitle>
            {script && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-mono text-xs">
                  {(script.originality * 100).toFixed(0)}% Original
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {script ? (
              <Textarea 
                value={script.content}
                onChange={(e) => setScript((prev) => prev ? { ...prev, content: e.target.value } : null)}
                className="flex-1 w-full p-4 md:p-6 bg-transparent border-none resize-none focus-visible:ring-0 text-base leading-relaxed text-foreground font-sans h-full focus-visible:outline-hidden"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-4">
                <Wand2 className="w-12 h-12 text-muted-foreground/30 animate-bounce" />
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-foreground">Write original script</h3>
                  <p className="text-xs text-muted-foreground max-w-[300px]">Select your style and click "Generate Script" to create a fresh script draft.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hooks & CTAs Tabs */}
      {script && (
        <Card className="glass border-border/50">
          <Tabs defaultValue="hooks" className="w-full">
            <CardHeader className="py-3 px-4 border-b border-border/40 bg-card/50">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-muted/50 p-1">
                <TabsTrigger value="hooks" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Hook Variations</TabsTrigger>
                <TabsTrigger value="ctas" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">CTA Variations</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <TabsContent value="hooks" className="mt-0 space-y-4">
                {script.hooks.map((hook, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-muted/30 transition-colors group">
                    <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
                      <span className="text-xs font-bold text-primary">{hook.strengthScore}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{hook.type}</Badge>
                      </div>
                      <p className="text-sm md:text-base font-medium font-sans">{hook.text}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="ctas" className="mt-0 space-y-4">
                {script.ctas.map((cta, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-muted/30 transition-colors group">
                    <div className="flex-1">
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider mb-2 mr-2">{cta.type}</Badge>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider mb-2">{cta.platform}</Badge>
                      <p className="text-sm md:text-base font-medium font-sans">{cta.text}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
