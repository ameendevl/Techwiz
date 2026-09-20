import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { editUserSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = editUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { name, username, email, role, status } = parsed.data;

    if (role && role !== "USER" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Only super admins can change roles." }, { status: 403 });
    }

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) return NextResponse.json({ message: "User not found." }, { status: 404 });
    if (targetUser.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Cannot edit a Super Admin account." }, { status: 403 });
    }

    const existingUsername = await db.user.findFirst({
      where: { username, id: { not: id } },
    });
    if (existingUsername) {
      return NextResponse.json({ message: "Username already taken." }, { status: 409 });
    }

    const updatedUser = await db.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { name, username, email, role, status },
      });
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "ADMIN_ACTION",
          targetId: id,
          targetType: "User",
          metadata: { action: "edit_user", changes: { name, username, email, role, status } },
          status: "success",
        },
      });
      return user;
    });

    return NextResponse.json({ message: "User updated.", user: updatedUser });
  } catch (error) {
    console.error("[ADMIN_USER_PATCH]", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Only Super Admins can delete users." }, { status: 403 });
    }

    const { id } = await params;
    if (id === session.user.id) {
      return NextResponse.json({ message: "You cannot delete your own account." }, { status: 400 });
    }

    await db.$transaction([
      db.user.update({ where: { id }, data: { status: "DELETED" } }),
      db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "USER_DELETED",
          targetId: id,
          targetType: "User",
          status: "success",
        },
      }),
    ]);

    return NextResponse.json({ message: "User deleted." });
  } catch (error) {
    console.error("[ADMIN_USER_DELETE]", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
