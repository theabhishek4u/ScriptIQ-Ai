import Link from "next/link";
import { LayoutDashboard, FileVideo, Settings, LogOut, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-card/50 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">ScriptIQ</span>
          </div>
        </div>

        <div className="p-4">
          <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            New Analysis
          </Button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <FileVideo className="w-5 h-5" />
            Projects
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-border/40">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
            <LogOut className="w-5 h-5" />
            Log out
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="font-heading font-semibold text-lg hidden md:block">Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              <span className="text-muted-foreground">Credits:</span> <span className="text-primary">14 / 50</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-muted border border-border overflow-hidden">
              {/* Placeholder Avatar */}
              <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
