import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Activity, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Login Activity — Admin" };

export default async function AdminActivityPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const activities = await db.loginActivity.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, role: true },
      },
    },
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
          Login Activity
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
          Recent authentication attempts, device signatures, and IP addresses
        </p>
      </div>

      <Card padding="none">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Provider</th>
                <th>Device / User Agent</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => (
                <tr key={act.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar src={act.user.image} name={act.user.name} size="sm" />
                      <div>
                        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                          {act.user.name}
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                          {act.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8125rem", textTransform: "capitalize", color: "var(--color-text-secondary)" }}>
                      {act.provider.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", maxWidth: 200, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {act.device || act.userAgent || "Desktop Browser"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--color-text-secondary)" }}>
                      {act.ip || "127.0.0.1"}
                    </span>
                  </td>
                  <td>
                    {act.status === "success" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-success)", fontSize: "0.75rem", fontWeight: 500 }}>
                        <CheckCircle2 size={13} /> Authorized
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-danger)", fontSize: "0.75rem", fontWeight: 500 }}>
                        <XCircle size={13} /> {act.failReason || "Failed"}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                    {formatRelativeTime(act.createdAt)}
                  </td>
                </tr>
              ))}

              {activities.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                    <Activity size={28} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                      No login activities recorded
                    </p>
                    <p style={{ fontSize: "0.75rem", marginTop: 4 }}>
                      Authentication events will be recorded here in real-time.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
