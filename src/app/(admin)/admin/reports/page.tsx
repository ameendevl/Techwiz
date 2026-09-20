import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Download, Table, Shield, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports — Admin" };

export default async function AdminReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
          System Reports & Export
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
          Generate structured CSV exports and competition compliance reports
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: "var(--color-accent-light)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  User Directory Export
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                  Comprehensive export of user credentials status, roles, registration dates, and email verification flags.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <a
                href="/api/admin/reports/users/csv"
                download="users_export.csv"
                style={{ textDecoration: "none" }}
              >
                <Button variant="primary" size="sm" leftIcon={<Download size={14} />}>
                  Export CSV
                </Button>
              </a>
              <a
                href="/api/admin/reports/users"
                download="users_export.json"
                style={{ textDecoration: "none" }}
              >
                <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>
                  Export JSON
                </Button>
              </a>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: "var(--color-surface)", color: "var(--color-text-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  Security & Audit Trail Log
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                  Complete historical log of administrative actions, user logins, role elevation, and security occurrences.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <a
                href="/api/admin/reports/audit/csv"
                download="audit_logs.csv"
                style={{ textDecoration: "none" }}
              >
                <Button variant="primary" size="sm" leftIcon={<Download size={14} />}>
                  Export CSV
                </Button>
              </a>
              <a
                href="/api/admin/reports/audit"
                download="audit_logs.json"
                style={{ textDecoration: "none" }}
              >
                <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>
                  Export JSON
                </Button>
              </a>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: "var(--radius-md)", background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Table size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  Competition Project Readiness Checklist
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                  Vertex compliance report covering system architecture, security implementation, and modular readiness.
                </p>
              </div>
            </div>
            <a
              href="/api/admin/reports/compliance"
              download="Vertex_Readiness_Report.txt"
              style={{ textDecoration: "none" }}
            >
              <Button variant="primary" size="sm" leftIcon={<FileText size={14} />}>
                Generate & Download Report
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
