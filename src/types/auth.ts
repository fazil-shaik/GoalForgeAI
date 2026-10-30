export type CoachingStyle = "compassionate" | "direct" | "analytical";

export interface UserPreferences {
  timezone: string;
  availableMinutesPerDay: number;
  availableDays: string[];
  coachingStyle: CoachingStyle;
  primaryCategory: string;
  isPublic?: boolean;
  bio?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  onboardingCompleted?: boolean;
  pushNotificationsEnabled?: boolean;
  dailyBriefingTime?: string;
  dailyBriefingEnabled?: boolean;
  streakRemindersEnabled?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  isPublic?: boolean;
  preferences: UserPreferences;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
