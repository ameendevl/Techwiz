import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Settings, ShieldAlert, Cpu, Key, Database, Globe } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "System Settings — Admin" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const settingsRecords = await db.systemSetting.findMany();
  const settingsMap = settingsRecords.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const oauthStatus = {
    google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    github: !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
    linkedin: !!(process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET),
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
          Platform Settings
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: 4 }}>
          System-wide environment configurations, provider health, and operational flags
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Settings size={18} style={{ color: "var(--color-text-muted)" }} />
              <CardTitle>System Configuration</CardTitle>
            </div>
          </CardHeader>
          <SettingsForm initialSettings={settingsMap} isSuperAdmin={isSuperAdmin} />
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Key size={18} style={{ color: "var(--color-text-muted)" }} />
              <CardTitle>Connected Authentication Providers</CardTitle>
            </div>
          </CardHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Credentials Auth</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Email & bcrypt password hashing
              </p>
            </div>

            <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Google OAuth</span>
                <Badge variant={oauthStatus.google ? "success" : "default"} size="sm">
                  {oauthStatus.google ? "Configured" : "Placeholder"}
                </Badge>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {oauthStatus.google ? "Production ready" : "Awaiting AUTH_GOOGLE_ID"}
              </p>
            </div>

            <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>GitHub OAuth</span>
                <Badge variant={oauthStatus.github ? "success" : "default"} size="sm">
                  {oauthStatus.github ? "Configured" : "Placeholder"}
                </Badge>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {oauthStatus.github ? "Production ready" : "Awaiting AUTH_GITHUB_ID"}
              </p>
            </div>

            <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>LinkedIn OAuth</span>
                <Badge variant={oauthStatus.linkedin ? "success" : "default"} size="sm">
                  {oauthStatus.linkedin ? "Configured" : "Placeholder"}
                </Badge>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {oauthStatus.linkedin ? "Production ready" : "Awaiting AUTH_LINKEDIN_ID"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Cpu size={18} style={{ color: "var(--color-text-muted)" }} />
              <CardTitle>Architecture & Runtime</CardTitle>
            </div>
          </CardHeader>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Framework</p>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", marginTop: 2 }}>Next.js 16 (App Router)</p>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>ORM</p>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", marginTop: 2 }}>Prisma ORM 6</p>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Authentication</p>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", marginTop: 2 }}>NextAuth v5 (Auth.js)</p>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Database Engine</p>
              <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", marginTop: 2 }}>PostgreSQL / Compatible</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
