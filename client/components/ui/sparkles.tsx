"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleColors?: string[];
  particleDensity?: number;
};

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  vx: number;
  vy: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

export const SparklesCore = ({
  id,
  className,
  background = "transparent",
  minSize = 0.6,
  maxSize = 2.4,
  speed = 1,
  particleColor = "#ffffff",
  particleColors,
  particleDensity = 100,
}: ParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const colors =
      particleColors && particleColors.length > 0
        ? particleColors
        : [particleColor];

    const initParticles = (width: number, height: number) => {
      // Calculate particle count based on area and density
      const area = width * height;
      const count = Math.max(
        20,
        Math.floor((area / 10000) * (particleDensity / 30))
      );

      particles = [];
      const moveSpeed = (speed || 1) * 0.4;

      for (let i = 0; i < count; i++) {
        const size = Math.random() * (maxSize - minSize) + minSize;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          baseAlpha: Math.random() * 0.7 + 0.3,
          alpha: Math.random() * 0.8 + 0.2,
          vx: (Math.random() - 0.5) * moveSpeed,
          vy: (Math.random() * -0.5 - 0.15) * moveSpeed, // gentle upward drift
          twinkleSpeed: (Math.random() * 0.04 + 0.015) * (speed || 1),
          twinklePhase: Math.random() * Math.PI * 2,
          color,
        });
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2
      );
      const width = rect.width || 300;
      const height = rect.height || 150;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      initParticles(width, height);
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    const render = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width || 300;
      const height = rect.height || 150;

      ctx.clearRect(0, 0, width, height);

      if (background && background !== "transparent") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Twinkle calculation
        p.twinklePhase += p.twinkleSpeed;
        const sine = Math.sin(p.twinklePhase);
        p.alpha = Math.max(0.15, Math.min(1, p.baseAlpha + sine * 0.4));

        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle with glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = p.size * 3.5;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleColors,
    particleDensity,
  ]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("relative h-full w-full overflow-hidden", className)}
      id={id}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />
    </motion.div>
  );
};
