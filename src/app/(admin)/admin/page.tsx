import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/utils";
import { StatCard, Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge, RoleBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  Users, UserCheck, UserPlus, ShieldCheck,
  UserX, Activity, TrendingUp, Globe
} from "lucide-react";
import { AdminCharts } from "@/components/admin/AdminCharts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    verifiedUsers,
    suspendedUsers,
    recentLogins,
    recentAuditLogs,
    usersByRole,
    registrationsByDay,
  ] = await Promise.all([
    db.user.count({ where: { status: { not: "DELETED" } } }),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        status: { not: "DELETED" },
      },
    }),
    db.user.count({ where: { emailVerified: { not: null } } }),
    db.user.count({ where: { status: "SUSPENDED" } }),
    db.loginActivity.findMany({
      where: { status: "success" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, image: true, email: true } } },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, image: true } } },
    }),
    db.user.groupBy({
      by: ["role"],
      _count: { role: true },
      where: { status: { not: "DELETED" } },
    }),
    db.user.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        status: { not: "DELETED" },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const roleData = usersByRole.map((r) => ({
    name: r.role === "SUPER_ADMIN" ? "Super Admin" : r.role === "ADMIN" ? "Admin" : "User",
    value: r._count.role,
  }));

  const regMap: Record<string, number> = {};
  for (const u of registrationsByDay) {
    const d = new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    regMap[d] = (regMap[d] ?? 0) + 1;
  }
  const regData = Object.entries(regMap).map(([date, count]) => ({ date, count }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
          Platform overview and user management
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <StatCard label="Total Users" value={totalUsers} icon={<Users size={18} />} />
        <StatCard label="Active Users" value={activeUsers} icon={<UserCheck size={18} />} accent />
        <StatCard label="New This Month" value={newUsersThisMonth} icon={<UserPlus size={18} />} />
        <StatCard label="Verified" value={verifiedUsers} icon={<ShieldCheck size={18} />} />
        <StatCard label="Suspended" value={suspendedUsers} icon={<UserX size={18} />} />
      </div>

      <AdminCharts registrationData={regData} roleData={roleData} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}
           className="admin-tables-grid">

        <Card padding="none">
          <CardHeader style={{ padding: "16px 20px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={16} style={{ color: "var(--color-text-muted)" }} />
              <CardTitle>Recent Login Activity</CardTitle>
            </div>
          </CardHeader>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Provider</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.map((login) => (
                  <tr key={login.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar src={login.user.image} name={login.user.name} size="xs" />
                        <div>
                          <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                            {login.user.name}
                          </p>
                          <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                            {login.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", textTransform: "capitalize", color: "var(--color-text-secondary)" }}>
                        {login.provider.toLowerCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {formatRelativeTime(login.createdAt)}
                    </td>
                  </tr>
                ))}
                {recentLogins.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "24px" }}>
                      No recent logins
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padding="none">
          <CardHeader style={{ padding: "16px 20px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} style={{ color: "var(--color-text-muted)" }} />
              <CardTitle>Recent Audit Logs</CardTitle>
            </div>
          </CardHeader>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                          background:
                            log.status === "failure"
                              ? "var(--color-danger-light)"
                              : "var(--color-surface)",
                          color:
                            log.status === "failure"
                              ? "var(--color-danger)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        {log.action.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                      {log.user?.name ?? "System"}
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {formatRelativeTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
                {recentAuditLogs.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "24px" }}>
                      No audit logs
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-tables-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
