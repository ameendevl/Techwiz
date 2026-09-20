import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(64),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]).default("ACTIVE"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { name, username, email, password, role, status } = result.data;

    if (role !== "USER" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Only Super Admins can assign Admin or Super Admin roles." },
        { status: 403 }
      );
    }

    const existingEmail = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const existingUsername = await db.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return NextResponse.json(
        { message: "This username is already taken." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
          role,
          status,
          emailVerified: status === "ACTIVE" ? new Date() : null,
          profile: {
            create: {},
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "USER_CREATED",
          targetId: user.id,
          targetType: "User",
          metadata: {
            createdUserEmail: user.email,
            createdUserRole: user.role,
            createdBy: session.user.email,
          },
          status: "success",
        },
      });

      return user;
    });

    return NextResponse.json(
      {
        message: "User created successfully.",
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN_CREATE_USER]", error);
    return NextResponse.json(
      { message: "Internal server error occurred while creating user." },
      { status: 500 }
    );
  }
}
