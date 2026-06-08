"use client";

import { useEffect, useState } from "react";

type ProgressRingProps = {
  /** 0–100+ (values above 100 fill the ring) */
  percent: number;
  size?: number;
  stroke?: number;
  trackClassName?: string;
  progressClassName?: string;
  /** Animate fill from 0 on mount */
  animateOnMount?: boolean;
  children?: React.ReactNode;
};

export function ProgressRing({
  percent,
  size = 96,
  stroke = 7,
  trackClassName = "stroke-white/25",
  progressClassName = "stroke-white",
  animateOnMount = false,
  children,
}: ProgressRingProps) {
  const [mounted, setMounted] = useState(!animateOnMount);

  useEffect(() => {
    if (!animateOnMount) return;
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [animateOnMount]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const shown = mounted ? clamped : 0;
  const offset = circumference - (shown / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(shown)} percent`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`${progressClassName} transition-[stroke-dashoffset] duration-700 ease-out`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {children ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
