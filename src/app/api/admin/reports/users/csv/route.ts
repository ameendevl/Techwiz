import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["ID", "Name", "Username", "Email", "Role", "Status", "Email Verified", "Last Login", "Created At"];
  const rows = users.map((u) => [
    `"${u.id}"`,
    `"${(u.name || "").replace(/"/g, '""')}"`,
    `"${(u.username || "").replace(/"/g, '""')}"`,
    `"${(u.email || "").replace(/"/g, '""')}"`,
    `"${u.role}"`,
    `"${u.status}"`,
    `"${u.emailVerified ? u.emailVerified.toISOString() : "No"}"`,
    `"${u.lastLoginAt ? u.lastLoginAt.toISOString() : "Never"}"`,
    `"${u.createdAt.toISOString()}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="users_export.csv"',
    },
  });
}
