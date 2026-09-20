import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { BookOpen, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit Logs — Admin" };

interface SearchParams {
  page?: string;
  action?: string;
  status?: string;
  search?: string;
  [key: string]: string | undefined;
}

const PAGE_SIZE = 20;

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const actionFilter = params.action ?? "";
  const statusFilter = params.status ?? "";
  const search = params.search ?? "";

  const where: any = {
    ...(actionFilter ? { action: actionFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search
      ? {
          OR: [
            { user: { email: { contains: search } } },
            { user: { name: { contains: search } } },
            { targetId: { contains: search } },
            { ip: { contains: search } },
          ],
        }
      : {}),
  };

  const [total, logs] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
            Audit Logs
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
            Immutable chronological record of security and administrative operations ({total.toLocaleString()} events)
          </p>
        </div>
      </div>

      <Card padding="sm" style={{ marginBottom: 20 }}>
        <form method="get" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by user, email, IP..."
            style={{
              flex: "1 1 220px",
              padding: "7px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "0.8125rem",
              outline: "none",
              background: "var(--color-white)",
            }}
          />

          <select
            name="action"
            defaultValue={actionFilter}
            style={{
              padding: "7px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "0.8125rem",
              background: "var(--color-white)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="USER_REGISTER">USER_REGISTER</option>
            <option value="USER_PASSWORD_CHANGE">USER_PASSWORD_CHANGE</option>
            <option value="USER_PROFILE_UPDATE">USER_PROFILE_UPDATE</option>
            <option value="USER_SUSPENDED">USER_SUSPENDED</option>
            <option value="USER_ACTIVATED">USER_ACTIVATED</option>
            <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
            <option value="USER_DELETED">USER_DELETED</option>
            <option value="ADMIN_ACTION">ADMIN_ACTION</option>
            <option value="SETTINGS_CHANGED">SETTINGS_CHANGED</option>
            <option value="FAILED_LOGIN">FAILED_LOGIN</option>
          </select>

          <select
            name="status"
            defaultValue={statusFilter}
            style={{
              padding: "7px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "0.8125rem",
              background: "var(--color-white)",
              color: "var(--color-text-primary)",
            }}
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>

          <button
            type="submit"
            style={{
              padding: "7px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--color-accent)",
              color: "#fff",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Filter
          </button>

          {(search || actionFilter || statusFilter) && (
            <Link
              href="/admin/audit-logs"
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                padding: "7px 8px",
              }}
            >
              Reset
            </Link>
          )}
        </form>
      </Card>

      <Card padding="none">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Timestamp</th>
                <th>Action</th>
                <th>Initiated By</th>
                <th>Target</th>
                <th>IP Address</th>
                <th style={{ width: 90, textAlign: "center" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                    <div>{formatDate(log.createdAt)}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", opacity: 0.8 }}>
                      {formatRelativeTime(log.createdAt)}
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "var(--radius-sm)",
                        background:
                          log.action.includes("DELETE") || log.action.includes("SUSPEND")
                            ? "var(--color-danger-light)"
                            : log.action.includes("ROLE") || log.action.includes("ADMIN")
                            ? "var(--color-warning-light)"
                            : "var(--color-surface)",
                        color:
                          log.action.includes("DELETE") || log.action.includes("SUSPEND")
                            ? "var(--color-danger)"
                            : log.action.includes("ROLE") || log.action.includes("ADMIN")
                            ? "var(--color-warning)"
                            : "var(--color-text-primary)",
                      }}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td>
                    {log.user ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar src={log.user.image} name={log.user.name} size="xs" />
                        <div>
                          <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                            {log.user.name}
                          </p>
                          <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                            {log.user.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                        System / Anonymous
                      </span>
                    )}
                  </td>

                  <td>
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                      {log.targetType ? `${log.targetType} (${log.targetId?.slice(0, 8) ?? "N/A"})` : "—"}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--color-text-muted)" }}>
                      {log.ip || "127.0.0.1"}
                    </span>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {log.status === "success" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-success)", fontSize: "0.75rem", fontWeight: 500 }}>
                        <CheckCircle2 size={14} /> Success
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--color-danger)", fontSize: "0.75rem", fontWeight: 500 }}>
                        <XCircle size={14} /> Fail
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--color-text-muted)" }}>
                    <BookOpen size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                    <p style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                      No audit events found
                    </p>
                    <p style={{ fontSize: "0.75rem", marginTop: 4 }}>
                      Audit events are logged automatically as users authenticate and administrators perform actions.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              borderTop: "1px solid var(--color-border)",
              fontSize: "0.8125rem",
              color: "var(--color-text-muted)",
            }}
          >
            <span>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {page > 1 && (
                <Link
                  href={`/admin/audit-logs?page=${page - 1}&action=${actionFilter}&status=${statusFilter}&search=${search}`}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    textDecoration: "none",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/audit-logs?page=${page + 1}&action=${actionFilter}&status=${statusFilter}&search=${search}`}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border)",
                    textDecoration: "none",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
