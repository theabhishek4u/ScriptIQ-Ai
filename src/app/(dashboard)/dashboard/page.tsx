"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Play, TrendingUp, Clock, Plus, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  title: string;
  videoCount: number;
  lastAnalyzed: string;
  thumbnail: string;
  viralScore?: number;
  status: "completed" | "processing" | "draft";
}

interface UsageStats {
  analysesUsed: number;
  analysesLimit: number;
  rewritesUsed: number;
  rewritesLimit: number;
  plan: string;
  currentPeriodEnd: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ingestion form state
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("new");
  const [submitting, setSubmitting] = useState(false);

  // Project creation state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, usageRes] = await Promise.all([
        fetch("/api/v1/projects"),
        fetch("/api/v1/usage"),
      ]);

      if (!projectsRes.ok || !usageRes.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const projectsData = await projectsRes.json();
      const usageData = await usageRes.json();

      setProjects(projectsData);
      setUsage(usageData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newProjectName }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const created = await res.json();
      setProjects((prev) => [created, ...prev]);
      setSelectedProjectId(created.id);
      setNewProjectName("");
      setShowNewProjectModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAnalyzeVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      setSubmitting(true);

      let targetProjectId = selectedProjectId;

      // If user wants to create a new project during analysis
      if (targetProjectId === "new") {
        const titleToUse = projectTitle.trim() || `Project ${new Date().toLocaleDateString()}`;
        const pRes = await fetch("/api/v1/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: titleToUse }),
        });

        if (!pRes.ok) throw new Error("Failed to create project for video");
        const createdP = await pRes.json();
        targetProjectId = createdP.id;
      }

      // Submit transcript job
      const tRes = await fetch("/api/v1/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: targetProjectId, url }),
      });

      if (!tRes.ok) {
        const data = await tRes.json();
        throw new Error(data.error || "Failed to submit video for analysis");
      }

      const job = await tRes.json();
      // Redirect to the transcript view which will poll for progress
      router.push(`/analysis/${job.id}/transcript`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Loading script dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 p-6 text-center max-w-lg mx-auto mt-12">
        <CardTitle className="text-destructive mb-2 font-heading">Error Loading Dashboard</CardTitle>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <Button onClick={fetchData} className="mx-auto bg-primary">Retry</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Ingestion Form */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 glass border-border/50 bg-linear-to-br from-card/85 to-card/45 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none -z-10" />
          
          <CardHeader>
            <CardTitle className="text-2xl font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Welcome back!
            </CardTitle>
            <CardDescription>
              {projects.length === 0 
                ? "Let's create your first project and write some viral scripts!" 
                : `You have ${projects.length} project${projects.length === 1 ? "" : "s"} active. Select one or submit a new URL below.`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!showForm ? (
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewProjectModal(true)}
                  className="border-border/50 bg-background/50 hover:bg-muted"
                >
                  Create Project
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAnalyzeVideo} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Video URL</label>
                  <Input 
                    type="url"
                    required
                    placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=...)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-background/50 border-border/50 h-11 rounded-xl focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Workspace Project</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full h-11 bg-background/50 border border-border/50 text-foreground rounded-xl px-3 text-sm focus:outline-hidden focus:ring-1 focus:ring-primary"
                    >
                      <option value="new">Create New Project...</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  {selectedProjectId === "new" && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">New Project Name</label>
                      <Input 
                        type="text"
                        required
                        placeholder="e.g. Finance Competitors"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="w-full bg-background/50 border-border/50 h-11 rounded-xl"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-11 px-6 rounded-xl flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Video
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setShowForm(false)}
                    className="h-11 px-6 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Usage Stats Card */}
        {usage && (
          <Card className="glass border-border/50 bg-linear-to-br from-card/85 to-card/45">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Usage & Credits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Analysis Credits</span>
                  <span className="text-muted-foreground">{usage.analysesUsed} / {usage.analysesLimit}</span>
                </div>
                <Progress value={(usage.analysesUsed / usage.analysesLimit) * 100} className="h-2 bg-muted/40">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (usage.analysesUsed / usage.analysesLimit) * 100)}%` }} />
                </Progress>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">AI Rewrites</span>
                  <span className="text-muted-foreground">{usage.rewritesUsed} / {usage.rewritesLimit}</span>
                </div>
                <Progress value={(usage.rewritesUsed / usage.rewritesLimit) * 100} className="h-2 bg-muted/40">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(100, (usage.rewritesUsed / usage.rewritesLimit) * 100)}%` }} />
                </Progress>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Plan: <span className="capitalize font-semibold text-foreground">{usage.plan}</span> • Resets on {new Date(usage.currentPeriodEnd).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Projects Creation Overlay */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md glass border-border/50 shadow-2xl animate-in scale-in duration-200">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Create New Project</CardTitle>
              <CardDescription>Organize your transcript breakdown by channel or theme.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <Input 
                  required
                  placeholder="Project Name (e.g. Hook Experiments)"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="bg-background/50 border-border/50 h-11 rounded-xl"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowNewProjectModal(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground rounded-xl">
                    Create
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Projects List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-semibold">Recent Analyses</h2>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border/50 bg-card/10">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <CardTitle className="text-base font-semibold mb-2">No analyses yet</CardTitle>
            <CardDescription className="mb-4">Paste a YouTube URL above to run your first retention breakdown.</CardDescription>
            <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground shadow-sm mx-auto">
              Get Started
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link href={`/analysis/${project.id}/transcript`} key={project.id} className="group outline-none">
                <Card className="overflow-hidden glass border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img 
                      src={project.thumbnail} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                    
                    {project.status === "completed" && project.viralScore && (
                      <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-xs border border-white/10 flex items-center justify-center font-bold text-sm shadow-lg text-primary">
                        {project.viralScore}
                      </div>
                    )}

                    {project.status === "processing" && (
                      <Badge variant="secondary" className="absolute top-3 right-3 bg-blue-500/80 text-white backdrop-blur-xs border-none">
                        Processing
                      </Badge>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-primary/95 flex items-center justify-center text-primary-foreground transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-md">
                        <Play className="w-5 h-5 ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" />
                        {project.videoCount} video{project.videoCount === 1 ? "" : "s"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {project.lastAnalyzed}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
