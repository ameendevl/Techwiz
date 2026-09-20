import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const logs = await db.auditLog.findMany({
    take: 1000,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true, role: true } },
    },
  });

  const headers = ["Timestamp", "Action", "User Name", "User Email", "Role", "Target ID", "Target Type", "IP Address", "Status"];
  const rows = logs.map((log) => [
    `"${log.createdAt.toISOString()}"`,
    `"${log.action}"`,
    `"${(log.user?.name || "").replace(/"/g, '""')}"`,
    `"${(log.user?.email || "System").replace(/"/g, '""')}"`,
    `"${log.user?.role || "SYSTEM"}"`,
    `"${log.targetId || ""}"`,
    `"${log.targetType || ""}"`,
    `"${log.ip || ""}"`,
    `"${log.status}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="audit_logs.csv"',
    },
  });
}
