"use client";

import { RequireAuth } from "@/components/providers/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsDashboard } from "@/components/dashboard/settings-dashboard";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}

function SettingsContent() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <AppShell
      title="Settings"
      description="Manage account preferences, appearance, and AI engine parameters."
    >
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <SettingsDashboard
          user={user ?? null}
          onSignOut={() => logout.mutate()}
          isSigningOut={logout.isPending}
        />
      </main>
    </AppShell>
  );
}

