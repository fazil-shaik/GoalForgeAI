"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { UserProfile, UserPreferences } from "@/types/auth";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isProfileLoaded: boolean;
  isAuthenticated: boolean;
  updateProfile: (updated: {
    name?: string;
    image?: string;
    bio?: string;
    isPublic?: boolean;
    timezone?: string;
    preferences?: Partial<UserPreferences>;
  }) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Fetch full profile from Neon DB
  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setIsProfileLoaded(false);
      return;
    }
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile({
            id: data.user.id,
            name: data.user.name || "GoalForge Explorer",
            email: data.user.email || "",
            avatarUrl: data.user.image || undefined,
            bio: data.user.bio || "",
            isPublic: data.user.isPublic ?? true,
            preferences: data.user.preferences || {
              timezone: data.user.timezone || "UTC",
              availableMinutesPerDay: 45,
              availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              coachingStyle: "compassionate",
              primaryCategory: "Software Engineering & Cloud",
              isPublic: true,
              onboardingCompleted: false,
            },
            createdAt: data.user.createdAt || new Date().toISOString(),
          });
        }
      }
    } catch {
      // safe fallback
    } finally {
      setIsProfileLoaded(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    } else {
      setProfile(null);
      setIsProfileLoaded(false);
    }
  }, [isAuthenticated, refreshProfile]);

  // Fallback initial user from session while profile loads
  const user: UserProfile | null = profile || (isAuthenticated && session?.user
    ? {
        id: (session.user as any).id || "usr_google",
        name: session.user.name || "GoalForge Explorer",
        email: session.user.email || "",
        avatarUrl: session.user.image || undefined,
        bio: "",
        isPublic: true,
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
          isPublic: true,
        },
        createdAt: new Date().toISOString(),
      }
    : null);

  const updateProfile = async (updated: {
    name?: string;
    image?: string;
    bio?: string;
    isPublic?: boolean;
    timezone?: string;
    preferences?: Partial<UserPreferences>;
  }): Promise<boolean> => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();

      if (data.user) {
        setProfile((prev) => ({
          ...(prev || ({} as any)),
          ...data.user,
          avatarUrl: data.user.image || prev?.avatarUrl,
        }));
      }
      return true;
    } catch {
      return false;
    }
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
        isProfileLoaded,
        isAuthenticated,
        updateProfile,
        refreshProfile,
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
