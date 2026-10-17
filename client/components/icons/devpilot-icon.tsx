import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type DevPilotIconProps = SVGProps<SVGSVGElement> & {
  variant?: "color" | "mono";
};

export function DevPilotIcon({
  className,
  variant = "color",
  ...props
}: DevPilotIconProps) {
  const mono = variant === "mono";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect
        x="8"
        y="8"
        width="48"
        height="48"
        rx="12"
        fill={mono ? "currentColor" : "#18181B"}
      />

      <path
        d="M32 16L47 25V39L32 48L17 39V25L32 16Z"
        fill={mono ? "transparent" : "#F4F4F5"}
        stroke={mono ? "currentColor" : "#F4F4F5"}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      <path
        d="M25 29L32 24L39 29V37L32 42L25 37V29Z"
        fill={mono ? "currentColor" : "#18181B"}
        stroke={mono ? "currentColor" : "#18181B"}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="M32 24V42M25 29L32 34L39 29"
        stroke={mono ? "currentColor" : "#F4F4F5"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}