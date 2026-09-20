import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const logs = await db.auditLog.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true, name: true, role: true },
      },
    },
  });

  return new NextResponse(JSON.stringify(logs, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="audit_logs.json"',
    },
  });
}
