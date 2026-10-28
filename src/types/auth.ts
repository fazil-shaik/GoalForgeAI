export type CoachingStyle = "compassionate" | "direct" | "analytical";

export interface UserPreferences {
  timezone: string;
  availableMinutesPerDay: number;
  availableDays: string[];
  coachingStyle: CoachingStyle;
  primaryCategory: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
