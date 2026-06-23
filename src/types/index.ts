// ── Core domain types for AI Script Studio ──

export interface Video {
  id: string;
  sourceUrl: string;
  platform: "youtube" | "instagram" | "tiktok" | "facebook" | "other";
  externalId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
  channelAvatar: string;
  durationSec: number;
  viewCount: number;
  publishedAt: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  speaker?: string;
  text: string;
}

export interface Transcript {
  id: string;
  videoId: string;
  language: string;
  source: "captions" | "whisper";
  segments: TranscriptSegment[];
  fullText: string;
  createdAt: string;
}

export interface SubScores {
  hook: number;
  retention: number;
  engagement: number;
  storytelling: number;
  cta: number;
}

export interface CuriosityLoop {
  opened: string;
  closed: string;
  description: string;
}

export interface AIAnalysis {
  id: string;
  transcriptId: string;
  viralScore: number;
  subScores: SubScores;
  hookAnalysis: {
    score: number;
    type: string;
    notes: string;
  };
  retentionAnalysis: {
    score: number;
    dropRiskZones: string[];
    notes: string;
  };
  ctaAnalysis: {
    score: number;
    type: string;
    notes: string;
  };
  storytellingAnalysis: {
    score: number;
    framework: string;
    notes: string;
  };
  emotionalTriggers: string[];
  curiosityLoops: CuriosityLoop[];
  contentStructure: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  modelVersion: string;
  createdAt: string;
}

export interface GeneratedScript {
  id: string;
  analysisId: string;
  style: ScriptStyle;
  intensity: RewriteIntensity;
  language: string;
  content: string;
  hooks: HookVariation[];
  ctas: CTAVariation[];
  originality: number;
  createdAt: string;
}

export interface HookVariation {
  id: string;
  text: string;
  type: "curiosity" | "shock" | "educational" | "story";
  strengthScore: number;
}

export interface CTAVariation {
  id: string;
  text: string;
  type: "follow" | "subscribe" | "comment" | "save" | "lead-gen";
  platform: string;
}

export type ScriptStyle =
  | "educational"
  | "storytelling"
  | "viral"
  | "motivational"
  | "documentary"
  | "sales"
  | "tech"
  | "finance"
  | "news";

export type RewriteIntensity = "light" | "medium" | "aggressive" | "viral";

export interface Project {
  id: string;
  title: string;
  videoCount: number;
  lastAnalyzed: string;
  thumbnail: string;
  viralScore?: number;
  status: "completed" | "processing" | "draft";
}

export interface UsageStats {
  analysesUsed: number;
  analysesLimit: number;
  rewritesUsed: number;
  rewritesLimit: number;
  plan: "free" | "creator" | "agency";
  currentPeriodEnd: string;
}
