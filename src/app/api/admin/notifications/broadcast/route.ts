import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { broadcastNotificationSchema } from "@/lib/validations";

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
    const result = broadcastNotificationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { title, body: msgBody, type, targetRole, link } = result.data;

    const where: any = { status: { not: "DELETED" } };
    if (targetRole !== "ALL") {
      where.role = targetRole;
    }

    const users = await db.user.findMany({
      where,
      select: { id: true },
    });

    if (users.length === 0) {
      return NextResponse.json({ message: "No recipients found" }, { status: 400 });
    }

    const notificationsData = users.map((u) => ({
      id: crypto.randomUUID(),
      userId: u.id,
      title,
      body: msgBody,
      type: type as any,
      link: link || null,
    }));

    await db.notification.createMany({
      data: notificationsData,
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ADMIN_ACTION",
        targetType: "Notification",
        metadata: {
          broadcast: true,
          recipientCount: users.length,
          targetRole,
          title,
        },
        status: "success",
      },
    });

    return NextResponse.json({
      message: `Notification broadcast to ${users.length} user(s)`,
      count: users.length,
    });
  } catch (error) {
    console.error("Broadcast notification error:", error);
    return NextResponse.json(
      { message: "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}
