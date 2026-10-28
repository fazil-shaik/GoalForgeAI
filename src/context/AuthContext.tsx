"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserPreferences, CoachingStyle } from "@/types/auth";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    pass: string,
    preferences?: Partial<UserPreferences>
  ) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (persona: "learner" | "professional" | "starter") => void;
  updateProfile: (updated: Partial<UserProfile> | { preferences: Partial<UserPreferences> }) => void;
  logout: () => void;
}

const STORAGE_KEY = "goalforge_auth_user";

export const DEMO_PERSONAS: Record<string, UserProfile> = {
  learner: {
    id: "usr_learner_01",
    name: "Alex Rivera",
    email: "alex.learner@goalforge.ai",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    preferences: {
      timezone: "America/New_York",
      availableMinutesPerDay: 45,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      coachingStyle: "compassionate",
      primaryCategory: "Software Engineering & AI",
    },
    createdAt: "2026-10-01T08:00:00Z",
  },
  professional: {
    id: "usr_pro_02",
    name: "Sarah Chen",
    email: "sarah.chen@goalforge.ai",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    preferences: {
      timezone: "America/Los_Angeles",
      availableMinutesPerDay: 30,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      coachingStyle: "direct",
      primaryCategory: "Leadership & Executive Work",
    },
    createdAt: "2026-10-10T12:00:00Z",
  },
  starter: {
    id: "usr_starter_03",
    name: "Marcus Vance",
    email: "marcus.vance@goalforge.ai",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    preferences: {
      timezone: "Europe/London",
      availableMinutesPerDay: 60,
      availableDays: ["Monday", "Wednesday", "Friday", "Sunday"],
      coachingStyle: "compassionate",
      primaryCategory: "Health, Habits & Fitness",
    },
    createdAt: "2026-10-15T15:30:00Z",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to Alex Rivera demo user for frictionless immediate exploration
        setUser(DEMO_PERSONAS.learner);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PERSONAS.learner));
      }
    } catch {
      setUser(DEMO_PERSONAS.learner);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (u: UserProfile | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string) => {
    // Check demo profiles or create session
    const demo = Object.values(DEMO_PERSONAS).find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (demo) {
      saveUser(demo);
      return { success: true };
    }

    const newUser: UserProfile = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      preferences: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        availableMinutesPerDay: 45,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        coachingStyle: "compassionate",
        primaryCategory: "Personal Development",
      },
      createdAt: new Date().toISOString(),
    };
    saveUser(newUser);
    return { success: true };
  };

  const signup = async (
    name: string,
    email: string,
    _pass: string,
    preferences?: Partial<UserPreferences>
  ) => {
    const newUser: UserProfile = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
      preferences: {
        timezone: preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        availableMinutesPerDay: preferences?.availableMinutesPerDay || 45,
        availableDays: preferences?.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        coachingStyle: preferences?.coachingStyle || "compassionate",
        primaryCategory: preferences?.primaryCategory || "General Ambition",
      },
      createdAt: new Date().toISOString(),
    };
    saveUser(newUser);
    return { success: true };
  };

  const loginAsDemo = (persona: "learner" | "professional" | "starter") => {
    const p = DEMO_PERSONAS[persona];
    if (p) {
      saveUser(p);
    }
  };

  const updateProfile = (updated: Partial<UserProfile> | { preferences: Partial<UserPreferences> }) => {
    if (!user) return;
    let nextUser: UserProfile;
    if ("preferences" in updated && updated.preferences) {
      nextUser = {
        ...user,
        preferences: {
          ...user.preferences,
          ...updated.preferences,
        },
      };
    } else {
      nextUser = {
        ...user,
        ...(updated as Partial<UserProfile>),
      };
    }
    saveUser(nextUser);
  };

  const logout = () => {
    saveUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        loginAsDemo,
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
