"use client";

import React from "react";

interface LogoProps {
  className?: string;
  isActive?: boolean;
}

/**
 * 1. Daily Tasks & Execution Logo
 * Context: Checklist, Task Docket, Action Items, Done State.
 * Visual: High-tech Task Checklist Tablet with checkmarks, active focus item, and progress lines.
 */
export function DailyTasksLogo({ className = "w-7 h-7", isActive = false }: LogoProps) {
  const id = React.useId();
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]" : "group-hover:scale-105"}`}
    >
      <defs>
        <linearGradient id={`${id}-emerald`} x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="8" y1="6" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0.08)" />
        </linearGradient>
      </defs>

      {/* Checklist Board / Tablet Base */}
      <rect
        x="6"
        y="5"
        width="24"
        height="27"
        rx="4.5"
        fill={isActive ? `url(#${id}-glass)` : "rgba(15, 23, 42, 0.7)"}
        stroke={`url(#${id}-emerald)`}
        strokeWidth="1.8"
      />

      {/* Top Clip of the task board */}
      <rect
        x="13"
        y="3"
        width="10"
        height="4"
        rx="2"
        fill="#34D399"
        stroke="#FFFFFF"
        strokeWidth="1"
      />
      <circle cx="18" cy="5" r="1" fill="#064E3B" />

      {/* Row 1: Completed Task Item (Checkmark + Line) */}
      <circle cx="11.5" cy="12.5" r="3.2" fill="rgba(16, 185, 129, 0.3)" stroke="#34D399" strokeWidth="1.3" />
      <path
        d="M10 12.5L11.2 13.8L13.3 11"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="17" y1="12.5" x2="26" y2="12.5" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

      {/* Row 2: In-Progress / Today's Active Task Item */}
      <circle cx="11.5" cy="18.5" r="3.2" fill={isActive ? "#10B981" : "rgba(16, 185, 129, 0.2)"} stroke="#34D399" strokeWidth="1.3" />
      <circle cx="11.5" cy="18.5" r="1.2" fill="#FFFFFF" />
      <line x1="17" y1="18.5" x2="24" y2="18.5" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />

      {/* Row 3: Upcoming Task Item */}
      <circle cx="11.5" cy="24.5" r="3.2" fill="transparent" stroke="#64748B" strokeWidth="1.3" strokeDasharray="2 1.5" />
      <line x1="17" y1="24.5" x2="22" y2="24.5" stroke="#64748B" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

      {/* Large checkmark badge stamp on active state */}
      {isActive && (
        <circle cx="27" cy="27" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.2" className="animate-pulse" />
      )}
      {isActive && (
        <path
          d="M25 27L26.3 28.3L29 25.5"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/**
 * 2. AI Goal & Roadmap Builder Logo
 * Context: Roadmap, Milestones, S-Curve Path to Summit, Target Flag, AI Generative Spark.
 * Visual: A winding highway/milestone trail leading up to a summit flag crowned by an AI star.
 */
export function RoadmapBuilderLogo({ className = "w-7 h-7", isActive = false }: LogoProps) {
  const id = React.useId();
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.7)]" : "group-hover:scale-105"}`}
    >
      <defs>
        <linearGradient id={`${id}-violet`} x1="4" y1="32" x2="32" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>

      {/* Winding S-Curved Roadmap Path (Ribbon) */}
      <path
        d="M7 31C13 31 11 23 18 21C25 19 23 11 28 8"
        stroke={`url(#${id}-violet)`}
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity={isActive ? "0.9" : "0.5"}
      />
      {/* Dashed Center Lane Marking on Roadmap */}
      <path
        d="M7 31C13 31 11 23 18 21C25 19 23 11 28 8"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeDasharray="2.5 2"
        strokeLinecap="round"
      />

      {/* Milestone Pin 1 (Starting Phase) */}
      <circle cx="8" cy="27" r="2.5" fill="#818CF8" stroke="#FFFFFF" strokeWidth="1" />

      {/* Milestone Pin 2 (Middle Horizon) */}
      <circle cx="18" cy="18" r="3" fill="#A855F7" stroke="#FFFFFF" strokeWidth="1" />

      {/* Milestone Summit Flagpole & Flag */}
      <line x1="28" y1="4" x2="28" y2="13" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M28 5L33 7.5L28 10Z"
        fill="#C084FC"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Generative AI Spark at the Summit (Crown of achievement) */}
      <path
        d="M21 5L22 7.5L24.5 8.5L22 9.5L21 12L20 9.5L17.5 8.5L20 7.5Z"
        fill="#FFFFFF"
        stroke="#818CF8"
        strokeWidth="0.8"
      />
      <circle cx="21" cy="8.5" r="1.2" fill="#C084FC" />
    </svg>
  );
}

