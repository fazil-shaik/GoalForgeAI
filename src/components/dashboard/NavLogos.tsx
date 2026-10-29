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
