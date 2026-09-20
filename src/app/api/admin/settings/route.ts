import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const settings = await db.systemSetting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ message: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Only Super Admins can update system settings" }, { status: 403 });
    }

    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string" || typeof value === "boolean") {
        await db.systemSetting.upsert({
          where: { key },
          create: {
            key,
            value: String(value),
            updatedBy: session.user.id,
          },
          update: {
            value: String(value),
            updatedBy: session.user.id,
          },
        });
      }
    }

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SETTINGS_CHANGED",
        targetType: "SystemSetting",
        metadata: body,
        status: "success",
      },
    });

    return NextResponse.json({ message: "System settings saved successfully" });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
  }
}
