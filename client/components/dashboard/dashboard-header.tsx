"use client";

import { PanelLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GooeyInput } from "@/components/ui/gooey-input";
import { ModeToggle } from "@/components/ui/mode-toggle";

type DashboardHeaderProps = {
  repositoryCount: number;
  readyCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export function DashboardHeader({
  repositoryCount,
  readyCount,
  search,
  onSearchChange,
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PanelLeft aria-hidden="true" className="size-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Repositories</h1>
            <p className="text-xs text-muted-foreground">
              {repositoryCount.toLocaleString()} connected
              <span className="px-1.5">·</span>
              {readyCount.toLocaleString()} ready
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <GooeyInput
            value={search}
            onValueChange={onSearchChange}
            placeholder="Search repositories..."
            collapsedWidth={115}
            expandedWidth={220}
            expandedOffset={46}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                aria-hidden="true"
                className={isRefreshing ? "animate-spin" : undefined}
              />
              {isRefreshing ? "Syncing..." : "Sync"}
            </Button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
