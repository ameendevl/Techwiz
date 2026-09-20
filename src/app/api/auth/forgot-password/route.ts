import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed } = checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000); 
    if (!allowed) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !user.password) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); 

    await db.passwordResetToken.create({
      data: { userId: user.id, token, expires },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[DEV] Password reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      );
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_PASSWORD_CHANGE",
        metadata: { step: "reset_requested" },
        ip,
        status: "success",
      },
    });

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  }
}
