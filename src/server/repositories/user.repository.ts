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

  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      image?: string;
      bio?: string;
      isPublic?: boolean;
      timezone?: string;
      preferences?: Partial<typeof users.$inferSelect.preferences>;
    }
  ) {
    const db = getDb();
    if (!db) return null;
    const current = await this.findById(userId);
    if (!current) return null;

    const updatedPrefs = {
      ...(current.preferences || {}),
      ...(data.preferences || {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.isPublic !== undefined ? { isPublic: data.isPublic } : {}),
      ...(data.timezone ? { timezone: data.timezone } : {}),
    };

    const updateFields: any = {
      updatedAt: new Date(),
      preferences: updatedPrefs,
    };
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.image !== undefined) updateFields.image = data.image;
    if (data.bio !== undefined) updateFields.bio = data.bio;
    if (data.isPublic !== undefined) updateFields.isPublic = data.isPublic;
    if (data.timezone !== undefined) updateFields.timezone = data.timezone;

    const res = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, userId))
      .returning();

    return res[0] || null;
  }
}
