import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MarkNotificationsRead } from "@/components/notifications/MarkNotificationsRead";
import { Bell, Shield, Info, Megaphone, User } from "lucide-react";
import { EmptyState } from "@/components/ui/Skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notifications" };

const typeConfig = {
  SYSTEM: { icon: <Info size={15} />, color: "var(--color-info)", bg: "var(--color-info-light)" },
  ACCOUNT: { icon: <User size={15} />, color: "var(--color-accent)", bg: "var(--color-accent-light)" },
  SECURITY: { icon: <Shield size={15} />, color: "var(--color-warning)", bg: "var(--color-warning-light)" },
  ANNOUNCEMENT: { icon: <Megaphone size={15} />, color: "#9d174d", bg: "#fdf2f8" },
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
            Notifications
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && <MarkNotificationsRead />}
      </div>

      <Card padding="none">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={24} />}
            title="No notifications yet"
            description="You'll see account updates, security alerts, and announcements here."
          />
        ) : (
          <div>
            {notifications.map((notification, i) => {
              const config = (typeConfig as Record<string, (typeof typeConfig)["SYSTEM"]>)[notification.type] ?? typeConfig.SYSTEM;
              return (
                <div
                  key={notification.id}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "16px 20px",
                    borderBottom: i < notifications.length - 1 ? "1px solid var(--color-border)" : "none",
                    background: !notification.read ? "var(--color-accent-lighter)" : "transparent",
                    transition: "background 200ms ease",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      background: config.bg,
                      color: config.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {config.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: !notification.read ? 600 : 400,
                          color: "var(--color-text-primary)",
                          marginBottom: 4,
                        }}
                      >
                        {notification.title}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {!notification.read && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: "var(--color-accent)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                      {notification.body}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <Badge variant="default" size="sm">
                        {notification.type.charAt(0) + notification.type.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
