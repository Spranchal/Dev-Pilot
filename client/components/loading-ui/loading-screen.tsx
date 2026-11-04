"use client";

import React from "react";
import { MorphingInfinity } from "./morphing-infinity";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export function LoadingScreen({
  message = "Loading...",
  submessage,
  className,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 text-foreground selection:bg-primary/20",
        className
      )}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Subtle radial glow behind the morphing infinity icon */}
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <MorphingInfinity className="size-20 text-rose-500 dark:text-rose-400 drop-shadow-[0_0_18px_rgba(244,63,94,0.4)]" />

          <div className="text-center space-y-1">
            <p className="text-base font-semibold tracking-tight text-foreground">
              {message}
            </p>
            {submessage && (
              <p className="text-xs text-muted-foreground animate-pulse">
                {submessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

