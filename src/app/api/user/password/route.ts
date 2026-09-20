import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json(
        { message: "This account uses OAuth and does not have a password." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      }),
      db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "USER_PASSWORD_CHANGE",
          status: "success",
        },
      }),
      db.notification.create({
        data: {
          userId: session.user.id,
          type: "SECURITY",
          title: "Password changed",
          body: "Your account password was changed successfully. If this wasn't you, contact support immediately.",
        },
      }),
    ]);

    return NextResponse.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("[PASSWORD_PATCH]", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
