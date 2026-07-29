import React from "react";

interface ProgressRingProps {
  progress: number;
  strokeWidth?: number;
  gradientId?: string;
  gradientColors?: [string, string];
  trackColor?: string;
  className?: string; // e.g., 'w-full h-full'
}

export function ProgressRing({
  progress,
  strokeWidth = 5,
  gradientId = "progress-gradient",
  gradientColors,
  trackColor = "rgba(246, 168, 183, 0.15)",
  className = "w-full h-full",
}: ProgressRingProps) {
  // We use a 100x100 viewBox so the circle can scale infinitely without getting cut off
  const radius = 50 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <svg className={`transform -rotate-90 ${className}`} viewBox="0 0 100 100">
      {gradientColors && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
      )}
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke={trackColor}
        fill="none"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke={gradientColors ? `url(#${gradientId})` : "currentColor"}
        className="fill-none transition-all duration-500 ease-out"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </svg>
  );
}
