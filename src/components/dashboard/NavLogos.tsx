"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  isActive?: boolean;
}

/**
 * 1. Daily Tasks & Execution Logo
 * Uploaded Artwork: High-tech glowing neon task clipboard with check badge & active checklist items.
 * Context: Daily focus items, priority execution checklist, real-time completion state.
 */
export function DailyTasksLogo({ className = "w-full h-full", isActive = false }: LogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full rounded-xl overflow-hidden transition-all duration-300 ${
        isActive
          ? "scale-105"
          : "opacity-85 group-hover:opacity-100 group-hover:scale-105"
      } ${className}`}
    >
      {/* Liquid glass specular sheen overlay */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/25 via-white/5 to-transparent z-10 rounded-t-xl" />

      {/* Uploaded High-Res Logo */}
      <Image
        src="/images/nav/tasks-logo.png"
        alt="Daily Tasks & Execution Hub"
        width={112}
        height={112}
        unoptimized
        priority
        className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${
          isActive
            ? "drop-shadow-[0_0_12px_rgba(16,185,129,0.7)] brightness-110"
            : "drop-shadow-[0_0_6px_rgba(16,185,129,0.25)] group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        }`}
      />
    </div>
  );
}

/**
 * 2. AI Goal & Roadmap Builder Logo
 * Uploaded Artwork: S-curved winding highway roadmap leading to mountain summit with checkpoint pins and apex AI star.
 * Context: Gemini AI milestone synthesis, roadmap progression, targets & summits.
 */
export function RoadmapBuilderLogo({ className = "w-full h-full", isActive = false }: LogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full rounded-xl overflow-hidden transition-all duration-300 ${
        isActive
          ? "scale-105"
          : "opacity-85 group-hover:opacity-100 group-hover:scale-105"
      } ${className}`}
    >
      {/* Liquid glass specular sheen overlay */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/25 via-white/5 to-transparent z-10 rounded-t-xl" />

      {/* Uploaded High-Res Logo */}
      <Image
        src="/images/nav/roadmap-logo.png"
        alt="AI Goal & Roadmap Builder"
        width={112}
        height={112}
        unoptimized
        priority
        className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${
          isActive
            ? "drop-shadow-[0_0_12px_rgba(99,102,241,0.7)] brightness-110"
            : "drop-shadow-[0_0_6px_rgba(99,102,241,0.25)] group-hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        }`}
      />
    </div>
  );
}

/**
 * 3. Goal Recovery Mode Logo
 * Uploaded Artwork: High-tech glowing lifebuoy with rotating cyber arrows and inner ECG heartbeat pulse.
 * Context: Overdue triage, adaptive schedule recalculation, Gemini catch-up safety net.
 */
export function RecoveryModeLogo({ className = "w-full h-full", isActive = false }: LogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full rounded-xl overflow-hidden transition-all duration-300 ${
        isActive
          ? "scale-105"
          : "opacity-85 group-hover:opacity-100 group-hover:scale-105"
      } ${className}`}
    >
      {/* Liquid glass specular sheen overlay */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/25 via-white/5 to-transparent z-10 rounded-t-xl" />

      {/* Uploaded High-Res Logo */}
      <Image
        src="/images/nav/recovery-logo.png"
        alt="Goal Recovery Mode"
        width={112}
        height={112}
        unoptimized
        priority
        className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${
          isActive
            ? "drop-shadow-[0_0_12px_rgba(245,158,11,0.7)] brightness-110"
            : "drop-shadow-[0_0_6px_rgba(245,158,11,0.25)] group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
        }`}
      />
    </div>
  );
}

/**
 * 4. AI Coach & Feasibility Insights Logo
 * Uploaded Artwork: Cybernetic neural brain with orbital rings, chat bubbles, and core AI star.
 * Context: Neural feasibility insights, pacing advice, cognitive chat coach powered by Gemini.
 */
