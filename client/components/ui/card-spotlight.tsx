"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  radius?: number;
  color?: string;
  className?: string;
}

export function CardSpotlight({
  children,
  radius = 220,
  color = "rgba(147, 51, 234, 0.35)", // Rich purple/violet spotlight
  className,
  ...props
}: CardSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Directly update CSS variables on mouse move for zero-latency, 100% sync with cursor
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Dense Aceternity-style cyber dot matrix
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    const dotSpacing = 7;
    const dotSize = 1.1;

    // Aceternity matrix colors: purple, violet, indigo, blue, cyan
    const colors = [
      "#a855f7", // purple-500
      "#8b5cf6", // violet-500
      "#6366f1", // indigo-500
      "#3b82f6", // blue-500
      "#06b6d4", // cyan-500
      "#c084fc", // purple-400
    ];

    let tick = 0;

    const render = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (isHovered) {
        tick++;
        const cols = Math.ceil(rect.width / dotSpacing);
        const rows = Math.ceil(rect.height / dotSpacing);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * dotSpacing + dotSpacing / 2;
            const y = r * dotSpacing + dotSpacing / 2;

            // Micro-shimmer per dot
            const shimmer = Math.sin(c * 17.1 + r * 31.7 + tick * 0.06);
            if (shimmer > -0.2) {
              const colorIdx = Math.abs(Math.floor(c * 5 + r * 11 + tick * 0.04)) % colors.length;
              ctx.fillStyle = colors[colorIdx];
              ctx.globalAlpha = 0.55 + 0.45 * shimmer;

              ctx.beginPath();
              ctx.arc(x, y, dotSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--radius": `${radius}px`,
          "--mouse-x": "-999px",
          "--mouse-y": "-999px",
        } as React.CSSProperties
      }
      className={cn(
        "relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#0c0c0e] p-0 shadow-lg transition-all duration-300 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10",
        className
      )}
      {...props}
    >
      {/* 1. Aceternity Cyber Dot Matrix - MASKED strictly around cursor */}
      <div
        className="pointer-events-none absolute inset-0 size-full transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          maskImage: `radial-gradient(var(--radius) circle at var(--mouse-x) var(--mouse-y), black 25%, transparent 75%)`,
          WebkitMaskImage: `radial-gradient(var(--radius) circle at var(--mouse-x) var(--mouse-y), black 25%, transparent 75%)`,
        }}
      >
        <canvas ref={canvasRef} className="size-full" />
      </div>

      {/* 2. Radial Spotlight Glow - EXACT SAME coordinates & mask as dots */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(var(--radius) circle at var(--mouse-x) var(--mouse-y), ${color}, rgba(139, 92, 246, 0.12) 40%, transparent 80%)`,
        }}
      />

      {/* 3. Subtle inner border highlight following the spotlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          border: `1px solid rgba(168, 85, 247, 0.45)`,
          maskImage: `radial-gradient(calc(var(--radius) * 0.95) circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
          WebkitMaskImage: `radial-gradient(calc(var(--radius) * 0.95) circle at var(--mouse-x) var(--mouse-y), black, transparent)`,
        }}
      />

      {/* 4. Interactive Card Content on top */}
      <div className="relative z-20 size-full flex flex-col">{children}</div>
    </div>
  );
}