/**
 * 3. Goal Recovery Mode Logo
 * Context: Schedule Recovery, Lifesaver / Rescue, Rebalance Clock, Heartbeat Safety Net.
 * Visual: Dual rewind arrows looping around a high-tech lifebuoy / rescue ring with an emergency resilience pulse.
 */
export function RecoveryModeLogo({ className = "w-7 h-7", isActive = false }: LogoProps) {
  const id = React.useId();
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" : "group-hover:scale-105"}`}
    >
      <defs>
        <linearGradient id={`${id}-amber`} x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>

      {/* Circular Schedule Recalibration Outer Orbit (Rewinding slippage) */}
      <path
        d="M18 4C10.3 4 4 10.3 4 18C4 25.7 10.3 32 18 32C24.5 32 29.9 27.5 31.5 21.3"
        stroke={`url(#${id}-amber)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray={isActive ? "none" : "26 4"}
      />
      {/* Rewind arrow head at 12 o'clock */}
      <path
        d="M13 5.5L18 3.5L17 8.5"
        stroke={`url(#${id}-amber)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The Central Lifesaver / Rescue Ring (Symbol of anti-burnout recovery) */}
      <circle
        cx="18"
        cy="18"
        r="9"
        fill={isActive ? "rgba(245, 158, 11, 0.2)" : "rgba(15, 23, 42, 0.8)"}
        stroke={`url(#${id}-amber)`}
        strokeWidth="2"
      />
      <circle
        cx="18"
        cy="18"
        r="4.5"
        fill="#020617"
        stroke={`url(#${id}-amber)`}
        strokeWidth="1.5"
      />

      {/* 4 Lifesaver High-Vis Grip Straps (Top, Bottom, Left, Right) */}
      <rect x="16.75" y="9" width="2.5" height="4.5" rx="1" fill="#FFFFFF" />
      <rect x="16.75" y="22.5" width="2.5" height="4.5" rx="1" fill="#FFFFFF" />
      <rect x="9" y="16.75" width="4.5" height="2.5" rx="1" fill="#FFFFFF" />
      <rect x="22.5" y="16.75" width="4.5" height="2.5" rx="1" fill="#FFFFFF" />

      {/* Anti-Burnout Vital Pulse Spark in Center */}
      <path
        d="M15 18H16.5L17.5 15.5L18.5 20.5L19.5 18H21"
        stroke="#FBBF24"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 4. AI Coach & Feasibility Insights Logo
 * Context: AI Coach, Intelligence, Neural Brain, Strategic Speech & Data Waves.
 * Visual: Anatomically recognizable cybernetic brain with glowing cortex convolutions, front AI spark, and speech guidance tail.
 */
export function AiCoachLogo({ className = "w-7 h-7", isActive = false }: LogoProps) {
  const id = React.useId();
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(45,212,191,0.7)]" : "group-hover:scale-105"}`}
    >
      <defs>
        <linearGradient id={`${id}-teal`} x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="50%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>

      {/* Left Brain Hemisphere Outline */}
      <path
        d="M17 7.5C14 7.5 11.5 9 10.5 11.5C8 12.5 7 15 7 17.5C7 20 8.5 22 9.5 23C9 25 10.5 27.5 13 28C14.8 28.4 16.5 28 17 28"
        stroke={`url(#${id}-teal)`}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Right Brain Hemisphere Outline */}
      <path
        d="M19 7.5C22 7.5 24.5 9 25.5 11.5C28 12.5 29 15 29 17.5C29 20 27.5 22 26.5 23C27 25 25.5 27.5 23 28C21.2 28.4 19.5 28 19 28"
        stroke={`url(#${id}-teal)`}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Central Longitudinal Fissure (Brain separation) */}
      <line x1="18" y1="7" x2="18" y2="28" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

      {/* Cerebral Cortex Convolutions (Internal brain folds) */}
      {/* Left fold */}
      <path
        d="M12 14C14 14.5 15.5 16 15 18C14.5 20 12 21 13 24"
        stroke={`url(#${id}-teal)`}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Right fold */}
      <path
        d="M24 14C22 14.5 20.5 16 21 18C21.5 20 24 21 23 24"
        stroke={`url(#${id}-teal)`}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Synaptic AI Neural Spark in the Forehead */}
      <path
        d="M18 10L19 12.5L21.5 13.5L19 14.5L18 17L17 14.5L14.5 13.5L17 12.5Z"
        fill="#FFFFFF"
        stroke="#2DD4BF"
        strokeWidth="0.8"
      />
      <circle cx="18" cy="13.5" r="1.3" fill="#0EA5E9" />

      {/* Dialogue / Coach guidance speech indicator pip (indicating conversational coaching) */}
      <path
        d="M18 28.5L20 32.5L22.5 29"
        fill={isActive ? "#14B8A6" : "rgba(20, 184, 166, 0.4)"}
        stroke="#FFFFFF"
        strokeWidth="0.8"
      />
    </svg>
  );
}
