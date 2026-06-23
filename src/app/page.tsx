"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Play, Sparkles, Zap, BarChart3, Clock, Loader2 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      setLoading(true);

      // 1. Create/Get a default project first
      const pRes = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "My First Analysis" }),
      });

      if (!pRes.ok) throw new Error("Failed to initialize project");
      const project = await pRes.json();

      // 2. Submit URL for transcript & analysis
      const tRes = await fetch("/api/v1/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, url }),
      });

      if (!tRes.ok) {
        const data = await tRes.json();
        throw new Error(data.error || "Failed to submit video for analysis");
      }

      const job = await tRes.json();
      
      // 3. Route directly to the status/transcript page!
      router.push(`/analysis/${job.id}/transcript`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 lg:px-10 py-4 flex items-center justify-between border-b border-border/40 glass-strong sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">ScriptIQ</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Log in</Link>
          <Button render={<Link href="/dashboard" />} className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] pointer-events-none -z-10" />
          
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Script Intelligence Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-balance mx-auto mb-6 leading-tight">
              Stop guessing what goes <span className="gradient-text">viral.</span><br />
              Reverse-engineer it.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance">
              Turn any high-performing video into a deep, structured breakdown. Then generate a better, original, high-retention script in minutes, not hours.
            </p>
            
            {/* Input Box Form */}
            <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto glass-strong p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-2xl shadow-primary/10 mb-16 relative z-10 animate-float">
              <div className="relative flex-1">
                <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="url"
                  required
                  placeholder="Paste a YouTube URL here..." 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-12 h-14 bg-background/50 border-none rounded-xl text-lg focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze Video 
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Social Proof */}
            <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider font-semibold">Trusted by creators generating</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="text-2xl font-bold font-heading">100M+ Views</div>
              <div className="text-2xl font-bold font-heading">2M+ Subs</div>
              <div className="text-2xl font-bold font-heading">Top Agencies</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-background border-y border-border/40 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">How ScriptIQ decodes virality</h2>
              <p className="text-lg text-muted-foreground text-balance">
                We don't just transcribe videos. We analyze the underlying retention architecture that keeps viewers watching until the very end.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass p-8 rounded-3xl border border-border/50 hover:border-primary/50 transition-colors relative group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">Retention Breakdown</h3>
                <p className="text-muted-foreground leading-relaxed">
                  See exactly where viewers drop off. Our AI identifies hooks, curiosity loops, and emotional triggers used in top videos.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass p-8 rounded-3xl border border-border/50 hover:border-primary/50 transition-colors relative group">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">Viral Score Engine</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get an instant 0-100 score on any script before you shoot it. We score your hooks, storytelling flow, and call-to-actions.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass p-8 rounded-3xl border border-border/50 hover:border-primary/50 transition-colors relative group">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">Original Rewrites</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Turn hours of competitor research into minutes. Generate net-new, plagiarism-free scripts inspired by proven frameworks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
           <div className="absolute inset-0 gradient-bg opacity-10" />
           <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8">Ready to write your next viral hit?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Join thousands of creators using ScriptIQ to dominate their niches. Start analyzing for free.
              </p>
              <Button render={<Link href="/dashboard" />} className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg shadow-[0_0_40px_rgba(var(--primary),0.4)] hover:scale-105 transition-all">
                Get Started for Free
              </Button>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border/40 bg-background/50">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg">ScriptIQ</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 AI Script Studio. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
