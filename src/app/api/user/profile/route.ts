import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { name, username, bio, phone, location, website, socialLinks } = parsed.data;

    if (username) {
      const existing = await db.user.findFirst({
        where: { username, id: { not: session.user.id } },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Username already taken.", field: "username" },
          { status: 409 }
        );
      }
    }

    const sanitizedWebsite = website?.trim()
      ? website.trim().startsWith("http://") || website.trim().startsWith("https://")
        ? website.trim()
        : `https://${website.trim()}`
      : null;

    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { name, username },
      }),
      db.profile.upsert({
        where: { userId: session.user.id },
        update: {
          bio: bio ?? null,
          phone: phone ?? null,
          location: location ?? null,
          website: sanitizedWebsite,
          socialLinks: socialLinks ?? {},
        },
        create: {
          userId: session.user.id,
          bio: bio ?? null,
          phone: phone ?? null,
          location: location ?? null,
          website: sanitizedWebsite,
          socialLinks: socialLinks ?? {},
        },
      }),
      db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "USER_PROFILE_UPDATE",
          status: "success",
        },
      }),
    ]);

    return NextResponse.json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
