import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { generateUsername } from "@/lib/utils";
import { checkRateLimit } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed } = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000); 
    if (!allowed) {
      return NextResponse.json(
        { message: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { message: firstError.message, field: firstError.path[0] },
        { status: 400 }
      );
    }

    const { name, username, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    const existingEmail = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { message: "An account with this email already exists.", field: "email" },
        { status: 409 }
      );
    }

    const existingUsername = await db.user.findUnique({
      where: { username: normalizedUsername },
    });
    if (existingUsername) {
      return NextResponse.json(
        { message: "This username is already taken.", field: "username" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          username: normalizedUsername,
          email: normalizedEmail,
          password: hashedPassword,
          status: "PENDING_VERIFICATION",
          role: "USER",
        },
      });

      await tx.profile.create({ data: { userId: newUser.id } });

      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: "USER_REGISTER",
          metadata: { method: "credentials" },
          ip,
          status: "success",
        },
      });

      return newUser;
    });

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await db.verificationToken.create({
      data: { userId: user.id, token, expires },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[DEV] Email verification link: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
      );
    }

    return NextResponse.json(
      { message: "Account created successfully. Please verify your email." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
