import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDb } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Save / update real user and account in Neon PostgreSQL database
      try {
        const db = getDb();
        if (db) {
          // 1. Check or insert into users table
          const existingUsers = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          let dbUserId: string;

          if (existingUsers.length > 0) {
            dbUserId = existingUsers[0].id;
            // Update name and avatar if changed
            await db
              .update(users)
              .set({
                name: user.name || existingUsers[0].name,
                image: user.image || existingUsers[0].image,
                updatedAt: new Date(),
              })
              .where(eq(users.id, dbUserId));
          } else {
            const inserted = await db
              .insert(users)
              .values({
                name: user.name || "GoalForge Explorer",
                email: user.email,
                image: user.image,
                emailVerified: new Date(),
                timezone:
                  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
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
              })
              .returning();
            dbUserId = inserted[0].id;
          }

          // 2. Link account record if account provided
          if (account && account.providerAccountId) {
            const existingAccount = await db
              .select()
              .from(accounts)
              .where(
                and(
                  eq(accounts.provider, account.provider),
                  eq(accounts.providerAccountId, account.providerAccountId)
                )
              )
              .limit(1);

            if (existingAccount.length === 0) {
              await db.insert(accounts).values({
                userId: dbUserId,
                type: account.type || "oauth",
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: (account as any).session_state,
              });
            }
          }

          // Attach database UUID to user object so jwt callback receives it
          (user as any).dbId = dbUserId;
        }
      } catch (err) {
        console.error("Database save error during Google OAuth signIn:", err);
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Guarantee redirect to /dashboard after Google authentication
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = (user as any).dbId || user.id || token.sub;
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
  secret:
    process.env.NEXTAUTH_SECRET ||
    "goalforge_super_secure_jwt_secret_dev_32_chars",
};
