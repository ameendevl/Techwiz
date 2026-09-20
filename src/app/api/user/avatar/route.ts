import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file provided." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "File must be an image." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File must be less than 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { image: dataUri },
      }),
      db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "USER_AVATAR_UPDATE",
          status: "success",
        },
      }),
    ]);

    return NextResponse.json({ message: "Avatar updated successfully.", imageUrl: dataUri });
  } catch (error) {
    console.error("[AVATAR_POST]", error);
    return NextResponse.json({ message: "Upload failed." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { image: null },
      }),
      db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "USER_AVATAR_UPDATE",
          metadata: { action: "removed" },
          status: "success",
        },
      }),
    ]);

    return NextResponse.json({ message: "Avatar removed successfully." });
  } catch (error) {
    console.error("[AVATAR_DELETE]", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