export function AiCoachLogo({ className = "w-full h-full", isActive = false }: LogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full rounded-xl overflow-hidden transition-all duration-300 ${
        isActive
          ? "scale-105"
          : "opacity-85 group-hover:opacity-100 group-hover:scale-105"
      } ${className}`}
    >
      {/* Liquid glass specular sheen overlay */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/25 via-white/5 to-transparent z-10 rounded-t-xl" />

      {/* Uploaded High-Res Logo */}
      <Image
        src="/images/nav/coach-logo.png"
        alt="AI Coach & Feasibility Insights"
        width={112}
        height={112}
        unoptimized
        priority
        className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${
          isActive
            ? "drop-shadow-[0_0_12px_rgba(20,184,166,0.7)] brightness-110"
            : "drop-shadow-[0_0_6px_rgba(20,184,166,0.25)] group-hover:drop-shadow-[0_0_10px_rgba(20,184,166,0.5)]"
        }`}
      />
    </div>
  );
}

/**
 * 5. Arena: Leaderboard & Medals Logo
 * Artwork: Cybernetic 3D Gold Trophy with championship wreath, apex star beacon, and glowing liquid glass medallion.
 * Context: Daily streaks, Hard Goal medals, global goal completion leaderboard.
 */
export function LeaderboardLogo({ className = "w-full h-full", isActive = false }: LogoProps) {
  const id = React.useId();
  return (
    <div
      className={`relative flex items-center justify-center w-full h-full rounded-xl overflow-hidden transition-all duration-300 ${
        isActive
          ? "scale-105"
          : "opacity-85 group-hover:opacity-100 group-hover:scale-105"
      } ${className}`}
    >
      {/* Liquid glass specular sheen overlay */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/30 via-white/5 to-transparent z-10 rounded-t-xl" />

      {/* Cybernetic 3D Liquid Glass Trophy Artwork */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full p-1.5 transition-all duration-300 ${
          isActive
            ? "drop-shadow-[0_0_12px_rgba(234,179,8,0.75)] brightness-110"
            : "drop-shadow-[0_0_6px_rgba(234,179,8,0.3)] group-hover:drop-shadow-[0_0_10px_rgba(234,179,8,0.55)]"
        }`}
      >
        <defs>
          <linearGradient id={`${id}-gold`} x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#FBBF24" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id={`${id}-glass-glow`} x1="12" y1="8" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.45)" />
            <stop offset="50%" stopColor="rgba(245, 158, 11, 0.2)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.85)" />
          </linearGradient>
          <radialGradient id={`${id}-core`} cx="24" cy="18" r="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </radialGradient>
        </defs>

        {/* Outer Laurel Wreath / Champion Ring */}
        <path
          d="M10 20C10 27.7 15.5 34 24 34C32.5 34 38 27.7 38 20"
          stroke={`url(#${id}-gold)`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="4 2"
          opacity="0.85"
        />

        {/* Trophy Cup Body */}
        <path
          d="M14 9H34V19C34 24.52 29.52 29 24 29C18.48 29 14 24.52 14 19V9Z"
          fill={`url(#${id}-glass-glow)`}
          stroke={`url(#${id}-gold)`}
          strokeWidth="2"
        />

        {/* Trophy Handles */}
        <path
          d="M14 12H9C7.34 12 6 13.34 6 15V17C6 19.76 8.24 22 11 22H14"
          stroke={`url(#${id}-gold)`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M34 12H39C40.66 12 42 13.34 42 15V17C42 19.76 39.76 22 37 22H34"
          stroke={`url(#${id}-gold)`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Pedestal Stem & Base */}
        <path d="M24 29V36" stroke={`url(#${id}-gold)`} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="15" y="36" width="18" height="4" rx="2" fill={`url(#${id}-gold)`} />
        <rect x="18" y="40" width="12" height="2" rx="1" fill="#FEF08A" opacity="0.7" />

        {/* Apex Champion Star in Center */}
        <circle cx="24" cy="18" r="5" fill={`url(#${id}-core)`} />
        <path
          d="M24 14.5L25.2 17.2L28 17.4L25.8 19.3L26.5 22L24 20.4L21.5 22L22.2 19.3L20 17.4L22.8 17.2L24 14.5Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}
