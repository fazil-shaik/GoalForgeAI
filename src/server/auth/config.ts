import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Sync or persist to Neon PostgreSQL if database connection is available
      try {
        const db = getDb();
        if (db) {
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          if (existing.length === 0) {
            await db.insert(users).values({
              name: user.name || "GoalForge Explorer",
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
              preferences: {
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
            });
          }
        }
      } catch (err) {
        console.error("Error syncing Google OAuth user to database:", err);
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).preferences = (token as any).preferences || {
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
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "goalforge_super_secure_jwt_secret_dev_32_chars",
};
