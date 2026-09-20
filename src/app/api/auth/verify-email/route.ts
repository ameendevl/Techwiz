import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ message: "Invalid token." }, { status: 400 });
    }

    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json(
        { message: "This verification link is invalid or has expired." },
        { status: 400 }
      );
    }

    await db.$transaction([
      db.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: new Date(),
          status: "ACTIVE",
        },
      }),
      db.verificationToken.delete({ where: { id: verificationToken.id } }),
      db.auditLog.create({
        data: {
          userId: verificationToken.userId,
          action: "USER_EMAIL_VERIFIED",
          status: "success",
        },
      }),
      db.notification.create({
        data: {
          userId: verificationToken.userId,
          type: "ACCOUNT",
          title: "Email verified",
          body: "Your email address has been verified. Welcome to Vertex!",
        },
      }),
    ]);

    return NextResponse.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
