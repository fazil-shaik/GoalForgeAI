"use client";

import React, { useEffect, useState } from "react";
import { Target, Sparkles } from "lucide-react";

interface GoalForgeArrowLoaderProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
  className?: string;
}

const DEFAULT_MESSAGES = [
  "Calibrating target trajectory...",
  "Synthesizing high-leverage milestones...",
  "Analyzing capacity & cognitive bandwidth...",
  "Locking on execution roadmap...",
  "Forging daily action sprints...",
];

export function GoalForgeArrowLoader({
  message,
  subMessage,
  fullscreen = true,
  className = "",
}: GoalForgeArrowLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through inspirational tactical messages
  useEffect(() => {
    if (message) return; // If custom message provided, don't cycle
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % DEFAULT_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [message]);

  const activeMessage = message || DEFAULT_MESSAGES[messageIndex];

  const content = (
    <div className="relative flex flex-col items-center justify-center select-none text-center p-6 max-w-lg mx-auto">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute w-80 h-80 bg-amber-500/10 rounded-full blur-2xl animate-pulse-glow" />

      {/* Main Arrow to Target SVG Theatre */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
        <svg
          viewBox="-200 -200 400 400"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="targetCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
              <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="85%" stopColor="#ef4444" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="arrowTrailGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="arrowTrailGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
              <stop offset="60%" stopColor="#34d399" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="arrowTrailGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
              <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </linearGradient>

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="impactGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ================= BACKGROUND RADAR & CROSSHAIRS ================= */}
          {/* Axis Crosshairs */}
          <line
            x1="-170"
            y1="0"
            x2="170"
            y2="0"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <line
            x1="0"
            y1="-170"
            x2="0"
            y2="170"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Diagonal Guides */}
          <line
            x1="-120"
            y1="-120"
            x2="120"
            y2="120"
            stroke="rgba(99,102,241,0.08)"
            strokeWidth="1"
          />
          <line
            x1="120"
            y1="-120"
            x2="-120"
            y2="120"
            stroke="rgba(99,102,241,0.08)"
            strokeWidth="1"
          />

          {/* ================= THE TARGET (CONCENTRIC RINGS) ================= */}
          {/* Outer Ring 1 (Rotating tick ring) */}
          <g className="animate-spin-slow">
            <circle
              cx="0"
              cy="0"
              r="140"
              fill="none"
              stroke="rgba(99, 102, 241, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="8 14 2 14"
            />
            {/* Corner Bracket Reticles */}
            <path
              d="M -130 -140 L -140 -140 L -140 -130"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
            />
            <path
              d="M 130 -140 L 140 -140 L 140 -130"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
            />
            <path
              d="M -130 140 L -140 140 L -140 130"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
            />
            <path
              d="M 130 140 L 140 140 L 140 130"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
            />
          </g>

          {/* Outer Ring 2 (Segmented middle radar) */}
          <circle
            cx="0"
            cy="0"
            r="105"
            fill="none"
            stroke="rgba(245, 158, 11, 0.3)"
            strokeWidth="2"
            strokeDasharray="18 8"
          />

          {/* Middle Ring 3 (Solid Inner Ring) */}
          <circle
            cx="0"
            cy="0"
            r="70"
            fill="rgba(15, 23, 42, 0.4)"
            stroke="rgba(52, 211, 153, 0.45)"
            strokeWidth="2.5"
          />

          {/* Innermost Ring (Bullseye Perimeter) */}
          <circle
            cx="0"
            cy="0"
            r="38"
            fill="rgba(30, 27, 75, 0.6)"
            stroke="rgba(251, 191, 36, 0.7)"
            strokeWidth="3"
            filter="url(#glow)"
          />

          {/* Core Bullseye Node */}
          <circle
            cx="0"
            cy="0"
            r="16"
            fill="url(#targetCoreGrad)"
            filter="url(#impactGlow)"
            className="animate-pulse"
          />
          <circle cx="0" cy="0" r="5" fill="#ffffff" />

          {/* ================= SHOCKWAVES EMITTED ON IMPACT ================= */}
          {/* Shockwave 1 (Triggered with Arrow 1) */}
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="none"
            stroke="#fbbf24"
            className="shockwave-ring-1"
          />
          {/* Shockwave 2 (Triggered with Arrow 2) */}
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="none"
            stroke="#38bdf8"
            className="shockwave-ring-2"
          />
          {/* Shockwave 3 (Triggered with Arrow 3) */}
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="none"
            stroke="#34d399"
            className="shockwave-ring-3"
          />
          {/* Shockwave 4 (Triggered with Arrow 4) */}
          <circle
            cx="0"
            cy="0"
            r="10"
            fill="none"
            stroke="#f43f5e"
            className="shockwave-ring-4"
          />

          {/* ================= ARROWS FLYING IN FROM EVERY DIRECTION ================= */}

          {/* ARROW 1: Swoops from Top-Left into Dead Center */}
          <g className="arrow-incoming-1" filter="url(#glow)">
            {/* Luminous Vapor Trail */}
            <line
              x1="-130"
              y1="0"
              x2="-8"
              y2="0"
              stroke="url(#arrowTrailGrad1)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Secondary trail particles */}
            <line
              x1="-160"
              y1="-2"
              x2="-40"
              y2="-2"
              stroke="rgba(56, 189, 248, 0.4)"
              strokeWidth="1.5"
              strokeDasharray="6 8"
            />
            {/* Arrow Head (Cyber Falcon Tip) */}
            <polygon
              points="0,0 -22,-9 -16,0 -22,9"
              fill="#38bdf8"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Arrow Fletching / Fins */}
            <polygon
              points="-105,-8 -125,-12 -120,0 -125,12 -105,8"
              fill="rgba(129, 140, 248, 0.8)"
            />
            {/* Core impact spark head */}
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>

          {/* ARROW 2: Swoops from Bottom-Right into Dead Center */}
          <g className="arrow-incoming-2" filter="url(#glow)">
            {/* Vapor Trail */}
            <line
              x1="-140"
              y1="0"
              x2="-8"
              y2="0"
              stroke="url(#arrowTrailGrad2)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Arrow Head */}
            <polygon
              points="0,0 -24,-9 -17,0 -24,9"
              fill="#fbbf24"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Arrow Fletching */}
            <polygon
              points="-115,-8 -135,-12 -128,0 -135,12 -115,8"
              fill="rgba(52, 211, 153, 0.8)"
            />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>

          {/* ARROW 3: Swoops from Top-Right into Dead Center */}
          <g className="arrow-incoming-3" filter="url(#glow)">
            {/* Vapor Trail */}
            <line
              x1="-130"
              y1="0"
              x2="-8"
              y2="0"
              stroke="url(#arrowTrailGrad3)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Arrow Head */}
            <polygon
              points="0,0 -22,-8 -16,0 -22,8"
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Arrow Fletching */}
            <polygon
              points="-100,-7 -120,-11 -114,0 -120,11 -100,7"
              fill="rgba(244, 63, 94, 0.8)"
            />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>

          {/* ARROW 4: High-Velocity Piercing from Left-Bottom */}
          <g className="arrow-incoming-4" filter="url(#glow)">
            {/* Vapor Trail */}
            <line
              x1="-150"
              y1="0"
              x2="-8"
              y2="0"
              stroke="url(#arrowTrailGrad1)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Arrow Head */}
            <polygon
              points="0,0 -24,-10 -18,0 -24,10"
              fill="#a855f7"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Arrow Fletching */}
            <polygon
              points="-120,-9 -140,-13 -132,0 -140,13 -120,9"
              fill="rgba(168, 85, 247, 0.8)"
            />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>

          {/* Impact Sparks Burst Center Node */}
          <g className="impact-sparks-burst">
            <line x1="-15" y1="-15" x2="15" y2="15" stroke="#fbbf24" strokeWidth="2" />
            <line x1="15" y1="-15" x2="-15" y2="15" stroke="#fbbf24" strokeWidth="2" />
            <line x1="0" y1="-20" x2="0" y2="20" stroke="#ffffff" strokeWidth="2" />
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#ffffff" strokeWidth="2" />
          </g>
        </svg>

        {/* Dynamic Center Hit Target Icon Accent */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/50 animate-ping" />
        </div>
      </div>

      {/* Dynamic Status Display & Telemetry */}
      <div className="mt-8 space-y-3 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-mono shadow-md backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>GOALFORGE COGNITIVE ENGINE</span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <span>{activeMessage}</span>
        </h3>

        <p className="text-xs text-slate-400 max-w-sm font-mono">
          {subMessage || "Locking target coordinates and aligning execution velocity..."}
        </p>

        {/* Futuristic Scanning Progress Bar */}
        <div className="relative w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto mt-4 border border-white/5">
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 rounded-full animate-loader-scan" />
        </div>
      </div>

      {/* Scoped CSS Keyframe Animations for High-Speed Arrow Flights and Impacts */}
      <style jsx>{`
        /* Arrow 1: Top-Left at 35deg */
        .arrow-incoming-1 {
          animation: flightArrow1 2.4s cubic-bezier(0.2, 0.9, 0.2, 1) infinite;
        }
        @keyframes flightArrow1 {
          0% {
            transform: translate(-260px, -180px) rotate(35deg) scale(0.6);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          24% {
            transform: translate(0px, 0px) rotate(35deg) scale(1);
            opacity: 1;
          }
          26% {
            transform: translate(0px, 0px) rotate(35deg) scale(1.1);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        /* Arrow 2: Bottom-Right at 215deg */
        .arrow-incoming-2 {
          animation: flightArrow2 2.4s cubic-bezier(0.2, 0.9, 0.2, 1) infinite;
          animation-delay: 0.6s;
        }
        @keyframes flightArrow2 {
          0% {
            transform: translate(260px, 180px) rotate(215deg) scale(0.6);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          24% {
            transform: translate(0px, 0px) rotate(215deg) scale(1);
            opacity: 1;
          }
          26% {
            transform: translate(0px, 0px) rotate(215deg) scale(1.1);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        /* Arrow 3: Top-Right at 145deg */
        .arrow-incoming-3 {
          animation: flightArrow3 2.4s cubic-bezier(0.2, 0.9, 0.2, 1) infinite;
          animation-delay: 1.2s;
        }
        @keyframes flightArrow3 {
          0% {
            transform: translate(240px, -170px) rotate(145deg) scale(0.6);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          24% {
            transform: translate(0px, 0px) rotate(145deg) scale(1);
            opacity: 1;
          }
          26% {
            transform: translate(0px, 0px) rotate(145deg) scale(1.1);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        /* Arrow 4: Bottom-Left at -20deg */
        .arrow-incoming-4 {
          animation: flightArrow4 2.4s cubic-bezier(0.2, 0.9, 0.2, 1) infinite;
          animation-delay: 1.8s;
        }
        @keyframes flightArrow4 {
          0% {
            transform: translate(-250px, 120px) rotate(-20deg) scale(0.6);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          24% {
            transform: translate(0px, 0px) rotate(-20deg) scale(1);
            opacity: 1;
          }
          26% {
            transform: translate(0px, 0px) rotate(-20deg) scale(1.1);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        /* Shockwave rings timed to each arrow impact */
        .shockwave-ring-1 {
          animation: rippleShock 2.4s ease-out infinite;
          animation-delay: 0.58s;
        }
        .shockwave-ring-2 {
          animation: rippleShock 2.4s ease-out infinite;
          animation-delay: 1.18s;
        }
        .shockwave-ring-3 {
          animation: rippleShock 2.4s ease-out infinite;
          animation-delay: 1.78s;
        }
        .shockwave-ring-4 {
          animation: rippleShock 2.4s ease-out infinite;
          animation-delay: 2.38s;
        }

        @keyframes rippleShock {
          0% {
            r: 16px;
            opacity: 1;
            stroke-width: 4px;
          }
          40% {
            r: 110px;
            opacity: 0.7;
            stroke-width: 2px;
          }
          80%, 100% {
            r: 150px;
            opacity: 0;
            stroke-width: 0.5px;
          }
        }

        /* Spark burst on impact */
        .impact-sparks-burst {
          animation: sparkPulse 0.6s ease-out infinite;
        }
        @keyframes sparkPulse {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          50% {
            transform: scale(1.8) rotate(30deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.4) rotate(60deg);
            opacity: 0;
          }
        }

        @keyframes loaderScan {
          0% {
            left: -35%;
          }
          100% {
            left: 100%;
          }
        }
        .animate-loader-scan {
          animation: loaderScan 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

  if (!fullscreen) {
    return <div className={`relative ${className}`}>{content}</div>;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#070a12]/90 backdrop-blur-xl animate-fadeIn ${className}`}
      role="status"
      aria-live="polite"
    >
      {content}
    </div>
  );
}
