import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { UserRepository } from "@/server/repositories/user.repository";
import { ensureDatabaseInitialized } from "@/db/init";

export async function GET() {
  await ensureDatabaseInitialized();
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await UserRepository.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio || (user.preferences as any)?.bio || "",
      isPublic: user.isPublic ?? (user.preferences as any)?.isPublic ?? true,
      timezone: user.timezone || (user.preferences as any)?.timezone || "UTC",
      preferences: user.preferences,
      createdAt: user.createdAt,
    },
  });
}

export async function PATCH(req: Request) {
  await ensureDatabaseInitialized();
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = await UserRepository.updateProfile(userId, {
      name: body.name,
      image: body.image,
      bio: body.bio,
      isPublic: body.isPublic,
      timezone: body.timezone,
      preferences: body.preferences,
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
        bio: updated.bio || (updated.preferences as any)?.bio || "",
        isPublic: updated.isPublic ?? (updated.preferences as any)?.isPublic ?? true,
        timezone: updated.timezone || (updated.preferences as any)?.timezone || "UTC",
        preferences: updated.preferences,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err: any) {
    console.error("[Profile API] Error updating profile:", err);
    return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500 });
  }
}
