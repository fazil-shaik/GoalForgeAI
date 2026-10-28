import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export class UserRepository {
  static async findByEmail(email: string) {
    const db = getDb();
    if (!db) return null;
    const res = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return res[0] || null;
  }

  static async findById(id: string) {
    const db = getDb();
    if (!db) return null;
    const res = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return res[0] || null;
  }

  static async updatePreferences(
    userId: string,
    preferences: Partial<typeof users.$inferSelect.preferences>
  ) {
    const db = getDb();
    if (!db) return null;
    const current = await this.findById(userId);
    const updatedPrefs = { ...(current?.preferences || {}), ...preferences };
    const res = await db
      .update(users)
      .set({ preferences: updatedPrefs as any, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return res[0] || null;
  }
}
