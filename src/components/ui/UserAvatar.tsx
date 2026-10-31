"use client";

import React, { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function UserAvatar({
  src,
  name,
  className = "",
  size = "md",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Compute 1-2 letter initials
  const initials =
    (name || "GF")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "GF";

  // Pre-generate dynamic color gradient based on name character hash
  const colors = [
    "from-indigo-600 to-emerald-500",
    "from-cyan-600 to-indigo-600",
    "from-emerald-600 to-teal-500",
    "from-amber-500 to-rose-500",
    "from-purple-600 to-indigo-500",
  ];
  const charCode = (name || "G").charCodeAt(0) || 0;
  const gradient = colors[charCode % colors.length];

  const sizeClasses = {
    sm: "w-7 h-7 text-[10px] rounded-lg",
    md: "w-8 h-8 text-xs rounded-xl",
    lg: "w-10 h-10 text-sm rounded-xl",
    xl: "w-14 h-14 text-base rounded-2xl",
  }[size];

  // If valid image provided and no error loading it
  if (src && !hasError && src.trim() !== "") {
    return (
      <div
        className={`relative overflow-hidden shrink-0 border border-white/10 ${sizeClasses} ${className}`}
      >
        <img
          src={src}
          alt={name || "User Avatar"}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback Initials Avatar with smooth glow
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-tr ${gradient} shadow-md shadow-indigo-500/20 border border-white/15 select-none ${sizeClasses} ${className}`}
      title={name || "User"}
      aria-label={name || "User"}
    >
      <span className="tracking-tight">{initials}</span>
    </div>
  );
}
