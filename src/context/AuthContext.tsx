"use client";

import React, { createContext, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import { UserProfile, UserPreferences } from "@/types/auth";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateProfile: (updated: { preferences: Partial<UserPreferences> }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;

  const user: UserProfile | null = isAuthenticated && session?.user
    ? {
        id: (session.user as any).id || "usr_google",
        name: session.user.name || "GoalForge Explorer",
        email: session.user.email || "",
        avatarUrl: session.user.image || undefined,
        preferences: (session.user as any).preferences || {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          availableMinutesPerDay: 45,
          availableDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
          coachingStyle: "compassionate",
          primaryCategory: "Software Engineering & Cloud",
        },
        createdAt: new Date().toISOString(),
      }
    : null;

  const updateProfile = (updated: { preferences: Partial<UserPreferences> }) => {
    // Sync preferences if needed
    console.log("Updating profile preferences:", updated);
  };

  const logout = () => {
    document.cookie = "goalforge_session=; path=/; max-age=0";
    signOut({ callbackUrl: "/auth" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
