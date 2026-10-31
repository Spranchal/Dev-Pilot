import {
  CheckCircle2,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { User } from "@/lib/api";
import { GitHubIcon } from "@/components/icons/github-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/mode-toggle";

type SettingsDashboardProps = {
  user: User | null;
  onSignOut?: () => void;
  isSigningOut?: boolean;
};

export function SettingsDashboard({
  user,
  onSignOut,
  isSigningOut = false,
}: SettingsDashboardProps) {
  const displayName =
    user?.displayName || user?.githubUsername || "GitHub account";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <section className="max-w-4xl space-y-6" aria-label="Settings">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your connected account, workspace appearance, and AI engine settings.
        </p>
      </div>

      {/* Connected Account */}
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle>Connected Account</CardTitle>
          <CardDescription>
            Your GitHub account provides repository access and authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-12 rounded-2xl border">
            <AvatarImage
              src={user?.avatarUrl ?? user?.avatarurl ?? undefined}
              alt={displayName}
            />
            <AvatarFallback className="rounded-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold">{displayName}</p>
              <Badge variant="secondary" className="gap-1 h-5 text-[10px]">
                <GitHubIcon className="size-2.5" />
                OAuth
              </Badge>
            </div>
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              {user?.githubUsername
                ? `@${user.githubUsername}`
                : "GitHub account connected"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              Connected
            </span>
            {user?.githubUsername && (
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-8 items-center justify-center rounded-xl border text-muted-foreground hover:text-foreground"
                title="View GitHub Profile"
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the theme and interface styling of your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Color Theme</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Switch between light, dark, or system preference
            </p>
          </div>
          <ModeToggle />
        </CardContent>
      </Card>

      {/* AI & Indexing Configuration */}
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            AI & Indexing Configuration
          </CardTitle>
          <CardDescription>
            DevPilot's Retrieval-Augmented Generation (RAG) and embedding settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
                <Cpu className="size-4" />
                Chat Model
              </div>
              <p className="text-sm font-semibold">Google Gemini 3.5 Flash</p>
              <p className="text-xs text-muted-foreground mt-1">
                High-speed code reasoning and natural-language synthesis.
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
                <Layers className="size-4" />
                Embeddings
              </div>
              <p className="text-sm font-semibold">gemini-embedding-001</p>
              <p className="text-xs text-muted-foreground mt-1">
                768-dimensional dense vectors with auto 429 quota backoff.
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
                <Database className="size-4" />
                Vector Storage
              </div>
              <p className="text-sm font-semibold">PostgreSQL + pgvector</p>
              <p className="text-xs text-muted-foreground mt-1">
                HNSW cosine distance index for millisecond similarity retrieval.
              </p>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 text-primary font-medium text-sm mb-1">
                <ShieldCheck className="size-4" />
                Token Encryption
              </div>
              <p className="text-sm font-semibold">AES-256 GCM</p>
              <p className="text-xs text-muted-foreground mt-1">
                GitHub tokens are encrypted at rest with hardware salt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      {onSignOut && (
        <Card className="rounded-3xl shadow-sm border-destructive/20">
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Sign out of your DevPilot session on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
