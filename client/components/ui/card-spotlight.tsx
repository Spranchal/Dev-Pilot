"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  radius?: number;
  color?: string;
  className?: string;
  dotColor?: string;
}

export function CardSpotlight({
  children,
  radius = 320,
  color = "rgba(59, 130, 246, 0.15)", // Subtle blue spotlight
  dotColor = "rgba(147, 197, 253, 0.4)",
  className,
  ...props
}: CardSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Cybernetic matrix canvas effect inside the spotlight
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.offsetWidth);
    let height = (canvas.height = container.offsetHeight);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
    });
    resizeObserver.observe(container);

    const dotSpacing = 8;
    const dotSize = 1.2;

    // Cyber palette matching Aceternity UI (cyan, blue, purple, magenta)
    const colors = [
      "rgba(96, 165, 250, 0.8)",   // blue-400
      "rgba(167, 139, 250, 0.85)", // purple-400
      "rgba(129, 140, 248, 0.8)",  // indigo-400
      "rgba(56, 189, 248, 0.85)",  // sky-400
      "rgba(192, 132, 252, 0.75)", // violet-400
    ];

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (isHovered) {
        tick++;
        const cols = Math.floor(width / dotSpacing);
        const rows = Math.floor(height / dotSpacing);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * dotSpacing + dotSpacing / 2;
            const y = r * dotSpacing + dotSpacing / 2;

            const dx = x - coords.x;
            const dy = y - coords.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
              const falloff = 1 - dist / radius;
              // Subtle shimmer
              const noise = Math.sin(c * 12.9898 + r * 78.233 + tick * 0.05);
              if (noise > -0.3) {
                const colorIdx = Math.abs(Math.floor((c * 7 + r * 13 + tick * 0.1) % colors.length));
                ctx.fillStyle = colors[colorIdx];
                ctx.globalAlpha = Math.max(0, falloff * 0.85 * (0.6 + 0.4 * noise));
                ctx.beginPath();
                ctx.arc(x, y, dotSize * (0.8 + 0.4 * falloff), 0, Math.PI * 2);
                ctx.fill();
              }
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
  }, [coords, isHovered, radius]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group/spotlight relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl",
        className
      )}
      {...props}
    >
      {/* Background radial spotlight glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(${radius}px circle at ${coords.x}px ${coords.y}px, ${color}, transparent 80%)`,
        }}
      />

      {/* Cyber dot matrix canvas overlay */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
      />

      {/* Subtle border highlight following cursor */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(${radius * 0.75}px circle at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.08), transparent 70%)`,
        }}
      />

      {/* Card Content (z-20 ensures all interactive links/buttons remain clickable) */}
      <div className="relative z-20 size-full flex flex-col">{children}</div>
    </div>
  );
}

