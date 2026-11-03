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
  radius = 280,
  color = "rgba(139, 92, 246, 0.35)", // Vibrant violet/indigo spotlight
  className,
  ...props
}: CardSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseRef.current = { x, y, active: true };
    setMousePos({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    mouseRef.current.active = true;
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
    setIsHovered(false);
  }, []);

  // Cybernetic matrix canvas effect - smooth 60fps loop using ref (no teardown on mousemove)
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

    const dotSpacing = 10;
    const dotSize = 1.4;

    // Cyber palette: violet, sky, purple, blue, cyan
    const colors = [
      "rgba(147, 51, 234, 0.9)", // purple-600
      "rgba(99, 102, 241, 0.9)", // indigo-500
      "rgba(56, 189, 248, 0.95)", // sky-400
      "rgba(168, 85, 247, 0.9)", // violet-500
      "rgba(129, 140, 248, 0.9)", // indigo-400
      "rgba(59, 130, 246, 0.95)", // blue-500
    ];

    let tick = 0;

    const render = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (mouseRef.current.active) {
        tick++;
        const { x: mx, y: my } = mouseRef.current;
        const cols = Math.ceil(rect.width / dotSpacing);
        const rows = Math.ceil(rect.height / dotSpacing);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * dotSpacing + dotSpacing / 2;
            const y = r * dotSpacing + dotSpacing / 2;

            const dx = x - mx;
            const dy = y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
              const falloff = 1 - dist / radius;
              // Shimmer animation
              const noise = Math.sin(c * 0.4 + r * 0.4 + tick * 0.08);

              if (noise > -0.4) {
                const colorIdx = (c * 3 + r * 7 + Math.floor(tick * 0.05)) % colors.length;
                ctx.fillStyle = colors[Math.abs(colorIdx)];
                ctx.globalAlpha = Math.max(0, Math.min(1, falloff * 1.1 * (0.6 + 0.4 * noise)));
                ctx.beginPath();
                ctx.arc(x, y, dotSize * (0.8 + 0.5 * falloff), 0, Math.PI * 2);
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
  }, [radius]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group/spotlight relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#0d0d10] p-0 shadow-lg transition-all duration-300 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10",
        className
      )}
      {...props}
    >
      {/* 1. Dynamic Radial Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${radius}px circle at ${mousePos.x}px ${mousePos.y}px, ${color}, rgba(99, 102, 241, 0.08) 40%, transparent 80%)`,
        }}
      />

      {/* 2. Cyber Dot Matrix Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* 3. Outer Glowing Border Highlight following cursor */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow: `inset 0 0 20px rgba(139, 92, 246, 0.15)`,
          border: `1px solid rgba(168, 85, 247, 0.4)`,
          maskImage: `radial-gradient(${radius * 0.9}px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(${radius * 0.9}px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        }}
      />

      {/* 4. Card Content (z-20 ensures all interactive links/buttons remain clickable) */}
      <div className="relative z-20 size-full flex flex-col">{children}</div>
    </div>
  );
}
