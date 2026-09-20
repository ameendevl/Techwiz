import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { StatCard, Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Users, Activity, Bell, Briefcase, ArrowRight,
  CheckCircle2, Clock, Shield, Zap
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [user, recentNotifications, loginActivities] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    }),
    db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.loginActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  if (!user) redirect("/login");

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const unreadCount = recentNotifications.filter((n) => !n.read).length;

  return (
    <div>
      <div
        style={{
          marginBottom: 32,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: 4 }}>
            {greeting},
          </p>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
            }}
          >
            {user.name.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 6 }}>
            {formatDate(new Date(), { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "12px 16px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Avatar src={user.image} name={user.name} size="md" />
          <div>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {user.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    user.status === "ACTIVE" ? "var(--color-success)" : "var(--color-warning)",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {user.status === "ACTIVE" ? "Active" : "Pending verification"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Account Status"
          value={user.status === "ACTIVE" ? "Active" : "Pending"}
          icon={<CheckCircle2 size={18} />}
          accent={user.status === "ACTIVE"}
        />
        <StatCard
          label="Notifications"
          value={unreadCount}
          icon={<Bell size={18} />}
          change={unreadCount > 0 ? undefined : { value: 0, label: "all read" }}
        />
        <StatCard
          label="Member Since"
          value={formatDate(user.createdAt, { month: "short", year: "numeric" })}
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Account Role"
          value={user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "ADMIN" ? "Admin" : "User"}
          icon={<Shield size={18} />}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 24,
          alignItems: "start",
        }}
        className="responsive-grid"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card padding="lg">
            <CardHeader>
              <div>
                <CardTitle>Project Workspace</CardTitle>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: 4 }}>
                  Your Vertex project module will appear here
                </p>
              </div>
              <div
                style={{
                  background: "var(--color-accent-light)",
                  color: "var(--color-accent-text)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "var(--radius-full)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Coming Soon
              </div>
            </CardHeader>

            <div
              style={{
                border: "2px dashed var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "48px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--radius-xl)",
                  background: "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                  marginBottom: 4,
                }}
              >
                <Briefcase size={24} />
              </div>
              <h3
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                Project module not yet integrated
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  maxWidth: 380,
                  lineHeight: 1.6,
                }}
              >
                This placeholder will be replaced with your Vertex project functionality.
                The authentication and dashboard infrastructure is fully ready.
              </p>
              <Link href="/workspace">
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-accent-light)",
                    color: "var(--color-accent-text)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    marginTop: 4,
                  }}
                >
                  Explore workspace <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
              {[
                { label: "Edit Profile", href: "/profile", icon: <Users size={18} />, desc: "Update your info" },
                { label: "Notifications", href: "/notifications", icon: <Bell size={18} />, desc: `${unreadCount} unread` },
                { label: "Security", href: "/profile#security", icon: <Shield size={18} />, desc: "Change password" },
                { label: "Workspace", href: "/workspace", icon: <Briefcase size={18} />, desc: "Your project" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col gap-2 p-3.5 rounded-md border border-[var(--color-border)] no-underline text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-lighter)]"
                >
                  <div style={{ color: "var(--color-accent)" }}>{action.icon}</div>
                  <div>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {action.label}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                      {action.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <Link href="/notifications" style={{ fontSize: "0.75rem", color: "var(--color-accent)" }}>
                View all
              </Link>
            </CardHeader>
            {recentNotifications.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", textAlign: "center", padding: "24px 0" }}>
                No notifications yet
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      background: !n.read ? "var(--color-accent-lighter)" : "transparent",
                      transition: "background 150ms ease",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: !n.read ? "var(--color-accent)" : "var(--color-border)",
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: !n.read ? 600 : 400,
                          color: "var(--color-text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        {n.title}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {formatRelativeTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Activity</CardTitle>
            </CardHeader>
            {loginActivities.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", textAlign: "center", padding: "16px 0" }}>
                No recent activity
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loginActivities.map((activity) => (
                  <div
                    key={activity.id}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-md)",
                        background:
                          activity.status === "success"
                            ? "var(--color-success-light)"
                            : "var(--color-danger-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Activity
                        size={14}
                        style={{
                          color:
                            activity.status === "success"
                              ? "var(--color-success)"
                              : "var(--color-danger)",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-text-primary)", fontWeight: 500 }}>
                        {activity.provider === "CREDENTIALS" ? "Email / Password" : activity.provider}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {formatRelativeTime(activity.createdAt)} · {activity.device ?? "Unknown device"}
                      </p>
                    </div>
                    <Badge variant={activity.status === "success" ? "success" : "danger"} size="sm">
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div
            style={{
              background: "var(--color-accent-light)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Zap size={16} style={{ color: "var(--color-accent)" }} />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--color-accent-text)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Platform Update
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-accent-text)", marginBottom: 6 }}>
              Foundation is ready
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-accent-text)", opacity: 0.8, lineHeight: 1.6 }}>
              Your authentication and dashboard infrastructure is fully set up. The project workspace is ready for integration.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
