import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    }

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword: password });
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Invalid password." },
        { status: 400 }
      );
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      db.auditLog.create({
        data: {
          userId: resetToken.userId,
          action: "USER_PASSWORD_CHANGE",
          metadata: { step: "reset_completed" },
          status: "success",
        },
      }),
    ]);

    return NextResponse.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
