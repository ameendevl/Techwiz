import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BroadcastForm } from "@/components/admin/BroadcastForm";
import { Bell, Send, Radio } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notification Center — Admin" };

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const recentBroadcasts = await db.auditLog.findMany({
    where: {
      action: "ADMIN_ACTION",
      targetType: "Notification",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
          Notification Center
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
          Broadcast announcements and critical alerts to users across the platform
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Radio size={16} />
              </div>
              <div>
                <CardTitle>Compose Broadcast</CardTitle>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                  Directly populates in-app notifications for chosen audience
                </p>
              </div>
            </div>
          </CardHeader>
          <BroadcastForm />
        </Card>

        <Card padding="none">
          <CardHeader style={{ padding: "16px 20px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={16} style={{ color: "var(--color-text-muted)" }} />
              <CardTitle>Broadcast History</CardTitle>
            </div>
          </CardHeader>

          <div>
            {recentBroadcasts.map((b, i) => {
              const meta = b.metadata as any;
              return (
                <div
                  key={b.id}
                  style={{
                    padding: "14px 20px",
                    borderBottom: i < recentBroadcasts.length - 1 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {meta?.title || "System Announcement"}
                    </p>
                    <Badge variant="default" size="sm">
                      {meta?.targetRole || "ALL"}
                    </Badge>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: 6 }}>
                    Delivered to {meta?.recipientCount ?? "all"} users • By {b.user?.name ?? "Admin"}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", opacity: 0.8 }}>
                    {formatRelativeTime(b.createdAt)}
                  </p>
                </div>
              );
            })}

            {recentBroadcasts.length === 0 && (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                <p style={{ fontSize: "0.8125rem" }}>No broadcasts sent yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
