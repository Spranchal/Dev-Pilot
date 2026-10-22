import { CheckCircle2, LogOut } from "lucide-react";

import type { User } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <section className="max-w-3xl space-y-6" aria-label="Settings">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your connected account and workspace appearance.
        </p>
      </div>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle>Connected account</CardTitle>
          <CardDescription>
            Your GitHub identity is used to load your repositories.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-12">
            <AvatarImage
              src={user?.avatarUrl ?? user?.avatarurl ?? undefined}
              alt={displayName}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user?.githubUsername
                ? `@${user.githubUsername}`
                : "GitHub profile"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Connected
          </span>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose the theme that feels right for your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Color theme</span>
          <ModeToggle />
        </CardContent>
      </Card>

      {onSignOut && (
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Sign out of DevPilot on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              onClick={onSignOut}
              disabled={isSigningOut}
            >
              <LogOut aria-hidden="true" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
