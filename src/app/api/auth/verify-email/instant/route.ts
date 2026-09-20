import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          status: "ACTIVE",
        },
      }),
      db.verificationToken.deleteMany({
        where: { userId: user.id },
      }),
      db.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_EMAIL_VERIFIED",
          metadata: { method: "instant_dev_mode" },
          status: "success",
        },
      }),
    ]);

    return NextResponse.json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("[INSTANT_VERIFY]", error);
    return NextResponse.json({ message: "Verification failed." }, { status: 500 });
  }
}
