import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { action, userIds } = await request.json();

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    }

    const filteredIds = userIds.filter((id) => id !== session.user.id);

    switch (action) {
      case "activate":
        await db.user.updateMany({
          where: { id: { in: filteredIds } },
          data: { status: "ACTIVE" },
        });
        await db.auditLog.create({
          data: {
            userId: session.user.id,
            action: "USER_ACTIVATED",
            metadata: { userIds: filteredIds, count: filteredIds.length },
            status: "success",
          },
        });
        return NextResponse.json({ message: `${filteredIds.length} users activated.` });

      case "suspend":
        await db.user.updateMany({
          where: { id: { in: filteredIds } },
          data: { status: "SUSPENDED" },
        });
        await db.auditLog.create({
          data: {
            userId: session.user.id,
            action: "USER_SUSPENDED",
            metadata: { userIds: filteredIds, count: filteredIds.length },
            status: "success",
          },
        });
        return NextResponse.json({ message: `${filteredIds.length} users suspended.` });

      case "delete":
        if (session.user.role !== "SUPER_ADMIN") {
          return NextResponse.json({ message: "Only Super Admins can delete users." }, { status: 403 });
        }
        await db.user.updateMany({
          where: { id: { in: filteredIds } },
          data: { status: "DELETED" },
        });
        await db.auditLog.create({
          data: {
            userId: session.user.id,
            action: "USER_DELETED",
            metadata: { userIds: filteredIds, count: filteredIds.length, bulk: true },
            status: "success",
          },
        });
        return NextResponse.json({ message: `${filteredIds.length} users deleted.` });

      case "verify":
        await db.user.updateMany({
          where: { id: { in: filteredIds } },
          data: { emailVerified: new Date(), status: "ACTIVE" },
        });
        await db.auditLog.create({
          data: {
            userId: session.user.id,
            action: "USER_EMAIL_VERIFIED",
            metadata: { userIds: filteredIds, verifiedByAdmin: true },
            status: "success",
          },
        });
        return NextResponse.json({ message: `${filteredIds.length} users verified.` });

      default:
        return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    console.error("[BULK_USERS]", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}
