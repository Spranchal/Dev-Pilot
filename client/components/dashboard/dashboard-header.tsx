import { PanelLeft, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 sm:w-60">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search repositories..."
              aria-label="Search repositories"
              className="h-9 bg-muted/40 pl-9"
            />
          </div>
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
  );
}
