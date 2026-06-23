import { AIAnalysis, GeneratedScript, Project, Transcript, UsageStats, Video } from "../types";

export const mockVideo: Video = {
  id: "vid_123",
  sourceUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
  platform: "youtube",
  externalId: "dQw4w9WgXcQ",
  title: "I Built a Secret Hidden Room in My House",
  thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  channelName: "MrBuilder",
  channelAvatar: "https://i.pravatar.cc/150?u=mrbuilder",
  durationSec: 485, // 8:05
  viewCount: 4200000,
  publishedAt: "2024-05-15T10:00:00Z",
};

export const mockTranscript: Transcript = {
  id: "trx_123",
  videoId: "vid_123",
  language: "en",
  source: "whisper",
  createdAt: "2024-05-16T10:00:00Z",
  fullText: "I've always wanted a secret room. Today, I'm going to build one behind this bookcase. And the best part? Nobody in my family knows I'm doing this. It's going to take 7 days, 400 pieces of wood, and one massive mistake that almost ruined my house. Stick around to see if I can pull this off before they get home.",
  segments: [
    { start: 0, end: 3.5, text: "I've always wanted a secret room." },
    { start: 3.5, end: 8.2, text: "Today, I'm going to build one behind this bookcase." },
    { start: 8.2, end: 12.0, text: "And the best part? Nobody in my family knows I'm doing this." },
    { start: 12.0, end: 18.5, text: "It's going to take 7 days, 400 pieces of wood, and one massive mistake that almost ruined my house." },
    { start: 18.5, end: 24.0, text: "Stick around to see if I can pull this off before they get home." },
  ]
};

export const mockAnalysis: AIAnalysis = {
  id: "ana_123",
  transcriptId: "trx_123",
  viralScore: 88,
  createdAt: "2024-05-16T10:05:00Z",
  modelVersion: "gpt-4o-v1",
  subScores: {
    hook: 92,
    retention: 85,
    engagement: 88,
    storytelling: 90,
    cta: 75
  },
  hookAnalysis: {
    score: 92,
    type: "curiosity",
    notes: "Excellent use of the 'secret' trope combined with a high-stakes timeline (family arriving) and a tease of a massive failure."
  },
  retentionAnalysis: {
    score: 85,
    dropRiskZones: ["04:15-05:30", "07:20-08:00"],
    notes: "Strong early retention due to the physical build starting immediately. Slight dip during the lumber run montage."
  },
  ctaAnalysis: {
    score: 75,
    type: "subscribe",
    notes: "Standard 'like and subscribe' at the end. Could be integrated more naturally into the reveal."
  },
  storytellingAnalysis: {
    score: 90,
    framework: "Hero's Journey (Micro)",
    notes: "Clear goal, obstacles introduced early, climax is the family reveal."
  },
  emotionalTriggers: ["Curiosity", "Suspense", "Surprise", "Schadenfreude (the mistake)"],
  curiosityLoops: [
    { opened: "00:12", closed: "06:45", description: "What was the massive mistake that almost ruined the house?" },
    { opened: "00:18", closed: "08:00", description: "Will the family find out?" }
  ],
  contentStructure: ["Hook (The Goal)", "Context (The Stakes)", "Build Phase 1", "The Obstacle", "Build Phase 2", "The Reveal", "CTA"],
  strengths: [
    "High-stakes timeline built in the first 20 seconds",
    "Visual promise established immediately",
    "Multiple curiosity loops nested effectively"
  ],
  weaknesses: [
    "Pacing slows down during the middle build section",
    "Generic call to action"
  ],
  opportunities: [
    "Add a mid-roll tease of the final room to re-engage",
    "Tie the CTA directly to the secret room concept (e.g. 'Subscribe to see what I hide in here')"
  ]
};

export const mockGeneratedScript: GeneratedScript = {
  id: "scr_123",
  analysisId: "ana_123",
  style: "viral",
  intensity: "aggressive",
  language: "en",
  createdAt: "2024-05-16T10:06:00Z",
  originality: 0.92,
  content: `[00:00 - HOOK]
I am secretly tearing down my own walls to build a hidden bunker, and my family has absolutely zero idea. 

[00:05 - CONTEXT]
But here’s the problem: I have exactly 48 hours before they get back from vacation, and I just made a structural mistake that might bring the entire second floor crashing down.

[00:15 - THE BUILD START]
It started with this innocent-looking bookshelf...

[03:20 - THE MISTAKE TEASE]
Remember when I said I made a massive mistake? Yeah, you're gonna want to see what happens when you cut a load-bearing beam by accident. 

[07:45 - THE REVEAL]
*Family walks in*
If you want to see what I put inside this room next week, hit subscribe!`,
  hooks: [
    { id: "h1", type: "shock", strengthScore: 95, text: "I might have just destroyed my house trying to build a secret room." },
    { id: "h2", type: "curiosity", strengthScore: 91, text: "What happens when you hide a secret bunker behind a bookshelf? My family is about to find out." },
    { id: "h3", type: "story", strengthScore: 88, text: "7 days. 400 pieces of wood. 1 secret room. 0 permission." },
  ],
  ctas: [
    { id: "c1", type: "subscribe", platform: "youtube", text: "Subscribe right now so you don't miss what I hide inside this room next week." },
    { id: "c2", type: "comment", platform: "tiktok", text: "What should I put in the secret room? Best comment gets pinned!" },
  ]
};

export const mockProjects: Project[] = [
  {
    id: "proj_1",
    title: "MrBeast Retention Breakdown",
    videoCount: 5,
    lastAnalyzed: "2 hours ago",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
    viralScore: 94,
    status: "completed"
  },
  {
    id: "proj_2",
    title: "Finance Niche Hooks",
    videoCount: 12,
    lastAnalyzed: "1 day ago",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop",
    viralScore: 82,
    status: "completed"
  },
  {
    id: "proj_3",
    title: "Tech Reviews Q3",
    videoCount: 2,
    lastAnalyzed: "Just now",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop",
    status: "processing"
  }
];

export const mockUsage: UsageStats = {
  analysesUsed: 14,
  analysesLimit: 50,
  rewritesUsed: 22,
  rewritesLimit: 150,
  plan: "creator",
  currentPeriodEnd: "2024-06-15T00:00:00Z"
};
