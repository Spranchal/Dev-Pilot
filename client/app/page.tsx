"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  FileCode2,
  FolderGit2,
  GitBranch,
  Layers,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { DevPilotIcon } from "@/components/icons/devpilot-icon";
import { GitHubIcon } from "@/components/icons/github-icon";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { useCurrentUser } from "@/hooks/use-auth";
import { getGithubLoginUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const githubLoginUrl = getGithubLoginUrl();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
        <div className="absolute top-1/3 -right-40 size-[500px] rounded-full bg-accent/30 blur-[130px] dark:bg-primary/5" />
        <div className="absolute bottom-10 -left-40 size-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
            <DevPilotIcon className="size-8 rounded-[10px]" />
            <span className="text-lg font-semibold tracking-tight">DevPilot</span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-medium h-5 px-1.5 border-primary/30 text-primary">
              v1.0
            </Badge>
          </Link>

          <nav className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground mr-2 font-medium">
              <a href="#features" className="transition-colors hover:text-foreground">Features</a>
              <a href="#how-it-works" className="transition-colors hover:text-foreground">How it Works</a>
              <a href="#architecture" className="transition-colors hover:text-foreground">Architecture</a>
            </div>

            <ModeToggle />

            {!isLoading && user ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "gap-2 rounded-xl px-4 font-medium shadow-sm shadow-primary/20"
                )}
              >
                <span>Dashboard</span>
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <a
                href={githubLoginUrl}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 px-4 font-medium shadow-sm transition-all hover:scale-[1.02]"
                )}
              >
                <GitHubIcon className="size-4" />
                <span>Sign in with GitHub</span>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-8">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur">
            <Sparkles className="size-3.5 animate-pulse" />
            <span>AI-Powered Repository Intelligence with Exact Code Citations</span>
          </div>

          {/* Main Title with Animated Flip */}
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Chat with your codebase like a
            </h1>
            <div className="mt-3 flex items-center justify-center">
              <LayoutTextFlip
                text="supercharged"
                words={[
                  "Senior Engineer",
                  "Staff Architect",
                  "Tech Lead",
                  "Pair Programmer",
                  "Security Auditor",
                  "Codebase Expert",
                ]}
                duration={2600}
                textClassName="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-muted-foreground"
                wordClassName="text-3xl font-extrabold sm:text-5xl lg:text-6xl px-4 py-1.5 rounded-2xl border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 dark:border-rose-500/40 shadow-rose-500/10 ring-rose-500/20"
              />
            </div>
          </div>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base sm:text-xl text-muted-foreground leading-relaxed">
            Connect your GitHub repositories, index code with dense pgvector embeddings, and unlock deep architectural comprehension with exact file and line-numbered citations.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {!isLoading && user ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto h-12 rounded-2xl bg-primary px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 gap-2.5 transition-all hover:scale-[1.02]"
                )}
              >
                <FolderGit2 className="size-5" />
                Open Your Repositories
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <a
                href={githubLoginUrl}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto h-12 rounded-2xl bg-foreground text-background px-8 text-base font-semibold shadow-lg hover:bg-foreground/90 gap-2.5 transition-all hover:scale-[1.02]"
                )}
              >
                <GitHubIcon className="size-5" />
                Continue with GitHub
                <ArrowRight className="size-4" />
              </a>
            )}

            <a
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto h-12 rounded-2xl px-6 text-base font-medium border-border/80 hover:bg-muted/30"
              )}
            >
              See How It Works
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Google Gemini 3.5 Flash Reasoning
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              PgVector HNSW Semantic Search
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              AES-256 Encrypted GitHub Tokens
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Zero Configuration Required
            </span>
          </div>
        </div>

        {/* Live Interactive Mockup Showcase */}
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="relative rounded-3xl border border-border/80 bg-card/60 p-2 sm:p-3 shadow-2xl backdrop-blur-xl">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono text-[11px] ml-2 text-foreground font-semibold">devpilot / chat / spring-backend</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] h-5">
                ● 1,420 Chunks Indexed
              </Badge>
            </div>

            {/* Mock Chat View */}
            <div className="space-y-4 p-4 sm:p-6 text-sm">
              {/* User Question */}
              <div className="flex items-start justify-end gap-3">
                <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
                  <p className="font-medium text-xs text-primary-foreground/80 mb-0.5">You</p>
                  <p>How does the vector indexing pipeline handle rate limits and avoid losing progress?</p>
                </div>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Code2 className="size-4" />
                </div>
              </div>

              {/* DevPilot Answer */}
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border bg-muted text-primary">
                  <Sparkles className="size-4" />
                </div>
                <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">DevPilot Assistant</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">gemini-3.5-flash</Badge>
                  </div>

                  <p className="text-foreground/90 leading-relaxed text-xs sm:text-sm">
                    DevPilot handles rate limits and resilient processing through three coordinated components in the backend:
                  </p>

                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Adaptive 429 Quota Backoff:</strong> Caught in <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono">IndexingService.java</code>. When Gemini returns a quota pause, it extracts the exact retry duration and sleeps cleanly without dropping the job.
                    </li>
                    <li>
                      <strong className="text-foreground">Paced Micro-Batches:</strong> Batches are metered in 10-chunk windows with a 600ms cooldown to stay under Google's 30k tokens/min threshold.
                    </li>
                    <li>
                      <strong className="text-foreground">Heartbeat Updates:</strong> The database record's <code className="rounded bg-muted px-1.5 py-0.5 text-foreground font-mono">updatedAt</code> timestamp is refreshed on every cycle to prevent stale timeouts.
                    </li>
                  </ul>

                  {/* Verifiable Citations */}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sources & Citations:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-foreground hover:border-primary transition-colors cursor-pointer">
                        <FileCode2 className="size-3 text-primary" />
                        IndexingService.java#L130-165
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-foreground hover:border-primary transition-colors cursor-pointer">
                        <FileCode2 className="size-3 text-primary" />
                        GitHubRateLimiter.java#L22-45
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1 font-mono text-[11px] text-foreground hover:border-primary transition-colors cursor-pointer">
                        <FileCode2 className="size-3 text-primary" />
                        application.properties#L14-26
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="border-t border-border/60 bg-muted/20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Engineered specifically for developer codebases
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Traditional AI chats guess where code is located. DevPilot retrieves the exact source chunks before answering.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Search className="size-5" />
                </div>
                <CardTitle className="text-lg">Semantic Code Search</CardTitle>
                <CardDescription>
                  Goes far beyond keyword searches. DevPilot finds relevant classes, logic, and patterns even if you don't know the exact method names.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <FileCode2 className="size-5" />
                </div>
                <CardTitle className="text-lg">Grounded Line Citations</CardTitle>
                <CardDescription>
                  Every answer provides direct references to the exact file path and line numbers, eliminating AI hallucinations and saving code navigation time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Zap className="size-5" />
                </div>
                <CardTitle className="text-lg">One-Click Indexing</CardTitle>
                <CardDescription>
                  Select any public or private repository from your GitHub account. DevPilot chunks, embeds, and indexes your project in background workers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <ShieldCheck className="size-5" />
                </div>
                <CardTitle className="text-lg">Enterprise Security</CardTitle>
                <CardDescription>
                  Your GitHub access tokens are encrypted with AES-256 GCM using unique salts. Code chunks remain safely isolated to your private PostgreSQL instance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Cpu className="size-5" />
                </div>
                <CardTitle className="text-lg">Google Gemini 3.5 Flash</CardTitle>
                <CardDescription>
                  Leverages the high reasoning speed and huge context window of Gemini 3.5 Flash to synthesize clear, multi-file architectural breakdowns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-3xl border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Database className="size-5" />
                </div>
                <CardTitle className="text-lg">Postgres PgVector HNSW</CardTitle>
                <CardDescription>
                  Hierarchical Navigable Small World (HNSW) cosine indexing delivers sub-50ms vector retrieval across tens of thousands of code chunks.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From zero to querying your repository in seconds
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Three simple steps to unlock complete codebase clarity.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative rounded-3xl border border-border/70 bg-card p-6 space-y-4">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
                1
              </span>
              <h3 className="text-lg font-semibold">Connect GitHub</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Log in securely using GitHub OAuth. DevPilot discovers all your repositories and branches automatically.
              </p>
            </div>

            <div className="relative rounded-3xl border border-border/70 bg-card p-6 space-y-4">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
                2
              </span>
              <h3 className="text-lg font-semibold">Index Codebase</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click Index. DevPilot skips binaries and lockfiles, chunks syntax cleanly, and computes 768-dim dense embeddings.
              </p>
            </div>

            <div className="relative rounded-3xl border border-border/70 bg-card p-6 space-y-4">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
                3
              </span>
              <h3 className="text-lg font-semibold">Ask Anything</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ask architectural questions, locate implementation details, or plan refactoring with real source code context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Showcase */}
      <section id="architecture" className="border-t border-border/60 bg-muted/20 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            Full-Stack Modern Stack
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Built with Spring Boot 4, Next.js 16, & PostgreSQL
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Combining reactive Java backend performance, asynchronous indexing pipelines, and an accessible Next.js UI styled with Tailwind CSS.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Badge variant="outline" className="px-3 py-1 font-mono text-xs">Next.js 16 (Turbopack)</Badge>
            <Badge variant="outline" className="px-3 py-1 font-mono text-xs">React 19</Badge>
            <Badge variant="outline" className="px-3 py-1 font-mono text-xs">Spring Boot 4.1.1</Badge>
            <Badge variant="outline" className="px-3 py-1 font-mono text-xs">Spring AI 2.0.1</Badge>
            <Badge variant="outline" className="px-3 py-1 font-mono text-xs">PostgreSQL 16 + pgvector</Badge>
            <Badge variant="outline" className="px-3 py-1 font-mono text-xs">Google Gemini 3.5 Flash</Badge>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-card to-card p-8 sm:p-14 text-center space-y-6 shadow-xl">
          <DevPilotIcon className="mx-auto size-14 rounded-2xl shadow-md" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start exploring your codebase with DevPilot
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            No credit card, no complex server setup. Just connect your GitHub account and begin chatting with your code in minutes.
          </p>

          <div className="pt-2">
            {!isLoading && user ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-2xl bg-primary px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 gap-2.5"
                )}
              >
                Go to Workspace Dashboard
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <a
                href={githubLoginUrl}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-2xl bg-foreground text-background px-8 text-base font-semibold shadow-lg hover:bg-foreground/90 gap-2.5 transition-all hover:scale-[1.02]"
                )}
              >
                <GitHubIcon className="size-5" />
                Sign in with GitHub
                <ArrowRight className="size-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-8 px-4 sm:px-6 lg:px-8 bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <DevPilotIcon className="size-5 rounded-md" />
            <span className="font-semibold text-foreground">DevPilot</span>
            <span>• AI Codebase Assistant</span>
          </div>

          <p>© {new Date().getFullYear()} DevPilot. Built for developers pairing with AI.</p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <GitHubIcon className="size-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
