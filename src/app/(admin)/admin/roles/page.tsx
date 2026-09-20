import { Fragment } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Shield, Check, X, Info } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Roles & Permissions — Admin" };

interface PermissionItem {
  id: string;
  name: string;
  description: string;
  category: string;
  superAdmin: boolean;
  admin: boolean;
  user: boolean;
}

const permissions: PermissionItem[] = [
  { id: "users.view", name: "View Users", description: "View user directory, profiles and status", category: "User Management", superAdmin: true, admin: true, user: false },
  { id: "users.create", name: "Create Users", description: "Manually invite or provision new user accounts", category: "User Management", superAdmin: true, admin: true, user: false },
  { id: "users.edit", name: "Edit Users", description: "Modify name, email, role, and profile details", category: "User Management", superAdmin: true, admin: true, user: false },
  { id: "users.suspend", name: "Suspend & Activate", description: "Change user status between active and suspended", category: "User Management", superAdmin: true, admin: true, user: false },
  { id: "users.delete", name: "Delete Users", description: "Permanently delete user records and cascade data", category: "User Management", superAdmin: true, admin: false, user: false },
  
  { id: "roles.manage", name: "Manage Roles", description: "Promote or demote user roles up to Admin level", category: "Roles & Security", superAdmin: true, admin: false, user: false },
  { id: "roles.super", name: "Assign Super Admin", description: "Grant or revoke Super Admin privileges", category: "Roles & Security", superAdmin: true, admin: false, user: false },
  { id: "security.password_reset", name: "Force Password Reset", description: "Trigger password reset email for any user", category: "Roles & Security", superAdmin: true, admin: true, user: false },

  { id: "audit.view", name: "View Audit Logs", description: "Inspect system security events and audit trails", category: "System & Audit", superAdmin: true, admin: true, user: false },
  { id: "activity.view", name: "View Login Activities", description: "Inspect login logs, IP addresses, and user devices", category: "System & Audit", superAdmin: true, admin: true, user: false },
  { id: "notifications.broadcast", name: "Broadcast Notifications", description: "Send announcements to all users or role groups", category: "System & Audit", superAdmin: true, admin: true, user: false },
  { id: "settings.manage", name: "Platform Settings", description: "Configure system maintenance, registration, and branding", category: "System & Audit", superAdmin: true, admin: false, user: false },

  { id: "profile.self", name: "Manage Own Profile", description: "Update name, bio, avatar, and social links", category: "Personal Workspace", superAdmin: true, admin: true, user: true },
  { id: "password.self", name: "Change Password", description: "Update own login credentials and password", category: "Personal Workspace", superAdmin: true, admin: true, user: true },
  { id: "workspace.access", name: "Access Project Workspace", description: "Access the Vertex competition project workspace module", category: "Personal Workspace", superAdmin: true, admin: true, user: true },
];

export default async function AdminRolesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const roleCounts = await db.user.groupBy({
    by: ["role"],
    where: { status: { not: "DELETED" } },
    _count: { role: true },
  });

  const countsMap = roleCounts.reduce((acc, curr) => {
    acc[curr.role] = curr._count.role;
    return acc;
  }, {} as Record<string, number>);

  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
          Roles & Permissions
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
          Role-based access control matrix and permission definitions
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Super Admin</span>
                <Badge variant="superadmin" size="sm">Full Access</Badge>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Unrestricted administrative and security control
              </p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "#F3E8FF", color: "#7E22CE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} />
            </div>
          </div>
          <div style={{ paddingTop: 12, borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Assigned users</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {countsMap["SUPER_ADMIN"] ?? 0}
            </span>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>Admin</span>
                <Badge variant="info" size="sm">Management</Badge>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                User management and operational oversight
              </p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} />
            </div>
          </div>
          <div style={{ paddingTop: 12, borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Assigned users</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {countsMap["ADMIN"] ?? 0}
            </span>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>User</span>
                <Badge variant="default" size="sm">Standard</Badge>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Member access to self-profile and project modules
              </p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--color-surface)", color: "var(--color-text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} />
            </div>
          </div>
          <div style={{ paddingTop: 12, borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Assigned users</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {countsMap["USER"] ?? 0}
            </span>
          </div>
        </Card>
      </div>

      <Card padding="none">
        <CardHeader style={{ padding: "20px 24px 16px" }}>
          <div>
            <CardTitle>Permission Matrix</CardTitle>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: 3 }}>
              Exact functional permissions enforced across all API routes and UI views
            </p>
          </div>
        </CardHeader>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 260 }}>Capability</th>
                <th style={{ width: 130, textAlign: "center" }}>Super Admin</th>
                <th style={{ width: 130, textAlign: "center" }}>Admin</th>
                <th style={{ width: 130, textAlign: "center" }}>User</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <Fragment key={cat}>
                  <tr style={{ background: "var(--color-surface-subtle)" }}>
                    <td
                      colSpan={4}
                      style={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-text-muted)",
                        padding: "10px 20px",
                      }}
                    >
                      {cat}
                    </td>
                  </tr>
                  {permissions
                    .filter((p) => p.category === cat)
                    .map((item) => (
                      <tr key={item.id} style={{ background: "transparent" }}>
                        <td style={{ padding: "14px 20px" }}>
                          <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                            {item.name}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                            {item.description}
                          </p>
                        </td>
                        <td style={{ textAlign: "center", padding: "14px" }}>
                          {item.superAdmin ? (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "var(--color-accent-light)", color: "var(--color-accent)" }}>
                              <Check size={13} strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "var(--color-surface)", color: "var(--color-text-muted)" }}>
                              <X size={13} />
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "center", padding: "14px" }}>
                          {item.admin ? (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "var(--color-accent-light)", color: "var(--color-accent)" }}>
                              <Check size={13} strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "var(--color-surface)", color: "var(--color-text-muted)" }}>
                              <X size={13} />
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "center", padding: "14px" }}>
                          {item.user ? (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "var(--color-accent-light)", color: "var(--color-accent)" }}>
                              <Check size={13} strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "var(--color-surface)", color: "var(--color-text-muted)" }}>
                              <X size={13} />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
